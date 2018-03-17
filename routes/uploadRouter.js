const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
    //req - request, file - info about the file processed by multer, cb - callback
    destination: (req, file, cb) => {
        //null - error handler, public/images  = > dest folder where the files will be saved
        cb(null, 'public/images');
    },
    filename:(req, file, cb) => {
        cb(null, file.originalname)
    }
});

//specify which kind of files you are willing to upload
const  imageFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error(`You can upload only image files!`), false)
  }
  cb(null, true);
};

//multer module usage
const upload = multer({storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

//route can take end point as a parameter
uploadRouter.route('/')
    .get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`GET operation is not supported on /imageUpload`);
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin,
        //imageFile is the name of the file for the multi-part on the client side
        upload.single('imageFile'), (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation is not supported on /imageUpload`);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`DELETE operation is not supported on /imageUpload`);
    });
module.exports = uploadRouter;