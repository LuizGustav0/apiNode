//importar express e bodyParser
const express = require('express');
const bodyParser = require('body-parser');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));



//Todos controles vão ser importados automaticamente
require('./app/controllers/index')(app);




app.listen(3000);