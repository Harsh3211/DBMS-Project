const express = require("express");
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const app = express();
const authenticateController = require('./controllers/authenticate-controller');
const registerController = require('./controllers/register-controller');
const faker = require('faker');
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
      userid: req.session.userid,
      location: req.session.location
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
    location = req.session.location;
    q = "select * from seller natural join (select * from deal natural join (select * from category natural join (select * from brand natural join (select * from product natural join (select * from cart natural join availability) as avil) as brands) as cat) as deals) as sell where customer_id= " + userid + " and location_id= " + location + " order by p_name ";
    console.log(q);
    connection.query(q, function(error, results) {
      if (error) throw error;
      console.log(results);
      res.render('cart.ejs', {
        title: tableName,
        userData: results,
        username: req.session.username,
        email: req.session.email,
        userid: req.session.userid,
        location: req.session.location,
        userid: userid
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
      email: req.session.email,
      userid: req.session.userid,
      location: req.session.location
    });
    console.log('Products');
  } else {
    console.log('error in opening cart');
    res.redirect('/dashboard');
  }
})

app.get('/order', function(req, res) {
  if (req.session.loggedin == true) {
    userId = req.session.userid;

    location = req.session.location;
    q1 = "select * from customerorder natural join (select * from brand natural join (select * from shipper natural join(select * from seller natural join(select * from category natural join(select * from deal natural join(select * from product natural join (select * from availability natural join (select * from contains inner join location on location.pincode=contains.location_id where customer_id = "+userId+" ) as avail) as prod) as deals) as cat) as sellers) as shippers) as brand) as orders   order by order_datetime ";
    console.log(q1);
    connectDB();
    connection.query(q1, function(error, orders) {
      if (error) throw error;

      console.log(orders);

      q2 = "select distinct order_id from contains where customer_id=" + userId;
      console.log(q2);
      connectDB();
      connection.query(q2, function(error, order_ids) {
        if (error) throw error;
        console.log(order_ids);
        res.render('order.ejs', {
          orders: order_ids,
          userData: orders,
          username: req.session.username,
          email: req.session.email,
          userid: req.session.userid,
          location: req.session.location
        });
      });

    });
    connection.end();



    console.log('Order');
  } else {
    console.log('error in opening Order');
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
        userid: req.session.userid,
        location: req.session.location
      });
    });
    connection.end();
    console.log('Categories');
  } else {
    console.log('error in opening cart');
    res.redirect('/dashboard');
  }
})

app.get('/products/:id/:category', function(req, res) {
  if (req.session.loggedin == true) {

    connectDB();
    tableName = 'product';
    catid = req.params.id;
    c_name = req.params.category;
    city = req.session.location;
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
        location: req.session.location,
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

app.get('/add2cart/:product_id/:customer_id/:seller_id/:quantity', function(req, res) {
  if (req.session.loggedin == true) {
    var tableName = 'cart';
    var seller_id = req.params.seller_id;
    var customer_id = req.params.customer_id;
    var location_id = req.session.location;
    var product_id = req.params.product_id;
    var quantity = req.params.quantity;

    var q1 = 'insert into cart (customer_id,product_id,seller_id,location_id,quantity) values(' + customer_id + ',\'' + product_id + '\',\'' + seller_id + '\',' + location_id + ',' + quantity + ');';
    var q = 'select count(*) as count from cart where product_id = ' + '\'' + product_id + '\' and customer_id = ' + customer_id + ' and seller_id= \'' + seller_id + '\' and location_id = ' + location_id + ' ;';
    console.log(q);
    console.log(q1);
    connectDB();
    connection.query(q, function(error1, results) {
      if (error1) throw error1;
      count = results.length;
      console.log(results);
      //res.redirect('/cart');
      if (results[0].count == 0) {
        connectDB();
        connection.query(q1, function(error2, result_i) {
          if (error2) throw error2;
          console.log(result_i);
          res.redirect('/cart');
        })

      } else {
        q2 = "update cart set quantity = quantity + 1 where customer_id=\'" + customer_id + "\' and product_id=\'" + product_id + "\' and seller_id=\'" + seller_id + "\' and location_id= " + location_id + ";"
        console.log('Record updated');
        console.log(q2);
        connectDB();
        connection.query(q2, function(error3, result_increment) {
          if (error3) throw error3;
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

app.get('/payment/:amount', function(req, res) {
  if (req.session.loggedin == true) {
    console.log(req.params.amount);
    res.render('payment.ejs', {
      username: req.session.username,
      email: req.session.email,
      userid: req.session.userid,
      location: req.session.location,
      amount: req.params.amount
    });
    console.log('Dashboard');
  } else {
    console.log('error in opening dashboard');
    res.redirect('/dashboard');
  }
})

app.post('/payment', function(req, res) {
  if (req.session.loggedin == true) {
    var today = new Date();
    var payId = 'pay' + faker.random.alphaNumeric(7);
    var location = req.session.location;
    var userId = req.session.userid;
    var payment = {
      "payment_id": payId,
      "payment_date": today,
      "payment_type": req.body.payment_type,
      "amount": req.body.payment_amount
    }
    console.log(payment);
    connectDB();
    connection.query('INSERT INTO payment SET ?', payment, function(error, result_pay, fields) {
      if (error) throw error;
      var orderId = 'order' + faker.random.alphaNumeric(5);
      console.log(result_pay);
      var order = {
        "order_id": orderId,
        "customer_id": req.session.userid,
        "payment_id": payId,
        "location_id": req.session.location,
        "order_datetime": today
      }
      console.log(order);
      connectDB();
      connection.query('INSERT INTO customerorder SET ?', order, function(error, result_order) {
        if (error) throw error;
        console.log(result_order);

        var query1 = "select * from availability natural join (select * from cart where customer_id=" + userId + " and location_id=" + location + ") as new";
        console.log(query1);
        connectDB();
        connection.query(query1, function(error, products) {
          if (error) throw error;
          console.log(products);
          products.forEach(function(data) {
          connectDB();
          connection.query('select * from shipper order by rand() limit 1;', function(error, result_shipper) {
              if (error) throw error;
              console.log(result_shipper);
              var contain = {
                "seller_id": data.seller_id,
                "product_id": data.product_id,
                "location_id": location,
                "order_id": orderId,
                "shipper_id": result_shipper[0].shipper_id,
                "quantity": data.quantity,
                "customer_id": userId
              };
              console.log(contain);

              connectDB();
              var query_contain = "INSERT INTO contains SET ?";
              connection.query(query_contain, contain, function(error, result_contain) {
                if (error) throw error;
                console.log(result_contain);
                var query_emptycart = 'delete from cart where customer_id= ' + userId + ' and location_id = ' + location;
                connectDB();
                connection.query(query_emptycart, function(error, cart_empty) {
                  if (error) throw error;
                  console.log(cart_empty);
                });
              });
            });
          });
        });
      });
    });
    connection.end();
    console.log('Redirected to Orders');
    res.redirect('/dashboard');
  } else {
    console.log('error in opening dashboard');
    res.redirect('/dashboard');
  }
});

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
