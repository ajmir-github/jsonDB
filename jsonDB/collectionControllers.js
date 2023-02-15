const path = require("path");
const { read, write, exists, createFolder, deleteFolder } = require("./jsonFS");

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
      const isParentCreated = await exists(parentPath);
      if (!isParentCreated) await createFolder(parentPath);
      // head file
      const isHeadCreated = await exists(headPath);
      if (!isHeadCreated) await write(headPath, []);
      // body file
      const isBodyCreated = await exists(bodyPath);
      if (!isBodyCreated) await write(bodyPath, []);
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
      const isParentCreated = await exists(parentPath);
      if (isParentCreated) await deleteFolder(parentPath);
      resolve();
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
      const file = await read(headPath);
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
      const file = await read(headPath);
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
      await write(headPath, data.head);
      await write(bodyPath, data.body);
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
  readCollectionHead,
  readCollectionBody,
  writeToCollection,
};
