import mongoose from 'mongoose';

let models = {};

mongoose.set('strictQuery', false);
await mongoose.connect(
  "mongodb+srv://441-user:441-password@websharer.x0ar3nz.mongodb.net/websharer?retryWrites=true&w=majority", 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)

const postSchema = new mongoose.Schema({
  url: String,
  description: String,
  username: String,
  created_date: {
    type: Date,
    default: new Date,
  }
});

models.Post = mongoose.model('postScheme', postSchema, 'postScheme');

export default models