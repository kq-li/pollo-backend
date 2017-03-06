/**
 * A standalone script for configuring the local couchbase database.
 */

// Read .env file
import * as dotenv from 'dotenv';
dotenv.config();

import {CreateBucketOptions, AsyncClusterManager} from 'couchbase';
import * as Promise from 'bluebird';
import * as util from 'util';

import {couchbaseClient} from './couchbaseClient';
import * as constants from '../helpers/constants';

// How we want to setup these buckets.
let bucket_options = {
  bucketType: 'couchbase',
  ramQuotaMB: 100,
  replicaNumber: 1,
  saslPassword: constants.BUCKET_PASSWORD in process.env
    ? process.env[constants.BUCKET_PASSWORD] : '',
} as CreateBucketOptions;

let main = (): void => {
  let clusterManager = couchbaseClient.openAsyncClusterManager()
  clusterManager.listBucketsAsync().then((rows) => {
    // Delete existing buckets.
    console.log('Deleting existing buckets...');
    return Promise.each(rows, (row) => {
      return clusterManager.removeBucketAsync(row.name);
    });
  }).then(() => {
    console.log('Adding clicker buckets...');
    return Promise.each(constants.BUCKETS, (name) => {
      console.log(util.format("  Adding bucket %s", name))
      return clusterManager.createBucketAsync(name, bucket_options);
    });
  }).then(() => {
    console.log('Adding primary key index to each bucket');
    return Promise.each(constants.BUCKETS, (name) => {
      console.log(util.format("  Adding primary key to bucket %s", name))
      return Promise.using(couchbaseClient.openAsyncBucket(name), (bucket) => {
        // Coerce manager to be `any` because the typescript definition
        // for BucketManager is missing createPrimaryKeyIndex()
        let manager: any = bucket.manager();
        return new Promise((fulfill, reject) => {
          return manager.createPrimaryIndex(() => {
            return fulfill({});
          });
        });
      });
    });
  }).then(() => {
    return console.log('Setup completed, buckets successfully created');
  }).done();
}

// Runs the main function only on invocation, not import.
if (require.main === module) {
  main();
}
