var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var app = express();

const PORT = process.env.PORT || 8080

const { version } = require('../package.json')

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  exposedHeaders: [ 'Content-Type', 'Link' ],
  preflightContinue: true
}));
app.use(require('./router'));

app.listen(PORT,function(){
    console.log(`We have started our server on port ${PORT} with API version ${version}`);
});
