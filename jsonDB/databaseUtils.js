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

function cvtRowToObj(schemas, headCols, bodyCols, ignoreNull = false) {
  let object = {};
  let pushInto = (schema, cols) =>
    schema.forEach((key, index) => {
      const data = cols[index];
      if (ignoreNull && data === null) return;
      object[key] = data;
    });
  pushInto(schemas.head, headCols);
  pushInto(schemas.body, bodyCols);
  return object;
}

function cvtObjToRow(schemas, doc, nullIfEmpty = true) {
  function iter(key) {
    const obj = doc[key];
    return typeof obj !== "undefined" ? obj : nullIfEmpty ? null : undefined;
  }
  return {
    head: schemas.head.map(iter),
    body: schemas.body.map(iter),
  };
}
module.exports = {
  tryAgain,
  cvtRowToObj,
  cvtObjToRow,
};
