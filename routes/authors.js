const express = require('express')
const author = require('../models/author')
const router = express.Router()
const Author = require('../models/author')
//all authors
router.get('/', async (req, res)=>{
    let searchNames = {}
    console.log(req.query.name, req.params )
    if(req.query.name != null && req.query.name !== ""){
        searchNames.name = new RegExp(req.query.name, 'i')
    }
    try{
        const allAuthors = await Author.find( searchNames  ) //, {'_id':0, '__v':0})

      console.log("allAuthors", searchNames)
    /*    const authorsArr = Object.values(allAuthors).reduce((acc,el)=>{
        acc.push(' ' + el.name + ' \n')
        return acc 


       },[]) */
       //console.log("allAuthors", typeof authorsArr, authorsArr)
        res.render("authors/index", {
            authors: allAuthors,
            searchNames: req.query
        })
    }catch{         
               
        res.redirect('/')
    }

})

//new authors
router.get('/new', (req , res)=> {
    res.render("authors/new", {author: new Author()})
})
//create author
router.post('/', async (req, res)=>{
    const author = new Author({
        name: req.body.name 
    })
    try{
        const newAuthor = await author.save()
        //res.redirect(`authors/${newAuthor.id}`)
        console.log("author3", author)
            res.redirect(`authors`)
            
    }catch{
        res.render('authors/new', {
            author: author,
            errorMessage: "New Author not created"
        })
        console.log("author2", author)
    }

router.delete('/',  (req, res)=>{
    console.log("delete router, req->", req.params)
/*     try{
      const deleted = await Author.deleteMany({})

      const allAuthors = await Author.find({})
      console.log('allAuthors', allAuthors, "deleted", deleted)
      //res.redirect('/')
    }catch{
    res.render('authors/delete', {
        authors: allAuthors,
        deleteMessage: "authors not deleted"
    })
    } */
    
})
})

module.exports = router