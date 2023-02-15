const {
  headFileName,
  bodyFileName,
  createCollection,
  deleteCollection,
  readCollection,
  readCollectionBody,
  readCollectionHead,
  writeToCollection,
} = require("./jsonDB/collectionControllers");
const path = require("path");

const projectDir = process.cwd();
const sourceDir = path.join(projectDir, "source");

class Collection {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionPath = path.join(sourceDir, collectionName);
    this.headPath = path.join(this.collectionPath, headFileName);
    this.bodyPath = path.join(this.collectionPath, bodyFileName);
    this.processing = false;
    this._init();
  }
  async _init() {
    // presisit the existence of this project
    this.processing = true;
    await createCollection(this.collectionPath);
    this.processing = false;
  }
  async find() {}
}

(async () => {
  const Users = new Collection("users");
})();
