const path = require("path");

const databaseFS = require("./databaseFS.js");

const headFileName = "head.json";
const bodyFileName = "body.json";

// ---------------- High level Functions
function createCollection(parentPath) {
  // Only create one when it is not created
  return new Promise(async (resolve, reject) => {
    try {
      // Generate path
      const headPath = path.join(parentPath, headFileName);
      const bodyPath = path.join(parentPath, bodyFileName);
      // parent folder
      const isParentCreated = await databaseFS.exists(parentPath);
      if (!isParentCreated) await databaseFS.createFolder(parentPath);
      // head file
      const isHeadCreated = await databaseFS.exists(headPath);
      if (!isHeadCreated) await databaseFS.write(headPath, []);
      // body file
      const isBodyCreated = await databaseFS.exists(bodyPath);
      if (!isBodyCreated) await databaseFS.write(bodyPath, []);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function deleteCollection(parentPath) {
  return new Promise(async (resolve, reject) => {
    try {
      // parent folder
      const isParentCreated = await databaseFS.exists(parentPath);
      if (isParentCreated) await databaseFS.deleteFolder(parentPath);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function readCollection(parentPath) {
  // Only create one when it is not created
  return new Promise(async (resolve, reject) => {
    try {
      const headPath = path.join(parentPath, headFileName);
      const bodyPath = path.join(parentPath, bodyFileName);
      const [headArray, bodyArray] = await Promise.all([
        databaseFS.read(headPath),
        databaseFS.read(bodyPath),
      ]);
      // create a joined array
      let docs = [];
      for (let index = 0; index < headArray.length; index++) {
        docs.push({ ...headArray[index], ...bodyArray[index] });
      }
      resolve(docs);
    } catch (error) {
      reject(error);
    }
  });
}
function readCollectionHead(parentPath) {
  // Only create one when it is not created
  return new Promise(async (resolve, reject) => {
    try {
      const headPath = path.join(parentPath, headFileName);
      const file = await databaseFS.read(headPath);
      resolve(file);
    } catch (error) {
      reject(error);
    }
  });
}

function readCollectionBody(parentPath) {
  // Only create one when it is not created
  return new Promise(async (resolve, reject) => {
    try {
      const headPath = path.join(parentPath, bodyFileName);
      const file = await databaseFS.read(headPath);
      resolve(file);
    } catch (error) {
      reject(error);
    }
  });
}

function writeToCollection(parentPath, data) {
  // this will overwirte the files
  return new Promise(async (resolve, reject) => {
    try {
      const headPath = path.join(parentPath, headFileName);
      const bodyPath = path.join(parentPath, bodyFileName);
      await Promise.all([
        databaseFS.write(headPath, data.head),
        databaseFS.write(bodyPath, data.body),
      ]);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  headFileName,
  bodyFileName,
  createCollection,
  deleteCollection,
  readCollection,
  readCollectionHead,
  readCollectionBody,
  writeToCollection,
};
