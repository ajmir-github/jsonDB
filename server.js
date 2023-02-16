// Add doc
const {
  headFileName,
  bodyFileName,
  createCollection,
  deleteCollection,
  readCollection,
  readCollectionHead,
  readCollectionBody,
  writeToCollection,
} = require("./jsonDB/databaseStore");
const { cvtObjToRow, cvtRowToObj } = require("./jsonDB/databaseUtils");

function query(dir, cache, func) {
  return new Promise(async (resolve, reject) => {
    try {
      const head = cache.head || (await readCollectionHead(dir));
      const body = cache.body || (await readCollectionBody(dir));
      const data = await func({ head, body });
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

function mutate(dir, cache, func) {
  return new Promise(async (resolve, reject) => {
    try {
      const head = cache.head || (await readCollectionHead(dir));
      const body = cache.body || (await readCollectionBody(dir));
      const changedData = await func({ head, body });
      const result = await writeToCollection(dir, changedData);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

function getDoc(dir, schemas, index, cache = {}) {
  return query(dir, cache, ({ head, body }) => {
    const h = head[index];
    const b = body[index];
    if (!h || !b) return null;
    const doc = cvtRowToObj(schemas, head[index], body[index], true);
    return doc;
  });
}

function getDocs(dir, schemas, cache = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const headStore = cache.head || (await readCollectionHead(dir));
      const bodyStore = cache.body || (await readCollectionBody(dir));
      let docs = [];
      for (let index = 0; index < headStore.length; index++)
        docs.push(
          cvtRowToObj(schemas, headStore[index], bodyStore[index], true)
        );
      resolve(docs);
    } catch (error) {
      reject(error);
    }
  });
}

function addDoc(dir, schemas, doc, cache = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const { head, body } = cvtObjToRow(schemas, doc);
      const headStore = cache.head || (await readCollectionHead(dir));
      const bodyStore = cache.body || (await readCollectionBody(dir));
      headStore.push(head);
      bodyStore.push(body);
      await writeToCollection(dir, {
        head: headStore,
        body: bodyStore,
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function updateDoc(dir, schemas, index, newDoc, overwrite = false, cache = {}) {
  return mutate(dir, cache, ({ head, body }) => {
    // prepare the doc
    const prevDoc = cvtRowToObj(schemas, head[index], body[index]);
    const updatedDoc = overwrite ? newDoc : { ...prevDoc, ...newDoc };
    const doc = cvtObjToRow(schemas, updatedDoc);
    // change the stores
    head[index] = doc.head;
    body[index] = doc.body;
    return { head, body };
  });
}

function deleteDoc(dir, index, cache = {}) {
  return mutate(dir, cache, ({ head, body }) => {
    // prepare the doc
    head.splice(index, 1);
    body.splice(index, 1);
    return { head, body };
  });
}

module.exports = {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
};
