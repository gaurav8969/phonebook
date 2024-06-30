const mongoose = require('mongoose')

const cliArguments = process.argv.length
if(cliArguments < 3){
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://gauravkrtiwari79:${password}@cluster0.bsneo4e.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name:String,
  number:String,
})

const Person = mongoose.model('Person', personSchema)

function savePerson(person){
  person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}

function fetchContacts(){
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}

if(cliArguments === 3){
  fetchContacts()
}else if(cliArguments === 5){
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })
  savePerson(person)
}else{
  console.log('give pwd, name and contact no. as args')
  process.exit(1)
}