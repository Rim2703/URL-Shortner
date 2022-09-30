const express = require('express')
const router = express.Router()
const urlController = require('../Controllers/urlController')

router.post("/url/shorten", urlController.createURL)
router.get("/:urlCode", urlController.getUrl)


router.all("/**", function(req,res){
    return res.status(404).send({status: false, message:"Make sure your endpoint currect or not"})
})

module.exports = router