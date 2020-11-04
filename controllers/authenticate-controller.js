var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');

var connection = require('./../config');
module.exports.authenticate = function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var location = req.body.location;


  connection.query('SELECT * FROM users WHERE email = ?', [email], function(error, results, fields) {
    if (error) {
      res.json({
        status: false,
        message: 'there are some error with query'
      })
    } else {

      if (results.length > 0) {
        decryptedString = cryptr.decrypt(results[0].password);
        if (password == decryptedString) {
          req.session.loggedin = true;
          req.session.username = results[0].name;
          req.session.email = results[0].email;
          req.session.userid = results[0].id;
          req.session.location = location;
          console.log(results);
          res.redirect('/dashboard');
        } else {
          console.log('error1');
          res.redirect('/register');
        }
      } else {
        console.log('error2');
        res.redirect('/register');
      }
    }
  });
}
