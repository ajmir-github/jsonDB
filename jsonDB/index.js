const {
  headFileName,
  bodyFileName,
  createCollection,
  deleteCollection,
  readCollection,
  readCollectionBody,
  readCollectionHead,
  writeToCollection,
} = require("./databaseStore");
const { tryAgain } = require("./databaseUtils");
const path = require("path");
const { rejects } = require("assert");

const projectDir = process.cwd();
const sourceDir = path.join(projectDir, "source");

function splitHeadAndBody(doc, properties) {
  const entries = Object.entries(doc);
  const data = { head: {}, body: {} };
  for (const [key, value] of entries) {
    if (properties.head.includes(key)) data.head[key] = value;
    if (properties.body.includes(key)) data.body[key] = value;
  }
  return data;
}

class Collection {
  constructor(collectionName, properties) {
    this.collectionName = collectionName;
    this.properties = properties;
    this.collectionDir = path.join(sourceDir, collectionName);
    this.processing = false;
    this._init();
    this.headStorage = null;
  }

  _funcStack(func) {
    return new Promise(async (resolve, reject) => {
      try {
        // let one operation on the file at a time
        if (this.processing) await tryAgain(() => !this.processing);
        this.processing = true;
        const result = await func((error) => {
          throw error;
        });
        this.processing = false;
        resolve(result);
      } catch (error) {
        this.processing = false;
        reject(error);
      }
    });
  }
  _init() {
    // presisit the existence of this project
    return this._funcStack(async () => {
      await createCollection(this.collectionDir);
      this.headStorage = await readCollectionHead(this.collectionDir);
    });
  }
  find() {
    return this._funcStack(async () => {
      return await readCollection(this.collectionDir);
    });
  }
  count() {
    return this._funcStack(async () => {
      return this.headStorage.length;
    });
  }

  create(doc) {
    return this._funcStack(async () => {
      // propare then env
      const data = splitHeadAndBody(doc, this.properties);
      const head = this.headStorage;
      const body = await readCollectionBody(this.collectionDir);
      // bring the changes
      head.push(data.head);
      body.push(data.body);
      // save the changes
      await writeToCollection(this.collectionDir, { head, body });
    });
  }

  clear() {
    return this._funcStack(async () => {
      await writeToCollection(this.collectionDir, { head: [], body: [] });
      this.headStorage = [];
    });
  }
}

module.exports = { Collection };
