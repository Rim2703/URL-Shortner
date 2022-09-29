const express = require('express')
const router = express.Router()
const urlController = require('../Controllers/urlController')

router.post("/url/shorten", urlController.createURL)
router.get("/:urlCode", urlController.getUrl)

module.exports = router