const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String },
  lastname: { type: String },
  bio: { type: String },
  followerId: [{ type: String, ref: 'User' }],
  followingId: [{ type: String, ref: 'User' }],
  posts: { type: Number, default: 0 },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  description: {type: String, required: true},
  mediaUrl: { type: String }, // Field for storing the URL of the media file
  mediaType: { type: String }, // Field to indicate the type of media (e.g., 'image', 'video')
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});



const commentSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  postId: { type: String, ref: 'Post', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const likeSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  postId: { type: String, ref: 'Post', required: true },
  createdAt: { type: Date, default: Date.now },
});


const followSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  followingId: { type: String, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});


// const shareSchema = new mongoose.Schema({
//   userId: { type: String },
//   postId: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });


const notificationSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  senderId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


const messageSchema = new mongoose.Schema({
  senderId: { type: String, ref: 'User', required: true },
  receiverId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});


const storySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});



const models = {
  Users: mongoose.model('User', userSchema),
  Post: mongoose.model('Post', postSchema),
  Comment: mongoose.model('Comment', commentSchema),
  Like: mongoose.model('Like', likeSchema),
  Follow: mongoose.model('Follow', followSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Story: mongoose.model('Story', storySchema),
  Message: mongoose.model('Message', messageSchema)
};

module.exports = models;
