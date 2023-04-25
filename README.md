[![npm package link](https://img.shields.io/npm/v/nx-remotecache-azure)](https://www.npmjs.com/package/nx-remotecache-azure)

# nx-remotecache-gcp

A task runner for [@nrwl/nx](https://nx.dev) that uses a Google Cloud Storage bucket as a remote cache.
This enables all team members and CI servers to share a single cache. 
The concept and benefits of [Cache Task Results](https://nx.dev/core-features/cache-task-results) are explained in the Nx documentation.

This package was built with [nx-remotecache-custom](https://www.npmjs.com/package/nx-remotecache-custom) 🙌

## Setup

1. Add Nx to your workspace [guide](https://nx.dev/getting-started/installation)
2. Install this package as dev dependency.
    ```shell
    npm install --save-dev nx-remotecache-gcp
    ```
3. Authenticate to Google Cloud
The user authenticating must have read/write access to the bucket as well as `storage.buckets.get` permission
   1. Locally using google cloud CLI using `gcloud auth`
   2. For Github actions use [google-github-actions/auth](https://github.com/google-github-actions/auth)

# Configuration

Note: Environment variables have precedence over

| Parameter      | Description                                   | Environment Variable / .env | `nx.json`       |
|----------------|-----------------------------------------------|-----------------------------|-----------------|
| Google Project | Project Name in which the Bucket resides      | `NXCACHE_GCP_PROJECT`       | `googleProject` |
| Bucket Name    | Bucket name in which the cache will be stored | `NXCACHE_GCP_BUCKET_NAME`   | `bucketName`    |

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx-remotecache-gcp",
      "options": {
        "googleProject": "my-google-project-id",
        "bucketName": "my-nx-cache-bucket",
        "cacheableOperations": ["build", "test", "lint", "e2e"]
      }
    }
  }
}
```

## Run it 🚀

Running tasks should now show the storage or retrieval from the remote cache:

```
------------------------------------------------------------------------------
Remote cache hit: Google Cloud Bucket
File: 1fb268062785d739b5a43c1e4032fd7731c6080e2249e87a00e568b3c41acf9c.tar.gz
------------------------------------------------------------------------------
```

