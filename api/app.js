const express = require('express');
const router = require('./routes');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": true }));

app.use(cors());
app.use('/api', router);



// for image below
//app.use(express.static('public' ));
//app.use(express.json({ limit: '10mb' }));
//app.use(express.urlencoded({ limit: '10mb', extended: true }));

// mongoose.connect('mongodb://0.0.0.0:27017/Event_Slayer', {
  mongoose.connect('mongodb://127.0.0.1/Event_Slayer', {

  //useNewUrlParser: true,  
  // serverSelectionTimeoutMS: 3000, // Set a higher timeout value (e.g., 30 seconds) 

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})