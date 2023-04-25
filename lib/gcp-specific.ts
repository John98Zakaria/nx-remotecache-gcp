import { type Bucket, type File, Storage } from '@google-cloud/storage';

export interface GCPBucketIdentifier {
    googleProject: string;
    bucketName: string;
}

/**
 * Combines the environment variable configuration with the nx.json config
 * @param options object containing the nx runner configuration
 */
export function buildConfiguration(
    options: Partial<GCPBucketIdentifier>
): Partial<GCPBucketIdentifier> {
    const bucketName =
        process.env.NXCACHE_GCP_BUCKET_NAME ?? options?.bucketName;
    const projectId = process.env.NXCACHE_GCP_PROJECT ?? options?.googleProject;

    return { bucketName, googleProject: projectId };
}

/**
 * Verifies that all required configurations have been provided
 * @param options object containing the nx runner configuration
 * */
export function verifyConfiguration(
    options: Partial<GCPBucketIdentifier>
): GCPBucketIdentifier {
    const bucketName = options?.bucketName;
    const projectId = options?.googleProject;

    if (bucketName === undefined) {
        throw new Error(
            'You forgot to specify a google bucket name,' +
                ' please check your nx.json or ' +
                'set the environment variable NXCACHE_GCP_BUCKET_NAME'
        );
    }
    if (projectId === undefined) {
        throw new Error(
            'You forgot to specify a google project,' +
                ' please check your nx.json or ' +
                'set the environment variable NXCACHE_GCP_BUCKET_NAME'
        );
    }

    return { bucketName, googleProject: projectId };
}

/**
 * Gets a reference to the Google bucket and verifies its existence
 * @param configuration a configuration identifying the Google bucket
 */
export async function getGCSBucket(configuration: GCPBucketIdentifier) {
    const bucketName =
        process.env.NXCACHE_GCP_BUCKET_NAME ?? configuration.bucketName;
    const storageClient = new Storage({
        projectId: configuration.googleProject,
        retryOptions: {
            autoRetry: true,
            maxRetries: 4,
        },
    });
    const bucket = storageClient.bucket(bucketName);

    const [bucketExists] = await bucket.exists();
    if (!bucketExists) {
        throw Error(`The given Bucket ${bucketName} does not exist`);
    }

    return bucket;
}

/**
 * Constructs a refrence to a Google bucket file
 * @param bucket
 * @param filename
 */
export function constructGCSFileRefrence(bucket: Bucket, filename: string) {
    return bucket.file(filename);
}

/**
 * Checks whether a file exists in a bucket
 * @param bucketFile Reference to file in a bucket
 */
export async function bucketFileExists(bucketFile: File): Promise<boolean> {
    const [exists] = await bucketFile.exists();
    return exists;
}
