import { type Bucket, type File, Storage } from '@google-cloud/storage';

export interface GCPBucketOptions {
    googleProject: string;
    bucketName: string;
}

export async function getGCSBucket(options: GCPBucketOptions) {
    const bucketURL = options.bucketName;
    const storageClient = new Storage({
        projectId: options.googleProject,
        retryOptions: {
            autoRetry: true,
            maxRetries: 4,
        },
    });
    const bucket = storageClient.bucket(bucketURL);

    const [bucketExists] = await bucket.exists();
    if (!bucketExists) {
        throw Error(`The given Bucket ${bucketURL} does not exist`);
    }

    return bucket;
}

export function constructGCSFile(bucket: Bucket, filename: string) {
    return bucket.file(filename);
}

export async function bucketFileExists(bucketFile: File): Promise<boolean> {
    const [exists] = await bucketFile.exists();
    return exists;
}
