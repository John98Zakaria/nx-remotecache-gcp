import { createCustomRunner, initEnv } from 'nx-remotecache-custom';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { GCPBucketOptions } from './gcp-specific';
import {
    bucketFileExists,
    constructGCSFile,
    getGCSBucket,
} from './gcp-specific';
import type { RemoteCacheImplementation } from 'nx-remotecache-custom/types/remote-cache-implementation';

export default createCustomRunner<GCPBucketOptions>(
    async (options): Promise<RemoteCacheImplementation> => {
        initEnv(options);
        const bucket = await getGCSBucket(options);

        return {
            name: 'Google Cloud Bucket',
            fileExists: async (filename) => {
                const bucketFile = constructGCSFile(bucket, filename);
                return await bucketFileExists(bucketFile);
            },
            retrieveFile: async (filename) => {
                const bucketFile = constructGCSFile(bucket, filename);
                const downloadedFile = bucketFile.download();
                return Readable.from(await downloadedFile);
            },
            storeFile: async (filename, stream) => {
                const uploadStream = constructGCSFile(
                    bucket,
                    filename
                ).createWriteStream();
                await pipeline(stream, uploadStream);
            },
        };
    }
);
