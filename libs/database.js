// ------------------------- Imports
const path = require("path");
const fs = require("fs/promises");

// ------------------------- Util functions
function tryAgain(callback, delay = 100) {
  // None-blocking approach.
  // It tries again and again untill callback returns true.
  return new Promise((resolve) => {
    const unsubscribe = setInterval(() => {
      const sucess = callback();
      if (!sucess) return;
      clearInterval(unsubscribe);
      resolve();
    }, delay);
  });
}

function uid() {
  return Date.now() + "x" + parseInt(Math.random() * 1000);
}

// ------------------------- JsonFile Munipulator
class JsonFile {
  constructor(path, cacheInMemory = false, encoding = "utf-8") {
    this.path = path;
    this.processing = false;
    this.cacheInMemory = cacheInMemory;
    this.cache = null;
    this._init();
    this._readOptions = { encoding, flag: "r" };
    this._writeOptions = { encoding, flag: "w" };
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
    return this._funcStack(async (reject) => {
      try {
        await fs.stat(this.path);
        const file = await fs.readFile(this.path, this._readOptions);
        this.cache = JSON.parse(file);
      } catch (error) {
        if (error.errno !== -4058) reject(error);
        await fs.writeFile(this.path, "[]", this._writeOptions);
      }
    });
  }
  read() {
    // Read json file
    return this._funcStack(async (reject) => {
      try {
        if (this.cacheInMemory && this.cache) return this.cache;
        const file = await fs.readFile(this.path, this._readOptions);
        const json = JSON.parse(file);
        if (this.cacheInMemory) this.cache = json;
        return json;
      } catch (error) {
        if (error.errno === -4058) resolve(null);
        reject(error);
      }
    });
  }
  write(object) {
    // Write json file
    return this._funcStack(async (reject) => {
      try {
        if (this.cacheInMemory) this.cache = object;
        const json = JSON.stringify(object);
        await fs.writeFile(this.path, json, {
          encoding: this.encoding,
          flag: "w",
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// ------------------------- Collection Handler
const collectionDefaultOptions = {
  sourceDir: "source",
  cacheInMemory: true,
  where: () => true,
  limit: 24,
  skip: 0,
  sort: undefined,
  many: false,
  overwrite: false,
};

class Collection {
  constructor(collectionName, options = collectionDefaultOptions) {
    this.defaultOptions = { ...collectionDefaultOptions, ...options };
    this.collectionName = collectionName;
    this.path = path.join(
      process.cwd(),
      this.defaultOptions.sourceDir,
      collectionName + ".json"
    );
    this.source = new JsonFile(this.path, this.defaultOptions.cacheInMemory);
  }
  _query(func) {
    return new Promise(async (resolve, reject) => {
      try {
        const docs = await this.source.read();
        const result = await func(docs);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
  _mutate(func) {
    return new Promise(async (resolve, reject) => {
      try {
        const docs = await this.source.read();
        const updatedDocs = await func(docs);
        const result = await this.source.write(updatedDocs);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
  findOne(options = this.defaultOptions) {
    return this._query((docs) => docs.find((doc) => options.where(doc)));
  }
  find(options = this.defaultOptions) {
    const { where, limit, skip, sort } = {
      ...this.defaultOptions,
      ...options,
    };
    return this._query((docs) => {
      if (sort) {
        docs.sort(sort);
      }
      let selectedDocs = [];
      let skipped = 0;
      for (const doc of docs) {
        if (selectedDocs.length === limit) break;
        if (skipped < skip) {
          skipped++;
          continue;
        }
        if (where(doc)) selectedDocs.push(doc);
      }
      return selectedDocs;
    });
  }
  count(options = this.defaultOptions) {
    return this._query((rows) => {
      let counted = 0;
      for (const doc of rows) {
        if (options.where(doc)) counted++;
      }
      return counted;
    });
  }
  create(doc = {}) {
    return this._mutate((docs) => {
      const newDoc = {
        ...doc,
        id: uid(),
      };
      docs.push(newDoc);
      return docs;
    });
  }
  update(newValues = {}, options = this.defaultOptions) {
    const { where, many, overwrite } = { ...this.defaultOptions, ...options };
    return this._mutate((docs) => {
      let updated = false;
      return docs.map((doc) => {
        if (!where(doc)) return doc;
        if (!many && updated) return doc;
        updated = true;
        // presist the id
        return overwrite
          ? { ...newValues, id: doc.id }
          : { ...doc, ...newValues, id: doc.id };
      });
    });
  }
  delete(options = this.defaultOptions) {
    const { where, many } = { ...this.defaultOptions, ...options };
    return this._mutate((docs) => {
      let deleted = false;
      return docs.filter((doc) => {
        if (!where(doc)) return true;
        if (!many && deleted) return true;
        deleted = true;
        return false;
      });
    });
  }
  clear() {
    return this._mutate(() => []);
  }
}

module.exports = { Collection };
