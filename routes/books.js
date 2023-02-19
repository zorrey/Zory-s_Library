const express = require('express')
const router = express.Router()
const  Book = require('../models/book')
const multer = require('multer')
const path = require('path')
const uploadPath = path.join('public', Book.coverImagePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const  Author = require('../models/author')
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file , callback) =>{
        callback(null, imageMimeTypes.includes(file.mimetype) )
    }
})
//all books
router.get('/', async (req, res)=>{
    let bookQuery = Book.find()
     let searchTitles = {}
    console.log(req.query, '<-----query' )
    if(req.query.title != null && req.query.title !== ""){
        bookQuery = bookQuery.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore !== ""){
        bookQuery = bookQuery.lte('publishDate', req.query.publishedBefore )
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter !== ""){
        bookQuery = bookQuery.gte('publishDate', req.query.publishedAfter )
    }
    try{
        const allBooks = await bookQuery.exec(  ) //, {'_id':0, '__v':0})
        console.log("allBook", searchTitles)
        res.render("books/index", {
            books: allBooks == null? {title: title} : allBooks,
            searchTitles: req.query
        })
    } catch {                 
        res.redirect('/')
    }  
})

//new book
router.get('/new', async (req , res)=> {
   renderNewPage(res, new Book())
})

    //create book
router.post('/', upload.single('coverName') , async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    console.log(req.body, req.file)
    const {title, pageCount, description, publishDate, coverName, author} = req.body

 /*  if(!title || !pageCount || publishDate == null || !coverName){
    return res.json({error: 'missing fields info'})
  }    */

    /*   if(!title ){
    return res.json({error: 'missing fields info'})
    }    */

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverName: fileName ,
        description: req.body.description            
    })
    try{
        const newBook = await book.save()
 //res.redirect(`books/${newBook.id}`)
        console.log("book3", newBook)
        res.redirect('books')
            
    } catch {
        renderNewPage(res, new Book(), true)
    }

    /* router.delete('/delete/:_id',  (req, res)=>{
        console.log("delete router, req->", req.params)

        
    }) */
})

async function renderNewPage (res, book, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors : authors,
            book : book
        }
        if(hasError) params.errorMessage = "error creating book"
        res.render('books/new', params)           
    }catch{
        res.redirect('/books')
    }

}

module.exports = router