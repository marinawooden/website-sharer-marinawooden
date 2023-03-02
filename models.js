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

const authSchema = new mongoose.Schema({
  email: String,
  password: String,
})

const userSchema = new mongoose.Schema({
  email: String,
  favorites: {
    website: {
      type: String,
      default: null
    },
    "npm-package": {
      type: String,
      default: null
    },
    database: {
      type: String,
      default: null
    }
  }
})

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

models.Users = mongoose.model('userScheme', userSchema, 'userScheme');
models.Auth = mongoose.model('authScheme', authSchema, 'authScheme');
models.Post = mongoose.model('postScheme', postSchema, 'postScheme');
models.Comments = mongoose.model('commentScheme', commentSchema, 'commentScheme');

export default models