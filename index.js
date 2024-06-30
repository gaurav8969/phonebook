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

const Person = require('./models/person')

app.get('/',(request,response)=>{
    response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response)=>{
    Person.find({}).then(people=>{
        response.json(people)
    }).catch(error=>{
        console.log(error)
        response.send('<h1>couldn\'t fetch any entries</h1>')
    })
})

app.get('/api/persons/:id',(request, response)=>{
    Person.findById(request.params.id)
    .then(person=>{
        if(person){
            response.json(person)
        }else{
            response.status(404).end()
        }
    })
    .catch(error=> next(error))
})

app.get('/info',(request, response)=>{
    const timestamp = Date()
    Person.find({}).then(people=>{
        response.send(`<p>Phonebook has info for ${people.length} people</p>
            <p>${timestamp}</p>`)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
    .then(result=>{
        response.status(204).end()
    })
    .catch(error=> next(error))
})

app.post('/api/persons', (request, response,next) => {
    const {name,number} = request.body

    let alreadyExists = null;
    Person.find({}).then(people=>{
        alreadyExists = people.find((person)=>person.name === name
        || person.number === number)

        if(alreadyExists){
            return response.status(409).json({error:'Name or number is already taken'})
        }else{
            const person = new Person({
                name:name,
                number:number
            })
        
            person.save().then(savedContact=>{
                response.json(savedContact);
            })
            .catch(error=>next(error))
        }
    })
})

app.put('/api/persons/:id',(request, response, next)=>{
    const {name,number} = request.body;

    const person = {
        name:name,
        number:number
    }

    Person.findByIdAndUpdate(request.params.id, 
        person,
        {new:true, runValidators:true, context:'query'}
    )
    .then(updatedContact=>{
        if(!updatedContact){
            return response.status(404).json({ error: 'Contact not found' });
        }
        response.json(updatedContact)
    })
    .catch(error=>{
        next(error)
    })
})

const errorHandler = (error, request, response, next)=>{
    console.log(error.message);

    if(error.name === 'CastError'){
        return response.status(400).send({error:'malinformedID'})
    }else if(error.name === 'ValidationError'){
        return response.status(400).json({error:error.message})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})