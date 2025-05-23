const m=require('mongoose');

const a = new m.Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        reqired:true,
        unique:true
    },
    Password:{
        type:String,
        required:true
    },
    ConfirmPassword:{
        type:String,
        required:true
    }
})

module.exports = m.model('user',a);

