import { createCustomRunner, initEnv } from 'nx-remotecache-custom';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { GCPBucketIdentifier } from './gcp-specific';
import {
    bucketFileExists,
    buildConfiguration,
    constructGCSFileReference,
    getGCSBucket,
    typeCheckConfiguration,
} from './gcp-specific';
import type { RemoteCacheImplementation } from 'nx-remotecache-custom/types/remote-cache-implementation';

export default createCustomRunner<Partial<GCPBucketIdentifier>>(
    async (options): Promise<RemoteCacheImplementation> => {
        initEnv(options);
        const configuration = buildConfiguration(options);
        const typeCheckedConfiguration = typeCheckConfiguration(configuration);
        const bucket = await getGCSBucket(typeCheckedConfiguration);

        return {
            name: 'Google Cloud Bucket',
            fileExists: async (filename) => {
                const bucketFile = constructGCSFileReference(bucket, filename);
                return await bucketFileExists(bucketFile);
            },
            retrieveFile: async (filename) => {
                const bucketFile = constructGCSFileReference(bucket, filename);
                const downloadedFile = bucketFile.download();
                return Readable.from(await downloadedFile);
            },
            storeFile: async (filename, stream) => {
                const uploadStream = constructGCSFileReference(
                    bucket,
                    filename,
                ).createWriteStream();
                await pipeline(stream, uploadStream);
            },
        };
    },
);
