const mongoose = require("mongoose");
// Middleware
const db='mongodb+srv://owneradani:oYU3ycNxEntuErsg@cluster0.lkqz0co.mongodb.net/?retryWrites=true&w=majority'
//const db = 'mongodb+srv://socialmedia:socialmedia@cluster0.nsffmg4.mongodb.net/SocialMediaApp?retryWrites=true&w=majority'
// Connect to MongoDB using the connection string
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log(`Connection successful`);
}).catch((e) => {
  console.log(`No connection: ${e}`);
});

// mongodb://localhost:27017