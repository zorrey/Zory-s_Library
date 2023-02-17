const express = require('express')
const router = express.Router()
const  Book = require('../models/book')
//all authors
router.get('/', async (req, res)=>{
    res.send('all books')
/*     let searchNames = {}
    console.log(req.query.name, req.params )
    if(req.query.name != null && req.query.name !== ""){
        searchNames.name = new RegExp(req.query.name, 'i')
    }
    try{
        const allAuthors = await Author.find( searchNames  ) //, {'_id':0, '__v':0})

      console.log("allAuthors", searchNames)
        res.render("authors/index", {
            authors: allAuthors,
            searchNames: req.query
        })
    }catch{         
               
        res.redirect('/')
    } */

})

//new authors
router.get('/new', (req , res)=> {
    res.render("books/new", {book: new Book()})
})
//create author
router.post('/', async (req, res)=>{
    const book = new Book({
        title: req.body.title
    })
    try{
        const newBook = await book.save()
 //res.redirect(`authors/${newAuthor.id}`)
        console.log("book3", book)
            res.redirect(`books`)
            
    }catch{
        res.render('books/new', {
            book: book,
            errorMessage: "New Book not created"
        })
        console.log("book2", book)
    }

router.delete('/delete/:_id',  (req, res)=>{
    console.log("delete router, req->", req.params)

    
})
})

module.exports = router