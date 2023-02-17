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

function cvtRowToObj(schema, doc, ignoreNull = false) {
  let object = {};
  schema.forEach((key, index) => {
    const data = doc[index];
    if (ignoreNull && data === null) return;
    object[key] = data;
  });
  return object;
}

function cvtObjToRow(schema, doc, nullIfEmpty = true) {
  return schema.map((key) => {
    const obj = doc[key];
    return typeof obj !== "undefined" ? obj : nullIfEmpty ? null : undefined;
  });
}

function uid() {
  return Date.now() + "x" + parseInt(Math.random() * 1000);
}

module.exports = {
  tryAgain,
  cvtRowToObj,
  cvtObjToRow,
  uid,
};
