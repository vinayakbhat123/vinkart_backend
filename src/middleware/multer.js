const multer = require("multer")

const storage = multer.memoryStorage();


// Single file
 const singleUpload = multer({storage}).single("file")

//muiltple files
 const multipleUpload = multer({storage}).array("files",5)

 module.exports={
  singleUpload,
  multipleUpload
 }