var express = require('express')
  , request = require('supertest')
  , fs = require('fs')
  , DBoxExpress = require('..');


describe('DBoxExpress', function(){
  var dbox_express = new DBoxExpress(require('./token'))
    , app = express();
    
  app.use(dbox_express.redirect('/test'));
  
  describe('upload', function() {
    it('should upload file')
  })

});

