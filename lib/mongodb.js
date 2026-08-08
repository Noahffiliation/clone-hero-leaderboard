import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Add Mongo URI to .env.local');
}

const clientPromise =
  process.env.NODE_ENV === 'development'
    ? (global._mongoClientPromise = global._mongoClientPromise || new MongoClient(uri).connect())
    : new MongoClient(uri).connect();

export default clientPromise;
