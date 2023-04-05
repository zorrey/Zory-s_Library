const express = require('express')
const router = express.Router()
const  Book = require('../models/book')
const path = require('path')
//const uploadPath = path.join('public', Book.coverImagePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const  Author = require('../models/author')
const { title } = require('process')
const maxBookCount = 10;
//all books
router.get('/', async (req, res)=>{
    let bookQuery = Book.find().populate('author')
    let searchTitles = {}

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
        const allBooks = await bookQuery.exec() 
      
        res.render("books/index", {
            books: allBooks == null? {} : allBooks,
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
    const authors = await Author.find({})
    const booksCount = await Book.countDocuments({}).exec()
    console.log("books count", booksCount)
    if(booksCount >= maxBookCount ){
        return renderNewPage(res, new Book(), true, true)
    }
// const {title, pageCount, description, publishDate, cover} = req.body

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
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
        renderEditPage(res, book )
   
    }catch(err){
        console.log('error -/:id/edit ',err)
        res.redirect('/')
    }
})
//Update Book Route
router.put('/:id', async ( req, res ) => {
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
                                        ).populate('author').exec()       
                              
        if(req.body.cover != null && req.body.cover != undefined && req.body.cover != ""){
            saveCover( book, req.body.cover)
        }
        book.save()
        const authors = await Author.find({})
        res.render(`books/show` , { book : book ,
                                    message : `Book "${book.title}" updated. `
                    })
    } catch(err){
        console.log('error', err)
        if(book != null){
            renderEditPage( res, book, true)
        }else{
           
            res.redirect('/')
        }       
    }
})
//Delete Book
router.delete('/:id' , async (req, res) => {
    let book
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

async function renderNewPage (res, book, hasError = false, isFull = false){
    renderFormPage (res, book, 'new', hasError, isFull)

}

async function renderEditPage (res, book, hasError = false, isFull = false){
    renderFormPage (res, book, 'edit', hasError, isFull)

}
async function renderFormPage (res, book, form, hasError = false, isFull = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors : authors,
            book : book
        }
        if(hasError) {
            if( form == 'edit') params.errorMessage = "Error Updating Book."
            if( form == 'new') {
                if(isFull){ params.errorMessage = `Error Creating Book. Max of ${maxBookCount} books count already reached.`}
                else if(!book.title) params.errorMessage = "Error Creating Book. Title required."
                else if(!book.pageCount){ params.errorMessage = "Error Creating Book. Page Count required." }
                else if(!book.publishDate){ params.errorMessage = "Error Creating Book. Date Published required." }
                else if(!book.coverImage){params.errorMessage = "Error Creating Book. Cover Image required."}
                else params.errorMessage = "Error Creating Book."
            }
            
        }
        //console.log('renderFormPage-book')
        res.render(`books/${form}`, params)           
    }catch(err){
        console.log('ERROR:  ', err)
        res.redirect('/books')
    }

}

function saveCover(book , coverEncoded){
    if( !coverEncoded && coverEncoded == "" && coverEncoded.length == 0 ) {
        return
    }else{
    
    const cover = JSON.parse(coverEncoded)
    if(cover != null&& cover && cover != "" && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
       // book.save()
    }
}
    }    


module.exports = router