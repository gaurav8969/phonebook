const express = require('express')
const morgan = require('morgan')

const app = express()
const cors = require('cors')

function isPost(req){
    return req.method === 'POST'
}

function isNotPost(req){
    return !isPost(req)
}

morgan.token('post', function getPost(req,res){
    return JSON.stringify(req.body);
})

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {skip: isPost}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post',{skip:isNotPost}))

const mongoose = require('mongoose')
const password = process.argv[2]
const url = `mongodb+srv://gauravkrtiwari79:${password}@cluster0.bsneo4e.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name:String,
    number:String,
})

const Person = mongoose.model('Person', personSchema)

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/',(request,response)=>{
    response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response)=>{
    response.json(persons)
})

app.get('/api/persons/:id',(request, response)=>{
    const id = request.params.id;
    const person = persons.find(person=>person.id === id)

    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }
})

app.get('/info',(request, response)=>{
    const timestamp = Date()
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${timestamp}</p>`)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person=>person.id === id)

    if(person){
        persons = persons.filter(person => person.id !== id)
        response.status(204).end()
    }else{
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {
    const {name,number} = request.body

    const alreadyExists = persons.find((person)=>person.name === name
    | person.number === number)

    if( !name || !number){
        return response.status(400).json({error:'Name or number is missing'})
    }

    if(alreadyExists){
        return response.status(409).json({error:'Name or number is already taken'})
    }

    const person = {
        id: Math.floor(Math.random()*10000000).toString(),
        name,
        number
    }

    persons = persons.concat(person)
    response.status(201).json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})