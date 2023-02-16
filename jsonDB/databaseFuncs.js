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
} = require("./databaseStore");
const {
  convertKeylessJsonToObject,
  convertObjectToKeylessJson,
} = require("./databaseUtils");

function ObjToHeadAndBody(doc, schemas, ignoreNull = false) {
  return {
    head: convertObjectToKeylessJson(doc, schemas.head),
    body: convertObjectToKeylessJson(doc, schemas.body),
  };
}

function keylessJsonToHeadAndBody(data, schemas) {
  return {
    head: convertKeylessJsonToObject(data, schemas.head),
    body: convertKeylessJsonToObject(data, schemas.body),
  };
}

async function addDoc(collectionDir, schemas, doc, cache = {}) {
  const { head, body } = ObjToHeadAndBody(doc, schemas);
  // get the previous data
  const headStore = cache.head || (await readCollectionHead(collectionDir));
  const bodyStore = cache.body || (await readCollectionBody(collectionDir));
  // change the stores
  headStore.push(head);
  bodyStore.push(body);
  // save the changes
  await writeToCollection(collectionDir, {
    head: headStore,
    body: bodyStore,
  });
}

async function updateDoc(collectionDir, schemas, index, newData, cache = {}) {
  // get the previous data
  const headStore = cache.head || (await readCollectionHead(collectionDir));
  const bodyStore = cache.body || (await readCollectionBody(collectionDir));
  // update only the targeted fields
  const newDoc = ObjToHeadAndBody(newData, schemas);
  const preDoc = keylessJsonToHeadAndBody(
    [...headStore[index], ...bodyStore[index]],
    schemas
  );
  // update
  console.log(newDoc);
  console.log(preDoc);
}

module.exports = {
  addDoc,
  updateDoc,
};
