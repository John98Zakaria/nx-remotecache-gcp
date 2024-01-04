import { createCustomRunner, initEnv } from 'nx-remotecache-custom';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { GCPBucketIdentifier } from './gcp-specific';
import {
    bucketFileExists,
    buildConfiguration,
    constructGCSFileReference,
    getGCSBucket,
    verifyConfiguration,
} from './gcp-specific';
import type { RemoteCacheImplementation } from 'nx-remotecache-custom/types/remote-cache-implementation';

export default createCustomRunner<Partial<GCPBucketIdentifier>>(
    async (options): Promise<RemoteCacheImplementation> => {
        let bucket;
        initEnv(options);
        const configuration = buildConfiguration(options);
        const verifiedConfiguration = verifyConfiguration(configuration);
        const getBucket = async () => {
            if (!bucket) {
                bucket = await getGCSBucket(verifiedConfiguration);
            }
            return bucket;
        };

        return {
            name: 'Google Cloud Bucket',
            fileExists: async (filename) => {
                const bucketFile = constructGCSFileReference(await getBucket(), filename);
                return await bucketFileExists(bucketFile);
            },
            retrieveFile: async (filename) => {
                const bucketFile = constructGCSFileReference(await getBucket(), filename);
                const downloadedFile = bucketFile.download();
                return Readable.from(await downloadedFile);
            },
            storeFile: async (filename, stream) => {
                const uploadStream = constructGCSFileReference(
                    await getBucket(),
                    filename,
                ).createWriteStream();
                await pipeline(stream, uploadStream);
            },
        };
    },
);
