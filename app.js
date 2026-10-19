const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

//Local Module
//Local Module
const rootDir = require('./utils/pathUtils');
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const MongoDBStore = require('connect-mongodb-session')(session);


const DB_PATH = 'mongodb://airbnb_admin:airbnb16@ac-hc6rkix-shard-00-00.qnkynd0.mongodb.net:27017,ac-hc6rkix-shard-00-01.qnkynd0.mongodb.net:27017,ac-hc6rkix-shard-00-02.qnkynd0.mongodb.net:27017/airbnb?ssl=true&replicaSet=atlas-6zhzmu-shard-0&authSource=admin&appName=AirBnbProject';

const errorController = require('./controllers/error');

const mongoose = require('mongoose');
const multer = require('multer');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});

// Add this to catch and log any silent session store errors
store.on('error', function (error) {
  console.log("Session Store Error:", error);
});

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

const storage = multer.diskStorage({
  // Define the destination folder for uploaded files
  destination: (req, file, cb) => {
    cb(null, 'Image/');
  },
  // Define the filename for uploaded files
  //cb is for callback function, first parameter is for error and second is for the filename
  filename: (req, file, cb) => {
    cb(null, randomString(10) + '-' + file.originalname);
  }
});

// fileFilter is used to filter the files based on the file type, in this case we are allowing only image files and pdf files
const fileFilter = (req, file, cb) => {
  const isPhoto = file.fieldname === 'photo' &&
    ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype);
  const isRulesPDF = file.fieldname === 'rulesPDF' && file.mimetype === 'application/pdf';
  // Multer calls fileFilter separately for each uploaded file:
  cb(null, isPhoto || isRulesPDF);
};

const multiOperations = {
  storage,
  fileFilter
};


app.use(express.urlencoded());
// app.use(multer(multiOperations).single('photo')); // Use multer middleware to handle file uploads
app.use(multer(multiOperations).fields([
  { name: 'photo' },
  { name: 'rulesPDF', maxCount: 1 }
]));

app.use(express.static(path.join(rootDir, 'public')))  // add app.js middleware for the styling
app.use('/Image', express.static(path.join(rootDir, 'Image')))  // add app.js middleware for the styling



app.use(session({
  secret: "Mohan is a pro coder",
  resave: false,
  saveUninitialized: true,
  store
}))

app.use((req, res, next) => {
  // console.log("Cookies is : ",req.get('cookie'));
  req.isLoggedIn = Boolean(req.session.isLoggedIn);
  next();
})

app.use(storeRouter);
//this is for the authentication check for the host routes, if the user is not logged in then it will redirect to the login page
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn)
    next();
  else
    return res.redirect('/login');
})

app.use(authRouter);
app.use("/host", hostRouter);



app.use('/Image', express.static(path.join(rootDir, 'Image')))

app.use(errorController.pageNotFound);


let port = 3004;


mongoose.connect(DB_PATH).then(() => {
  console.log("MongoDB Connected successfully");
  app.listen(port, (err) => {
    if (err) {
      console.log("Error while starting the server : ", err);
      process.exit(1);
    }
    console.log(`Server Running on the addresss:http://localhost:${port}`);
  })
}).catch(err => {
  console.log("Error while connecting the Mongo : ", err);
  process.exit(1);
})

