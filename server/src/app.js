const express = require("express");
const bcrypt = require('bcrypt')
const app = express();
const cors = require('cors')
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5100;
const mongoose = require('mongoose');
const { MONGO_URI } = require('./db/connect');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const models = require("./models/schema");
const multer = require('multer');
const cron = require('node-cron');


app.use(cors());

// admin middelware
function adminAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');
  jwt.verify(token, 'ADMIN_SECRET_TOKEN', (err, user) => {
    if (err) return res.status(403).send('Forbidden');
    req.user = user;
    next();
  });
}


// user middleware
const userAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(" ")[1]
    if (!token) {
      res.status(401);
      return res.send('Invalid JWT Token');
    }
    const decoded = jwt.verify(token, 'USER_SECRET_TOKEN')
    req.user = decoded.user;
    next();

  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Server Error');
  }
};


// Create a new user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstname, lastname, bio, avatar } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    const user = new models.Users({ username, email, password: hashedPassword, firstname, lastname, bio, avatar });
    const savedUser = await user.save();

    res.status(201).json({ user: savedUser, message: 'Successfully Registered' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
});

// Login schema
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await models.Users.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const token = jwt.sign({ userId: user._id }, 'mysecretkey');
  res.json({ user, token });

});


app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await models.Users.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the user' });
  }
});


app.get('/users', async (req, res) => {
  try {
    const user = await models.Users.find();    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the user' });
  }
});

app.put('/user/:id/follow', async (req, res) => {
  try {
    const { id } = req.params;
    const { followingId } = req.body;
    await models.Users.findByIdAndUpdate(followingId, { $addToSet: { followers: id } });
    await models.Users.findByIdAndUpdate(id, { $addToSet: { following: followingId } });

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while following the user' });
  }
});

app.delete('/user/:id/follow', async (req, res) => {
  try {
    const { id } = req.params;
    const { followingId } = req.body;

    await models.Users.findByIdAndUpdate(followingId, { $pull: { followers: id } });
    await models.Users.findByIdAndUpdate(id, { $pull: { following: followingId } });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while unfollowing the user' });
  }
});





// Get all notifications for a user
app.get('/notifications/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await models.Notification.find({ userId });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve notifications.' });
  }
});
// Create a new notification
app.post('/notifications', async (req, res) => {
  try {
    console.log(req.body);
    const { userId, senderId, content } = req.body;
    const notification = await models.Notification.create({ userId, senderId, content });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification.' });
  }
});

app.delete('/notifications', async (req, res) => {
  try {
    console.log("Hel")
    await models.Notification.deleteMany({});
    res.status(200).json({ message: 'All notifications deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notifications.' });
  }
});





app.post('/posts', async (req, res) => {
  try {
    const { userId, mediaUrl, mediaType,description, content } = req.body;
    console.log(req.body);
    const post = new models.Post({ userId, content,description, mediaUrl, mediaType });
    const savedPost = await post.save();
    await models.Users.findOneAndUpdate(
      { _id: userId },
      { $inc: { posts: 1 } } // Increment postCount field by 1
    );
    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the post.' });
  }
});


app.get('/posts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const followersData = await models.Follow.find({ userId });
    req.followersData = followersData;
    const posts = await models.Post.find().populate('userId');
    const updatedPosts = posts.map((post) => {
      const isFollowed = req.followersData.some((follow) => follow.followingId.toString() === post.userId._id.toString());
      return { ...post.toObject(), isFollowed };
    });

    res.json(updatedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the posts.' });
  }
});
 

app.get('/post/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Retrieve the posts from the database where the 'userId' matches the provided ID
    const posts = await models.Post.find({ userId });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the posts.' });
  }
});

app.get('/posts', async (req, res) => {
  try {
    // Retrieve all posts from the database
    const posts = await models.Post.find().populate('userId');
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the posts.' });
  }
});

app.get('/following/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const following = await models.Follow.find({ userId }).populate('followingId');

    res.status(200).json(following);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve following'});
  }
});



// Get a specific post by ID
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await models.Post.findById(req.params.id).populate('userId', 'username');
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the post.' });
  }
});


// Update a specific post by ID
app.put('/posts/:id', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const updatedPost = await models.Post.findByIdAndUpdate(req.params.id, {
      userId,
      content,
      updatedAt: Date.now(),
    }, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the post.' });
  }
});


// Delete a specific post by ID
app.delete('/posts/:id', async (req, res) => {
  try {
    const deletedPost = await models.Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json(deletedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the post.' });
  }
});


// Create a new comment
app.post('/comments', async (req, res) => {
  try {
    const comment = new models.Comment(req.body);
    const savedComment = await comment.save();
    res.json(savedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});


// Get all comments
app.get('/comments', async (req, res) => {
  try {
    const comments = await models.Comment.find().populate('userId', 'username avatar');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
});


// Delete a specific comment by ID
app.delete('/comments/:id', async (req, res) => {
  try {
    const comment = await models.Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

app.post('/likes', async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const like = new models.Like({
      userId,
      postId,
    });
    const newLike = await like.save();

    res.status(201).json(newLike);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create like' });
  }
});

app.get('/likes', async (req, res) => {
  try {
    const likes = await models.Like.find();

    res.status(200).json(likes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve likes' });
  }
});



// API endpoint to update the likes count for a post
app.put('/posts/:postId/likes', async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await models.Post.findById(postId);
    console.log(post)
    post.likes += 1;
    await post.save();
    
    res.status(200).json({ message: 'Likes count updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update likes count' });
  }
});

app.delete('/dislike/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    await models.Like.deleteOne({ postId });

    res.status(200).json({ message: 'Like deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete like' });
  }
});


// Create a new follow
app.post('/follow', async (req, res) => {
  try {
    const { userId, followingId } = req.body;
    const follow = new models.Follow({
      userId,
      followingId,
    });
    const newFollow = await follow.save();

    await models.Users.findByIdAndUpdate(userId, { $addToSet: { followingId: followingId } });
    await models.Users.findByIdAndUpdate(followingId, { $addToSet: { followerId: userId } });

    res.status(201).json(newFollow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create follow' });
  }
});


app.delete('/follow/:followingId/:followerId', async (req, res) => {
  try {
    const followingId = req.params.followingId;
    const followerId = req.params.followerId;
    const deletedFollow = await models.Follow.findOneAndDelete({ followingId });

    // Update the user document to remove the followerId from the followerId list
    const updatedUser = await models.Users.findByIdAndUpdate(followingId, {
      $pull: { followerId: followerId },
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    deletedFollow.save()

    res.status(200).json({ message: 'Follower removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete follow' });
  }
});




app.get('/follow', async (req, res) => {
  try {
    const follows = await models.Follow.find()
      .populate('userId')
      .populate('followingId');

    res.status(200).json(follows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve follows' });
  }
});



// Create a new story
app.post('/stories', async (req, res) => {
  try {
    const { userId, title, description, imageUrl } = req.body;
    console.log(req.body)
    const story = new models.Story({ userId, title, description, imageUrl });
    await story.save();
    res.status(201).json(story);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});


// Get all stories
app.get('/stories', async (req, res) => {
  try {
    const stories = await models.Story.find();
    res.json(stories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

app.get('/followers/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const followers = await models.Follow.find({ followingId: userId }).populate('userId');

    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve followers' });
  }
});
app.get('/following/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const follows = await models.Follow.find({ followerId: userId }).populate('followerId');

    res.status(200).json(follows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve followers' });
  }
});




app.post('/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const newMessage = new models.Message({
      senderId,
      receiverId,
      content,
      createdAt: Date.now()
    });
    const savedMessage = await newMessage.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create a new message.' });
  }
});


app.get('/messages', async (req, res) => {
  try {
    const messages = await models.Message.find();
    const senderIds = messages.map(message => message.senderId);
    const receiverIds = messages.map(message => message.receiverId);
    
    const senders = await models.Users.find({ _id: { $in: senderIds } });
    const receivers = await models.Users.find({ _id: { $in: receiverIds } });
    const messagesWithUsers = messages.map(message => {
      const sender = senders.find(user => user._id.equals(message.senderId));
      const receiver = receivers.find(user => user._id.equals(message.receiverId));
      return { ...message._doc, sender, receiver };
    });

    res.json(messagesWithUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});


// Schedule a task to run every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    // Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

    // Find and delete the stories older than 24 hours
    await models.Story.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });

    console.log('Old stories deleted successfully.');
  } catch (error) {
    console.error('Failed to delete old stories:', error);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
module.exports = app;