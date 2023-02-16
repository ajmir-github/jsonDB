function convertObjectToKeylessJson(data, schema) {
  return schema.map((key) =>
    typeof data[key] !== "undefined" ? data[key] : null
  );
}

function convertKeylessJsonToObject(data, schema) {
  return Object.fromEntries(
    schema.map((key, index) => {
      return [key, data[index]];
    })
  );
}

module.exports = {
  convertKeylessJsonToObject,
  convertObjectToKeylessJson,
};
