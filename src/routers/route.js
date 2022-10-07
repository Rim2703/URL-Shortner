const express = require('express')
const router = express.Router()
const urlController = require('../Controllers/urlController')

// ___________________URL Shorten API____________________
router.post("/url/shorten", urlController.createURL)

// ___________________Original URL API_____________________
router.get("/:urlCode", urlController.getUrl)


//____________________additional api for testing router path____________________________
router.all("/**", function(req,res){
    return res.status(404).send({status: false, message:"Make sure your endpoint currect or not"})
})

module.exports = router