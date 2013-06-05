var connect = require('connect')
  , request = require('supertest')
  , fs = require('fs')
  , DBoxConnect = require('..');


describe('DBoxExpress', function(){
  var dbox_connect = new DBoxConnect(require('./conf/token'))
    , app = connect();
    
  app.use(dbox_connect.redirect('/test'));
  
  describe('upload', function() {
    it('should upload file')
  })

});

