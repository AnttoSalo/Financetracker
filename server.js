
const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const mainRouter = require('./routes/index');
app.use('/', mainRouter);

app.listen(3000, () => {
  console.log('Finance Tracker running on port 3000');
});