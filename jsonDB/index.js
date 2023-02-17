const JsonFile = require("./JsonFile");
const { uid, cvtObjToRow, cvtRowToObj } = require("./utils");
const path = require("path");

const projectDir = process.cwd();
const sourceDir = path.join(projectDir, "source");

class Collection {
  constructor(collectionName, schema, cacheInMemory = true) {
    this.collectionName = collectionName;
    this.schema = ["id", ...schema];
    this.path = path.join(sourceDir, collectionName + ".json");
    this.cacheInMemory = cacheInMemory;
    this.source = new JsonFile(this.path, this.cacheInMemory);
  }
  async _query(func) {
    return new Promise(async (resolve, reject) => {
      try {
        const rows = await this.source.read();
        const result = await func(rows);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
  async _mutate(func) {
    return new Promise(async (resolve, reject) => {
      try {
        const rows = await this.source.read();
        const updatedRows = await func(rows);
        const result = await this.source.write(updatedRows);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async findOne(compare = () => true) {
    return this._query((rows) => {
      let foundDoc = null;
      for (const row of rows) {
        const doc = cvtRowToObj(this.schema, row, true);
        if (compare(doc)) {
          foundDoc = doc;
          break;
        }
      }
      return foundDoc;
    });
  }
  async find(compare = () => true) {
    return this._query((rows) => {
      let docs = [];
      for (const row of rows) {
        const doc = cvtRowToObj(this.schema, row, true);
        if (compare(doc)) docs.push(doc);
      }
      return docs;
    });
  }
  async count(compare = () => true) {
    return this._query((rows) => {
      let counted = 0;
      for (const row of rows) {
        const doc = cvtRowToObj(this.schema, row, true);
        if (compare(doc)) counted++;
      }
      return counted;
    });
  }

  async create(doc) {
    return this._mutate((rows) => {
      const newDoc = cvtObjToRow(this.schema, {
        ...doc,
        id: uid(),
      });
      rows.push(newDoc);
      return rows;
    });
  }
  async update(compare, entries) {
    return this._mutate((rows) => {
      let updatedRows = rows.map((row) => {
        const doc = cvtRowToObj(this.schema, row, true);
        if (!compare(doc)) return row;
        return cvtObjToRow(this.schema, { ...doc, ...entries });
      });
      return updatedRows;
    });
  }
  async delete(compare) {
    return this._mutate((rows) => {
      const updatedRows = rows.filter(
        (row) => !compare(cvtRowToObj(this.schema, row))
      );
      return updatedRows;
    });
  }
  async clear() {
    return this._mutate((rows) => {
      return [];
    });
  }
}

module.exports = { Collection };
