const fs = require("fs/promises");
const path = require("path");

const encoding = "utf-8";

function read(path) {
  // Read json file
  return new Promise(async (resolve, reject) => {
    try {
      const file = await fs.readFile(path, {
        encoding,
        flag: "r",
      });
      const json = JSON.parse(file);
      resolve(json);
    } catch (error) {
      if (error.errno === -4058) resolve(null);
      reject(error);
    }
  });
}
function write(path, object) {
  // Write json file
  return new Promise(async (resolve, reject) => {
    try {
      const json = JSON.stringify(object);
      await fs.writeFile(path, json, {
        encoding,
        flag: "w",
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function exists(path) {
  // check if file exists
  return new Promise(async (resolve, reject) => {
    try {
      await fs.stat(path);
      resolve(true);
    } catch (error) {
      if (error.errno !== -4058) reject(error);
      resolve(false);
    }
  });
}

function createFolder(path) {
  return fs.mkdir(path);
}

function deleteFolder(dirPath) {
  return new Promise((resolve, reject) => {
    try {
      fs.rmdir(dirPath)
        .then(resolve)
        .catch(async (error) => {
          if (error.errno !== -4051) throw error;
          // if folder is not empty
          const files = await fs.readdir(dirPath);
          for (const file of files) {
            await fs.rm(path.join(dirPath, file));
          }
          await fs.rmdir(dirPath);
          resolve();
        });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  read,
  write,
  exists,
  createFolder,
  deleteFolder,
};
