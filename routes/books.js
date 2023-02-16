const express = require('express')
const router = express.Router()

//my library home
router.get('/', (req, res)=>{
res.render("index")
})

module.exports = router