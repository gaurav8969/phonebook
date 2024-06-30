require('dotenv').config();

const mongoose = require('mongoose')
const url = process.env.VITE_MONGODB_URL;
mongoose.set('strictQuery',false)
console.log('connecting to ', url)
mongoose.connect(url)
.then(result=>{
    console.log('connected to MongoDB')
})
.catch(error=>{
    console.log('error connecting to MongoDB: ', error.message)
})

const personSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:3
    },
    number:{
        type:String,
        validate:{
            validator: function(v){
                return /\d{2}\d?-\d+/.test(v);
            },
            message: props => `${props.value} is not a valid phone number`
        },
        required:true,
        minLength:8
    },
})

personSchema.set('toJSON', {
    transform:(document,returnedObject)=>{
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema);