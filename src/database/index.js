
const mongoose = require('mongoose');



mongoose.connect('mongodb://localhost/my_database', {
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => {
  console.log('conectado');
});


module.exports = mongoose;