//importar express e bodyParser
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();


app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));



//Todos controles vão ser importados automaticamente
require('./app/controllers/index')(app);




app.listen(3333);