const urlModel = require('../models/urlModel')
const shortid = require('shortid')

const baseUrl = "http://localhost:3000/"

const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    10976,
    "redis-10976.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("63Fkn6vvGYtfftugyWgr7LrK8Emyqedh", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const isValid = function (value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length == 0) return false;
    if (typeof value == "number") return false;
    return true;
}

// ___________Validation for long URL_______________
const isValidURL = function(URL){
    return /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%.\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%\+.~#?&//=]*)/.test(URL)
}

// _______________________create URL___________________________
const createURL = async function (req, res) {
    try {
        let data = req.body
        const longUrl = data.longUrl
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please Provide data" })
        if (!isValid(longUrl)) return res.status(400).send({ status: false, message: "Please provide URL" })

        // ____________________validation testing for long URL_____________________
        if (!isValidURL(longUrl)) return res.status(400).send({ status: false, message: "Please provide valid URL" })
       
        // setting data from  DB to cache for same URL
        let isUrlPresent = await urlModel.findOne({longUrl})
        if(isUrlPresent){
            console.log("db call..")
            await SET_ASYNC(`${longUrl}`, JSON.stringify(isUrlPresent))
            return res.status(200).send({status:true, message: "Short URL already genreated", data:isUrlPresent})
        }

        // +++++++++++++++generating urlcode by using shortid package++++++++++++++++
        const urlCode = shortid.generate().toLowerCase()

        // if By chance urlcode already exist 
        let alreadyURl = await urlModel.findOne({ urlCode: urlCode })
        if (alreadyURl) return res.status(409).send({ status: true, message: "URL already exist" })

        // ____________generating short URL____________
        let shortUrl = baseUrl + urlCode
        let Data = {
            "longUrl": longUrl,
            "shortUrl": shortUrl,
            "urlCode": urlCode
        }

        // creating document
        await urlModel.create(Data)
        res.status(201).send({ status: true, message: "URL shortened Successfully", data: Data })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

// _____________________get URL__________________________
const getUrl = async function (req, res) {
    try {
        let data = req.params.urlCode

        // ___________validation for urlcode_____________
        if (!shortid.isValid(data)) return res.status(400).send({ status: false, message: "please enter valid URL code" })

        // ______________recieving data from cache reduces the response time_____________
        let cachedURLData = await GET_ASYNC(`${data}`)
        if (cachedURLData) {
            console.log("cache HIT")
          return res.status(302).redirect(JSON.parse(cachedURLData))

        } else {
            console.log("cache MISS")
            // find urlcode in db
            let findUrl = await urlModel.findOne({ urlCode: data })
            if (!findUrl) return res.status(404).send({ status: false, message: "UrlCode does not found!!" })
           
            // set longurl(Original) in cache with there respective key i.e urlcode
            await SET_ASYNC(`${data}`, JSON.stringify(findUrl.longUrl))
            return res.status(302).redirect(findUrl.longUrl)
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createURL, getUrl }