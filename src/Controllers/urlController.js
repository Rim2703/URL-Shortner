const urlModel = require('../models/urlModel')
const validUrl = require('valid-url')
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

const createURL = async function (req, res) {
    try {
        let data = req.body
        const longUrl = data.longUrl
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please Provide data" })
        if (!isValid(longUrl)) return res.status(400).send({ status: false, message: "Please provide URL" })
        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, message: "Please provide valid URL" })

        let uniqueUrl = await urlModel.findOne({ longUrl: longUrl })
        if (uniqueUrl) return res.status(200).send({ status: true, message: "URL already shortened", data: uniqueUrl })

        const urlCode = shortid.generate().toLowerCase()

        let alreadyURl = await urlModel.findOne({ urlCode: urlCode })
        if (alreadyURl) return res.status(409).send({ status: true, message: "URL already exist" })

        let shortUrl = baseUrl + urlCode
        let Data = {
            "longUrl": longUrl,
            "shortUrl": shortUrl,
            "urlCode": urlCode
        }

        await urlModel.create(Data)
        let findUrl = await urlModel.findOne({longUrl: longUrl})
        await SET_ASYNC(`${longUrl}`, JSON.stringify(findUrl))
        res.status(201).send({ status: true, message: "URL shortened Successfully", data: Data })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const getUrl = async function (req, res) {
    try {
        let data = req.params.urlCode

        if (!shortid.isValid(data)) return res.status(400).send({ status: false, message: "please enter valid URL code" })

        let cachedURLData = await GET_ASYNC(`${data}`)
        if (cachedURLData) {
          return res.redirect(JSON.parse(cachedURLData))

        } else {
            let findUrl = await urlModel.findOne({ urlCode: data })
            if (!findUrl) return res.status(404).send({ status: false, message: "UrlCode does not found!!" })
            await SET_ASYNC(`${data}`, JSON.stringify(findUrl.longUrl))
            return res.redirect(findUrl.longUrl)
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createURL, getUrl }