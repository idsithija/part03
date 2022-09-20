const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2]
const username = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://root:${password}@cluster0.wpjk3lb.mongodb.net/phonebook?retryWrites=true&w=majority`

const noteSchema = new mongoose.Schema({
  name: String,
  date: Date,
  number: String,
})

const PhoneBook = mongoose.model('PhoneBook', noteSchema)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected')

    if (username === undefined && number === undefined) {
      PhoneBook.find({}).then((result) => {
        console.log('phonebook:')
        result.forEach((data) => {
          console.log(data.name, data.number)
        })
        mongoose.connection.close()
      })
    }

    if (username !== undefined && number !== undefined) {
      const phonebook = new PhoneBook({
        name: username,
        date: new Date(),
        number: number,
      })

      return phonebook.save()
    }
  })
  .then(() => {
    if (username !== undefined && number !== undefined) {
      console.log(`added ${username} number ${number} to phonebook`)
    }
    return mongoose.connection.close()
  })
  .catch((err) => console.log(err))