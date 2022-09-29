const urlModel = require('../models/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')

const baseUrl = "http://localhost:3000/" 

const isValid = function(value){
    if(typeof value == "undefined" || value == null) return false;
    if(typeof value == "string" && value.trim().length == 0) return false;
    if(typeof value == "number") return false;
    return true;
}

const createURL = async function(req,res){
try{
let data = req.body
const longUrl = data.longUrl
if(Object.keys(data).length == 0) return res.status(400).send({status: false, message: "Please Provide data"})
if(!isValid(longUrl)) return res.status(400).send({status: false, message: "Please provide URL"})
if(!validUrl.isUri(longUrl)) return res.status(400).send({status: false, message: "Please provide valid URL"})

let uniqueUrl = await urlModel.findOne({ longUrl: longUrl })
if(uniqueUrl) return res.status(200).send({status: true, message: "URL already shortened"}) //data: uniqueUrl})
const urlCode = shortid.generate();

let alreadyURl = await urlModel.findOne({ urlCode: urlCode})
if(alreadyURl) return res.status(409).send({status: true, message: "URL already exist"})

let shortUrl = baseUrl + urlCode
let Data = {
    "longUrl": longUrl,
    "shortUrl": shortUrl,
    "urlCode": urlCode
}

let createUrl = await urlModel.create(Data)
res.status(201).send({status: true, message: "URL shortened Successfully" , data: Data})

}
catch(err){
    res.status(500).send({status: false, message: err.message})
}

}


module.exports = {createURL}