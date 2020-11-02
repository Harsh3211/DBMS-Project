var express = require("express");
var bodyParser = require('body-parser');
var mysql = require('mysql');
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

var connection; // For mysql

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
      email: req.session.email,
      userid: req.session.userid
    });
    console.log('Dashboard');
  } else {
    console.log('error in opening dashboard');
    res.redirect('/');
  }
})

app.get('/cart', function(req, res) {
  if (req.session.loggedin == true) {
    tableName = 'cart';
    userid = req.session.userid;
    connectDB();
    q = "select * from seller natural join (select * from deal natural join (select * from category natural join (select * from brand natural join (select * from product natural join (select * from cart natural join availability) as avil) as brands) as cat) as deals) as sell where customer_id= "+userid+" order by p_name ";
    console.log(q);
    connection.query(q,function(error, results){
      if(error) throw error;
      console.log(results);
      res.render('cart.ejs', {
        title: tableName,
        userData: results,
        username: req.session.username,
        email: req.session.email,
        userid: userid,
      });
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
    var q = 'select * from ' + tableName;
    connection.query(q, function(error, results) {
      if (error) throw error;
      console.log(results.length);
      count = results.length;
      res.render('categories.ejs', {
        title: tableName,
        userData: results,
        count: count,
        username: req.session.username,
        email: req.session.email,
        userid: req.session.userid
      });
    });
    connection.end();
    console.log('Categories');
  } else {
    console.log('error in opening cart');
    res.redirect('/dashboard');
  }
})

app.get('/products/:id/:category/:city', function(req, res) {
  if (req.session.loggedin == true) {

    connectDB();
    tableName = 'product';
    catid = req.params.id;
    c_name = req.params.category;
    city = req.params.city;
    var q = 'select * from deal natural join (select * from seller natural join (select * from brand natural join (select * from availability natural join product) as prodTable) as prod)as proddeal where category_id = \'' + catid + '\' and location_id = ' + city + ' order by p_name';
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
        userid: req.session.userid,
        id: catid,
        c_name: c_name,
        city: city
      });
    });
    connection.end();
    console.log('Categories with id ' + catid);
  } else {
    console.log('error in opening cart');
    res.redirect('/dashboard');
  }
});

app.get('/add2cart/:product_id/:customer_id/:seller_id/:location_id/:quantity', function(req, res) {
  if (req.session.loggedin == true) {

    //connectDB();
    var tableName = 'cart';
    var seller_id = req.params.seller_id;
    var customer_id = req.params.customer_id;
    var location_id = req.params.location_id;
    var product_id = req.params.product_id;
    var quantity = req.params.quantity;

    var q1 = 'insert into cart (customer_id,product_id,seller_id,location_id,quantity) values(' + customer_id + ',\'' + product_id + '\',\'' + seller_id + '\',' + location_id + ',' + quantity + ');';
    var q = 'select count(*) as count from cart where product_id = ' + '\'' + product_id + '\' and customer_id = ' + customer_id + ' and seller_id= \'' + seller_id + '\' and location_id = ' + location_id + ' ;';
    console.log(q);
    console.log(q1);
    connectDB();
    connection.query(q, function(error1, results) {
      if (error1) throw error;
      count = results.length;
      console.log(results);
      //res.redirect('/cart');
      if(results[0].count == 0) {
        connectDB();
        connection.query(q1, function(error2,result_i) {
          if(error2) throw error2;
          console.log(result_i);
          res.redirect('/cart');
        })

      }else {
        q2 = "update cart set quantity = quantity + 1 where customer_id=\'"+customer_id+"\' and product_id=\'"+product_id+"\' and seller_id=\'"+seller_id+"\' and location_id= "+location_id+";"
        console.log('Record updated');
        console.log(q2);
        connectDB();
        connection.query(q2, function(error3,result_increment) {
          if(error3) throw error3;
          console.log(result_increment);
        res.redirect('/cart');
        });
      }
    });
    connection.end();
    //res.redirect('/cart');
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

//select count(*) from cart where customer_id=8 and product_id='prodo0ld' and seller_id='sell05' and location_id= 411005;

//update cart set quantity = quantity + 1 where customer_id=8 and product_id='prodo0ld' and seller_id='sell05' and location_id= 411005;
