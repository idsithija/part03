require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
const phonebook = require('./models/persons')

app.get('/api/persons', morgan('tiny'), (request, response, next) => {
  phonebook
    .find({})
    .then((peoples) => {
      response.json(peoples)
    })
    .catch((error) => next(error))
})

app.get('/info', morgan('tiny'), (request, response, next) => {
  const date = new Date()
  phonebook
    .find({})
    .then((peoples) => {
      response.send(
        `<div>Phonebook has info for ${peoples.length} people</div> <div>${date}</div>`
      )
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', morgan('tiny'), (request, response, next) => {
  phonebook
    .findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', morgan('tiny'), (request, response, next) => {
  phonebook
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', morgan('tiny'), (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'The name or number is missing',
    })
  }

  const person = new phonebook({
    name: body.name,
    number: body.number,
    date: new Date(),
  })

  person
    .save()
    .then((data) => {
      response.json(data)
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  phonebook
    .findByIdAndUpdate(
      request.params.id,
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    )
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
