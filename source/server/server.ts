//Import dependencies
import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
import * as logger from "morgan";
import * as serveStatic from "serve-static";
import * as mongoose from "mongoose";
import * as cookieParser from "cookie-parser";
import * as passport from "passport";
import {configPassport} from "./authConfig";
import * as session from "express-session";
import * as routes from "./routes";
import * as http from "http";
import * as socketio from "socket.io";
//import * as models from "./models";



//Configuration settings
let app:express.Express = express();
app.set('appName', 'Black & White Chat');
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

    //Create an http socketed server
let server = http.createServer(app);
let io = socketio.listen(server);

configPassport(passport);



//Connect to DB
let dbURL:string = process.env.MONGOQ_URL || 'mongodb://@localhost:27017/chat';
let db: mongoose.MongooseThenable = mongoose.connect(dbURL);



//Define middleware
app.use(logger('dev'));
app.use(session({
    secret:'2C44774A-D649-4D44-9535-46E296EF984F',
    resave: false,
    saveUninitialized: false
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(serveStatic(path.join(__dirname, 'public')));




//Routes
    //Login Routes
app.post('/login', passport.authenticate('local-login'), routes.User.login);
app.post('/logout', routes.User.logout);
app.post('/signup', routes.User.signup);
app.get('/loggedin', routes.User.loggedin);

    //Data query routes
app.get('/userData', routes.User.getData);
app.put('/updateUserData', routes.User.updateData);

    //Main Socket Routes
io.on('connection', routes.Socket.connection);




//Run the server
server.listen(app.get('port'), function(){
    console.log('Listening at port ' + app.get('port') + '...');
});

