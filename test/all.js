var connect = require('connect')
  , request = require('supertest')
  , should = require('should')
  , fs = require('fs')
  , DBoxConnect = require('..');


describe('all', function(){
  try {
    var token = require('./conf/token');
  } catch (e) {
    console.log('To generate token use \'npm dbox-connect start\'');
    return;
  }
  var dbox_connect = new DBoxConnect(token)
    , app = connect();
    
  app.use(dbox_connect.redirect('/test'));
 
  
  var dir_name = 'mydir';

  before(function(done){
    dbox_connect.rm(dir_name, function() { done() });
  });

    
  describe('mkdir', function() {
    it('should make directory', function(done) {
      this.timeout(5000);

      dbox_connect.mkdir(dir_name, function(err, reply) {
        should.not.exist(err);
        should.exist(reply);
        reply.should.have.property('path', '/' + dir_name);
        done();
      });
    })

    it('should return error when folder already exist', function(done){
      this.timeout(5000);

      dbox_connect.mkdir(dir_name, function(err, reply){
        should.exist(err);
        should.not.exist(reply);
        err.should.have.property('error');
        err.error.should.equal(
          ' at path \'The folder \''+dir_name+'\' already exists.\'');
        done();
      })
    });
  })


  describe('upload', function() {
    it('should upload file', function(done) {
      this.timeout(5000);

      dbox_connect.upload(
        './test/sample/hello.txt', 
        dir_name + '/hello.txt',
        function(err, reply){
          should.not.exist(err);
          should.exist(reply);
          reply.should.have.property('path', '/' + dir_name + '/hello.txt');
          done()
        })
    });
  });

  describe('rm', function(){
    it('should remove directory', function(done){
      this.timeout(5000);

      dbox_connect.rm(dir_name, function(err, reply){  
        should.not.exist(err);
        reply.should.have.property("path", '/' + dir_name);
        done();
      })
    });
  });

});

