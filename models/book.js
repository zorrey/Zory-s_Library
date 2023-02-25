const mongoose = require('mongoose')
const path = require('path')
//const Author = require('../models/author')
const coverImagePath = "uploads/bookCovers"

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {    
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
/*     coverName: {        
        type: String,
        required:true
    }, */
    coverImage: {        
        type: Buffer,
        required:true
    },
    coverImageType: {        
        type: String,
        required:true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'Author'
    }

})

/* bookSchema.virtual('coverPath').get(function(){
    if( this.coverName != null) {
        return path.join( '/' , coverImagePath, this.coverName)
    }
}) */
bookSchema.virtual('coverPath').get(function(){
    if( this.coverImage  && this.coverImageType ) {
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

module.exports = mongoose.model('Book', bookSchema)
module.exports.coverImagePath = coverImagePath