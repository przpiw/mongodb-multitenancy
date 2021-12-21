import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
}

function connectDB() {
  return new Promise((resolve, reject) => {
    const mongoURL = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_IP}:${process.env.MONGO_PORT}/?authSource=admin`
    mongoose
      .connect(mongoURL, mongoOptions)
      .then((conn) => {
        console.log('connected')
        resolve(conn)
      })
      .catch((error) => reject(error))
  })
}

export default connectDB
