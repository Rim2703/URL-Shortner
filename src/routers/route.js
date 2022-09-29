const express = require('express')
const router = express.Router()
const urlController = require('../Controllers/urlController')

router.post("/url/shorten", urlController.createURL)


module.exports  = router