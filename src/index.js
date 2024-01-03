const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const route = require("./routes/routes.js"); //imported route
const mongoose = require("mongoose");
require('dotenv').config()
const app = express();

app.use(cors());

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

const DB_uri = process.env.MONGODB_URI
mongoose
  .connect(DB_uri, {useNewUrlParser: true,})
  .then(() => console.log("mongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});