const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
//all authors
router.get('/', async (req, res)=>{
    let searchNames = {}
    //console.log(req.query.name, req.params )
    if(req.query.name != null && req.query.name !== ""){
        searchNames.name = new RegExp(req.query.name, 'i')
    }
    try{
        const allAuthors = await Author.find( searchNames  )

        res.render("authors/index", {
            authors: allAuthors,
            searchNames: req.query,
            message: "Welcome to Zory's Library!"
        })
    }catch(err){         
            console.log(err)
        res.redirect('/')
    }

})

//new authors
router.get('/new', async (req , res)=> {
    res.render("authors/new", {author: new Author()})
})
//create author
router.post('/', async (req, res)=>{
    if(!req.body.name){
       return res.render('authors/new', {
            author: new Author(),
            errorMessage: "New Author not created. Field 'name' required."
                 })
    }else{
        const author = new Author({
        name: req.body.name 
        })
        try{
            
        const newAuthor = await author.save()
            
            console.log("new author saved", newAuthor)
            res.redirect(`authors/${newAuthor.id}`)
        
                
        }catch{
            res.render('authors/new', {
                author: author,
                errorMessage: "New Author not created"
            })
            console.log("new author error", author)
        }
    }

})

router.get('/:id', async (req, res)=>{
    //console.log('show author ' + req.params.id) 
    try{

        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id})
        res.render('authors/show', {
                author: author,
                books: books
        })
    }catch(err){

        console.log('error', err)
        res.redirect('/')

    }
})

router.get('/:id/edit', async (req, res)=>{
    //console.log("put method req.params---> ", req.params)
    try{
        const author = await Author.findById(req.params.id)
    res.render("authors/edit", {author: author})
    }catch{
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) => {
    let author
    const filter = req.params.id
    try{

        author = await Author.findOneAndUpdate({_id: req.params.id},
                                               {name: req.body.name},
                                               {new: true})
        res.redirect(`/authors/${author.id}`)           
    }catch(err){
        console.log(err)
        if(author == null){
            res.redirect('/')
        }else{
            res.render('authors/edit', {
            author: author,
            errorMessage: "Error updating author"
        })
        }       
    }
})
router.delete('/:id', async (req, res) => {
    let authorToDel
    let author
    const filter = req.params.id
    try{
        author = await Author.findById(req.params.id)
        authorToDel = await Author.findOneAndDelete({_id: req.params.id})
        const name = authorToDel.name 
        console.log('deleted author1', authorToDel, name)   
  
        res.redirect('/authors')           
    }catch(err){
        console.log('author to del - error catch:', author, err)
        if(author == null || author == undefined){
            res.redirect('/')
        }else{
            
            res.render('authors/show' , {
                            author : author,
                            books: await Book.find({author : author.id}),
                            errorMessage : "Cannot Delete Author with Books in the Database."
            })
       
        }       
    }
})

module.exports = router