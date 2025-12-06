const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();

const path = require("path");

const getDataUri = (file) => {
  const extname = path.extname(file.originalname).toString();
  return parser.format(extname, file.buffer).content;
};

module.exports = {getDataUri};
