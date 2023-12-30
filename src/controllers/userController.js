const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const validator = require("../middleware/validation")
//const aws = require("../middleware/aws")
// const {uploadFile} = require("../middleware/aws")
const mongoose = require("mongoose")
const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createUser = async function(req, res) {
    try {

        let body = req.body
        if (Object.keys(body).length === 0) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }
        // let files = req.files
        // if (Object.keys(body).length === 0 && req.files==undefined) {
        //     return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        // }

        // if ((files && files.length > 0)) {

        //     var profilePicUrl = await aws.uploadFile(files[0]);
        // } 
       

        const { fullName, email, password } = body
        // body.profileImage= profilePicUrl

        if (!validator.isValid(fullName)) {
            return res.status(400).send({ status: false, msg: "fullName is required" })
        }
        // Email is Mandatory...
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };
        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(body.email))) {
            return res.status(400).send({ status: false, message: ' Email should be a valid' })
        };

        // Email is Unique...
        let duplicateEmail = await userModel.findOne({ email: body.email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'Email already exist' })
        };

        // password is Mandatory...
        if (!validator.isValid(password)) {
            return res.status(400).send({ Status: false, message: "password is required" })
        }
        // password is Valid...
        let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/
        if (!Passwordregex.test(password)) {
            return res.status(401).send({ Status: false, message: "Please enter a valid password, minlength 8, maxxlength 15" })
        }

        //generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        const passwordValue = await bcrypt.hash(password, salt);

        let filterBody = { fullName: fullName, email: email, password: passwordValue }
        // filterBody.profileImage = profilePicUrl
        let userCreated = await userModel.create(filterBody)
        res.status(201).send({ status: true, msg: "user created successfully", data: userCreated })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message }) 
    }
}

//====================================================login ============================================

const login = async function(req, res) {
    try {

        let body = req.body

        if (Object.keys(body).length === 0) {
            return res.status(400).send({ Status: false, message: "Sorry Body can't be empty" })
        }

        //****------------------- Email validation -------------------****** //

        if (!validator.isValid(body.email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };

        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(body.email))) {
            return res.status(400).send({ status: false, message: ' Email should be a valid' })
        };


        //******------------------- password validation -------------------****** //

        if (!validator.isValid(body.password)) {
            return res.status(400).send({ Status: false, message: " password is required" })
        }

        //******------------------- checking User Detail -------------------****** //


        let checkUser = await userModel.findOne({ email: body.email });

        if (!checkUser) {
            return res.status(401).send({ Status: false, message: "email is not correct" });
        }

        let passwordMatch = await bcrypt.compare(body.password, checkUser.password)
        if (!passwordMatch) {
            return res.status(401).send({ status: false, msg: "incorrect password" })
        }
        //******------------------- generating token for user -------------------****** //
        let userToken = jwt.sign({

            UserId: checkUser._id,
            estd: "December2023"

        }, 'EloHouse@Dec2023', { expiresIn: '86400s' }); // token expiry for 24hrs

        return res.status(200).send({ status: true, message: "User login successfully", data: { userId: checkUser._id, token: userToken } });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { createUser, login }