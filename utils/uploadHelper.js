/**
 * This is an upload helper is for upload images to Google cloud storage
 */

// Thirs-party libraries
const util = require('util');
const uuid = require('uuid').v4;

// Utils
const gc = require('../config/gc_storage');

const bucket = gc.bucket(process.env.BUCKET_NAME);
const { format } = util;

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

const uploadImage = (file, bucketFolder) =>
  new Promise((resolve, reject) => {
    const { originalname, buffer } = file;

    //const blob = bucket.file(originalname.replace(/ /g, '_'));
    const fileName = `${bucketFolder}/${uuid()}-${originalname}`;
    const blob = bucket.file(fileName);
    //blob.setMetadata({ temporaryHold: true });
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream
      .on('finish', () => {
        //setTemporaryHold(blob.name);
        //setTemporaryHold(fileName);
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        resolve(publicUrl);
      })
      .on('error', (err) => {
        console.log('ERR: ', err);
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });

/**
 * Delete an image/file from Gogole cloud storage
 * @param {string} fileName - file name to be deleted
 * @returns
 */
const deleteImage = async (fileName) => {
  const blob = bucket.file(fileName);
  return blob
    .delete()
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
};

exports.uploadImage = uploadImage;
exports.deleteImage = deleteImage;
