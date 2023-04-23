import { createCustomRunner, initEnv } from "nx-remotecache-custom";
import { Storage } from "@google-cloud/storage";

const ENV_GCP_BUCKET_URL = "gs://";

const getEnv = (key: string) => process.env[key];

async function getGCPFileClient(filename: string, options: AzureBlobRunnerOptions) {
  const bucketURL = process.env.GCP_BUCKET_URL;
  const storageClient = new Storage();
  const bucket = storageClient.bucket(bucketURL);
  const bucketFile = bucket.file(filename);


  if (!await bucket.exists()) {
    throw Error(
      `The given Bucket ${bucketURL} does not exist`
    );
  }

  return bucketFile;
}

interface AzureBlobRunnerOptions {
  connectionString: string;
  accountKey: string;
  accountName: string;
  container: string;
  azureUrl: string;
  sasUrl: string;
}

export default createCustomRunner<AzureBlobRunnerOptions>(async (options) => {
  initEnv(options);
  const GCPFile = async (filename: string) => await getGCPFileClient(filename, options);

  return {
    name: "Azure Blob Storage",
    fileExists: async (filename) => (await GCPFile(filename)).exists(),
    retrieveFile: async (filename) =>
      (await blob(filename).download()).readableStreamBody!,
    storeFile: (filename, stream) => blob(filename).uploadStream(stream)
  };
});
