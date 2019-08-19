var express = require('express'),
app = express(),
cors = require("cors"),
path = require('path'),
router = express.Router(),
bodyParser = require('body-parser');

// we impliment cors & helmet for security
//start code for env
process.env.NODE_ENV = 'development';
const config = require('./config/config.js');
var url=global.gConfig.url;
// end code for env

app.use(cors({origin:url}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes = require('./api/routes/automateRoutes');
app.use('/static', express.static(path.join(__dirname, 'public')));


 app.use(routes);
 app.set('views', path.join(__dirname, 'api/views'));
 app.set('view engine', 'ejs');

 app.listen(global.gConfig.node_port, () => {
  console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.node_port}`);
});
