var Cryptr = require('cryptr');
var express = require("express");
var connection = require('./../config');
// cryptr = new Cryptr('myTotalySecretKey');

module.exports.register = function(req, res) {

  var encryptedString = cryptr.encrypt(req.body.password);
  var users = {
    "name": req.body.name,
    "email": req.body.email,
    "password": encryptedString
  }
  connection.query('INSERT INTO users SET ?', users, function(error, results, fields) {
    if (error) {
      res.send(error.code);
      console.log(error.code);

    } else {
      res.redirect('/dashboard');
    }
  });
}
