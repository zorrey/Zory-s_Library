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
        const allAuthors = await Author.find( searchNames  ) //, {'_id':0, '__v':0})

      //console.log("allAuthors", searchNames)
    /*    const authorsArr = Object.values(allAuthors).reduce((acc,el)=>{
        acc.push(' ' + el.name + ' \n')
        return acc 
       },[]) */
       //console.log("allAuthors", typeof authorsArr, authorsArr)
        res.render("authors/index", {
            authors: allAuthors,
            searchNames: req.query,
            message: ''
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
    const author = new Author({
        name: req.body.name 
    })
    try{
        const newAuthor = await author.save()
        //res.redirect(`authors/${newAuthor.id}`)
        console.log("new author saved", newAuthor)
            res.redirect(`/authors`)
            
    }catch{
        res.render('authors/new', {
            author: author,
            errorMessage: "New Author not created"
        })
        console.log("new author error", author)
    }
})

router.get('/:id', async (req, res)=>{
    console.log('show author ' + req.params.id) 
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
    //console.log("update params:", req.params, req.body)
    try{
        //console.log("update params:", req.params, req.body, 'filter-->', filter)
       // author = await Author.findById(req.params.id)

        author = await Author.findOneAndUpdate({_id: req.params.id},
                                               {name: req.body.name},
                                               {new: true})
        
        //console.log('updated author1', author)
    /*     author.name = req.body.name
        await author.save() */
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
    //res.send('delete author' + req.params.id)
    let authorToDel
    let author
    const filter = req.params.id
    //console.log("delete params:", req.params, req.body)
    try{
        //console.log("delete params:", req.params, req.body, 'del_filter-->', filter)
       // authorToDel = await Author.findById(req.params.id)
        author = await Author.findById(req.params.id)
        authorToDel = await Author.findOneAndDelete({_id: req.params.id})
        const name = authorToDel.name 
        console.log('deleted author1', authorToDel, name)   
        //await authorToDel.remove() 
        //console.log('deleted author name', name)
 
        res.redirect('/authors')           
    }catch(err){
        console.log('author to del - error catch:', author, err)
        if(author == null || author == undefined){
            res.redirect('/')
        }else{
            
            res.redirect(`/authors/${req.params.id}`)
       
        }       
    }
})

module.exports = router