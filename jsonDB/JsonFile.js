const fs = require("fs/promises");
const { tryAgain } = require("./utils");

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

module.exports = JsonFile;
