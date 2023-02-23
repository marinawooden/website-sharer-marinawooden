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
  likes: [String],
  created_date: {
    type: Date,
    default: new Date,
  }
});

const commentSchema = new mongoose.Schema({
  username: String,
  comment: String,
  post: String, // might not work
  created_date: {
    type: Date,
    default: new Date,
  }
});

models.Post = mongoose.model('postScheme', postSchema, 'postScheme');
models.Comments = mongoose.model('commentScheme', commentSchema, 'commentScheme');

export default models