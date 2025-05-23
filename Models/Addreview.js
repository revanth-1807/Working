const m=require('mongoose')

const a = new m.Schema({
    Provider:{
        type:String,
        required:false
    },
    Worker:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    }
})

module.exports = m.model('rate',a);