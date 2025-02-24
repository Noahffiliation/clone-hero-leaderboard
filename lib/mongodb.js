import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}

if (!process.env.MONGODB_URI) {
  throw new Error('Add Mongo URI to .env.local')
}

let client = new MongoClient(uri, options)
const clientPromise = client.connect()

export default clientPromise
