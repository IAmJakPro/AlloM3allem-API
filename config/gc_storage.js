/**
 * Google Cloud Storage Configuration
 */

const Cloud = require('@google-cloud/storage');
const path = require('path');
const serviceKey = path.join(__dirname, '..', process.env.GC_FILENAME);

const { Storage } = Cloud;
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: process.env.GC_PROJECT_ID,
});

module.exports = storage;
