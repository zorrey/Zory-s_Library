const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('findOneAndDelete', function(next){
    let id = this.getQuery()["_id"];
    console.log('this.id', id)

    Book.find({author: id}, (err, books)=>{
        console.log('books model pre: ', books.length)
        if(err){ 
            console.log('pre - model error')
          return  next(err)
        }else if(books.length > 0) {
            console.log('books length model pre: ', books.length)
         return   next(new Error('This author has books'))
        }else{
            console.log('success books model pre: ', books)
          return  next()
        }
    })
})
module.exports = mongoose.model('Author', authorSchema)