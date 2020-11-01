var express = require("express");
var bodyParser = require('body-parser');
var mysql      = require('mysql');
var session = require('express-session');
var app = express();
var authenticateController = require('./controllers/authenticate-controller');
var registerController = require('./controllers/register-controller');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(express.static("public"));
app.set('view engine', "ejs");

var connection ; // For mysql

function connectDB() {
  connection = mysql.createConnection({
    host: "localhost",
    user: "harsh",
    password: "harsh123",
    database: "sample3"
  });
};

app.get('/', function(req, res) {
  res.render('login.ejs');
})

app.get('/register', function(req, res) {
  res.render('register.ejs');
})

app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  });
})


app.get('/dashboard', function(req, res) {
  if (req.session.loggedin == true) {
    res.render('dashboard.ejs', {
      username: req.session.username,
      email: req.session.email
    });
    console.log('Dashboard');
  } else {
    console.log('error in opening dashboard');
    res.redirect('/');
  }
})

app.get('/cart', function(req, res) {
  if (req.session.loggedin == true) {
    res.render('cart.ejs', {
      username: req.session.username,
      email: req.session.email
    });
    console.log('Cart');
  } else {
    console.log('error in opening cart');
    res.redirect('/dashboard');
  }
})

app.get('/product', function(req, res) {
  if (req.session.loggedin == true) {
    res.render('product.ejs', {
      username: req.session.username,
      email: req.session.email
    });
    console.log('Products');
  } else {
    console.log('error in opening cart');
    res.redirect('/dashboard');
  }
})

app.get('/categories', function(req, res) {
  if (req.session.loggedin == true) {

    connectDB();
    tableName = 'category'
    var q = 'select * from '+ tableName;
    connection.query(q, function(error, results) {
      if (error) throw error;
      console.log(results.length);
      count = results.length;
      res.render('categories.ejs', {
        title: tableName,
        userData: results,
        count: count,
        username: req.session.username,
        email: req.session.email
      });
    });
    connection.end();
    console.log('Categories');
  } else {
    console.log('error in opening cart');
    res.redirect('/dashboard');
  }
})

app.get('/products/:id.:category',function(req,res) {
  if (req.session.loggedin == true) {

    connectDB();
    tableName = 'product';
    catid = req.params.id;
    c_name = req.params.category;
    pincode = 411005
    var q = 'select * from deal natural join (select * from seller natural join (select * from brand natural join (select * from availability natural join product) as prodTable) as prod)as proddeal where category_id = \''+catid+'\' and location_id = '+pincode+' order by p_name';
    connection.query(q, function(error, results) {
      if (error) throw error;
      console.log(results.length);
      count = results.length;
      console.log(results);

      res.render('product.ejs', {
        title: tableName,
        userData: results,
        count: count,
        username: req.session.username,
        email: req.session.email,
        id: catid,
        c_name: c_name
      });
    });
    connection.end();
    console.log('Categories with id '+ catid);
  } else {
    console.log('error in opening cart');
    res.redirect('/dashboard');
  }
});

// app.get('/cart/:id.:category',function(req,res) {
//   if (req.session.loggedin == true) {
//
//     connectDB();
//     tableName = 'product';
//     catid = req.params.id;
//     c_name = req.params.category;
//     var q = 'select * from brand natural join '+tableName + ' where category_id = \''+catid+'\' order by p_name';
//     connection.query(q, function(error, results) {
//       if (error) throw error;
//       console.log(results.length);
//       count = results.length;
//
//       res.render('cart.ejs', {
//         title: tableName,
//         userData: results,
//         count: count,
//         username: req.session.username,
//         email: req.session.email,
//         id: catid,
//         c_name: c_name
//       });
//     });
//     connection.end();
//     console.log('Categories with id '+ catid);
//   } else {
//     console.log('error in opening cart');
//     res.redirect('/dashboard');
//   }
// });



/* route to handle login and registration */
app.post('/api/register', registerController.register);
app.post('/api/authenticate', authenticateController.authenticate);

console.log(authenticateController);
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/authenticate-controller', authenticateController.authenticate);
app.listen(3000);

//select * from brand natural join (select * from availability natural join product) as prodTable where category_id ='abc01' and location_id = 411005 order by p_name;
