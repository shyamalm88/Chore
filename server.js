var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var router = express.Router();


var app = express();



// app usage codes
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());





var api = require('./server/routes/boardRoutes');
// // REGISTER OUR ROUTES -------------------------------
// // all of our routes will be prefixed with /api
app.use('/api', api);


var localAuth = require('./server/routes/localAuthRoutes');
app.use('/auth', localAuth);

require('./server/config/passport')(passport); // pass passport for configuration

//cookie configuration
var sess = {
    secret: 'ArghyaChoreTrello', // session secret
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: new Date(Date.now() + 3600000), //1 Hour
        expires: new Date(Date.now() + 3600000), //1 Hour
    },
    rolling: true
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess));


//passport initialize and passport session initialize
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


// routes ======================================================================
require('./server/routes/authRoutes.js')(app, passport); // load our routes and pass in our app and fully configured passport


//indicating routing files to index.html
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});




//mongodb connection
var configDB = require('./server/config/database.js');
mongoose.connect(configDB.url);










var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Server up: http://localhost:' + port);
});