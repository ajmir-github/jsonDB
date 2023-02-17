const JsonFile = require("./libs/JsonFile");
const { uid, cvtObjToRow, cvtRowToObj } = require("./libs/utils");
const path = require("path");

class Collection {
  constructor(
    collectionName,
    schema,
    sourceDir = "source",
    cacheInMemory = true
  ) {
    this.collectionName = collectionName;
    this.schema = ["id", ...schema];
    this.path = path.join(process.cwd(), sourceDir, collectionName + ".json");
    this.source = new JsonFile(this.path, cacheInMemory);
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
  async findOne(compare = () => true, projection = this.schema) {
    return this._query((rows) => {
      let foundDoc = null;
      for (const row of rows) {
        const doc = cvtRowToObj(projection, row, true);
        if (compare(doc)) {
          foundDoc = doc;
          break;
        }
      }
      return foundDoc;
    });
  }
  async find(compare = () => true, projection = this.schema) {
    return this._query((rows) => {
      let docs = [];
      for (const row of rows) {
        const doc = cvtRowToObj(projection, row, true);
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

  async create(doc = {}) {
    return this._mutate((rows) => {
      const newDoc = cvtObjToRow(this.schema, {
        ...doc,
        id: uid(),
      });
      rows.push(newDoc);
      return rows;
    });
  }
  async update(compare = () => false, entries = {}) {
    return this._mutate((rows) => {
      let updatedRows = rows.map((row) => {
        const doc = cvtRowToObj(this.schema, row, true);
        if (!compare(doc)) return row;
        return cvtObjToRow(this.schema, { ...doc, ...entries });
      });
      return updatedRows;
    });
  }
  async delete(compare = () => false) {
    return this._mutate((rows) => {
      const updatedRows = rows.filter(
        (row) => !compare(cvtRowToObj(this.schema, row))
      );
      return updatedRows;
    });
  }
  async clear() {
    return this._mutate(() => []);
  }
}

module.exports = { Collection };

// const User = new Collection("Users", ["name", "type"]);
// const Post = new Collection("Posts", ["title", "author"]);

// (async () => {
// await User.create({
//   name: "Firoz",
//   type: "User",
// });
// await User.update((doc) => doc.id == "1676635191801x485", {
//   password: "xxx",
// });
// console.log(await User.findOne((doc) => doc.name == "Firoz", ["id", "name"]));
// console.log(await User.find(undefined, ["id", "name"]));
// await Post.create({
//   author: "1676643520274x162",
//   title: "CSS",
// });
// console.log(await Post.find());
// })();
