const express = require('express')
const router = express.Router()
const  Book = require('../models/book')
const path = require('path')
const uploadPath = path.join('public', Book.coverImagePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const  Author = require('../models/author')
const { title } = require('process')

//all books
router.get('/', async (req, res)=>{
    let bookQuery = Book.find().populate('author')
    let searchTitles = {}
    //let authors
    //console.log(req.query, '<-----query' )
    if(req.query.title != null && req.query.title !== ""){
        bookQuery = bookQuery.regex('title', new RegExp(req.query.title, 'i'))
    }

    if(req.query.author != null && req.query.author !== ""){
        bookQuery = bookQuery.equals('author', req.query.author )
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore !== ""){
        bookQuery = bookQuery.lte('publishDate', req.query.publishedBefore )
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter !== ""){
        bookQuery = bookQuery.gte('publishDate', req.query.publishedAfter )
    }
    try{
        const allBooks = await bookQuery.exec() //, {'_id':0, '__v':0})

        //console.log("searchTitles", searchTitles)
        //console.log("allBooks", allBooks)
      
        res.render("books/index", {
            books: allBooks == null? {title: title} : allBooks,
            searchTitles: req.query

        })
    } catch(err) {   
        console.log('router.get-/', err)              
        res.redirect('/')
    }  
})

//new book
router.get('/new', async (req , res)=> {
   renderNewPage(res, new Book())
})

//Create Book Route
router.post('/',  async (req, res) => {

   // const {title, pageCount, description, publishDate, cover, author} = req.body

 /*  if(!title || !pageCount || publishDate == null || !cover){
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
        /* cover: fileName , */
        description: req.body.description            
    })
    saveCover(book , req.body.cover)
    try{
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
      //  res.redirect('books')
            
    } catch(err) {
        console.log('new book error', err)
        renderNewPage(res, book , true)
    }
})

router.get('/:id', async (req, res)=>{
    try{
        const book = await Book.findById(req.params.id)
                                .populate('author')
                                .exec()
        //console.log('get-:id  --> book.author.name:',book.author.name)
        res.render('books/show', {
            book: book
        })
    }catch(err){
        console.log('error',err)
        res.redirect('/')
    }
})
router.get('/:id/edit', async (req, res)=>{
    try{
        const book = await Book.findById(req.params.id)
        //console.log('get-:id/edit-abook.author:', book.author)
        renderEditPage(res, book )
   
    }catch(err){
        console.log('error -/:id/edit ',err)
        res.redirect('/ ')
    }
})
//Update Book Route
router.put('/:id', async ( req, res ) => {
    console.log('books-put-params', req.params)
    //console.log('books-put-body', req.body)
    let book
    try{
        book = await Book.findByIdAndUpdate(
                                        req.params.id, {
                                        title: req.body.title,
                                        publishDate: new Date(req.body.publishDate),
                                        pageCount: req.body.pageCount,
                                        createdAt: req.body.createdAt,
                                        author: req.body.author,
                                        description: req.body.description   
                                        },
                                        {new: true}
                                        )
        if(req.body.cover != null && req.body.cover != undefined && req.body.cover != ""){
            saveCover( book, req.body.cover)
        }
        const authors = await Author.find({})
        //console.log('book.auhtor: ', book.author)
        //console.log('authors: ', authors)
        res.redirect(`/books/${book.id}`)
    } catch(err){
        if(book != null){
            renderEditPage( res, book, true)
        }else{
            console.log('error', err)
            res.redirect('/')
        }
        
        
    }
})
//Delete Book
router.delete('/:id' , async (req, res) => {
    let book
    //console.log('book-delete-req.params', req.params)
    try{
        bookToDel = await Book.findByIdAndDelete( req.params.id )
        const title = bookToDel.title
        res.redirect('/books')
    }catch(err){
        console.log('book-delete-error:', err)
        if(bookToDel != null && bookToDel != undefined)    {
            res.render('books/show', {
                book: bookToDel,
                errorMessage: `Cannot Delete Book: ${title}`
            })
        }
    }

})

async function renderNewPage (res, book, hasError = false){
    renderFormPage (res, book, 'new', hasError)

}

async function renderEditPage (res, book, hasError = false){
    renderFormPage (res, book, 'edit', hasError)

}
async function renderFormPage (res, book, form, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors : authors,
            book : book
        }
        if(hasError) {
            if( form == 'edit') params.errorMessage = "error updating book"
            if( form == 'new') params.errorMessage = "error creating book"
            
        }
        console.log('renderFormPage-book')
        res.render(`books/${form}`, params)           
    }catch(err){
        console.log('ERROR:  ',err)
        res.redirect('/books')
    }

}

function saveCover(book , coverEncoded){
    if( !coverEncoded && coverEncoded == "" && coverEncoded.length == 0 ) {
        return
    }else{
    console.log("coverEncoded: ", coverEncoded.length)
    const cover = JSON.parse(coverEncoded)
    if(cover != null && cover != "" && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}
    }    


module.exports = router