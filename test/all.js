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
 
  
  var dir_name = 'mydir'
    , file_name = 'hello.txt'
    , local_file ='./test/sample/' + file_name
    , remote_file = '/' + dir_name + '/' + file_name
    , file_content = fs.readFileSync(local_file).toString();

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
        err.should.equal(' at path \'The folder \''+dir_name+'\' already exists.\'');
        done();
      })
    });
  })


  describe('put', function() {
    it('should upload file', function(done) {
      this.timeout(5000);

      dbox_connect.put(
        local_file, 
        remote_file,
        function(err, reply){
          should.not.exist(err);
          should.exist(reply);
          reply.should.have.property('path', remote_file);
          done()
        })
    });

    it('should return error', function(done) {
      this.timeout(5000);

      dbox_connect.put(
        local_file + '_invalid', 
        dir_name + '/hello.txt',
        function(err, reply){
          should.exist(err);
          should.not.exist(reply);
          done()
        })
    });

  });
  
  describe('get', function(){
    
    it('should get file content', function(done) {
      this.timeout(5000);

      dbox_connect.get(remote_file, function(err, content, metadata){
        should.not.exist(err);
        should.exist(content);
        should.exist(metadata);
        metadata.should.have.property('path', remote_file);
        content.toString().should.equal(file_content);
        done();
      });
    })
    
    it('should return error', function(done){
      this.timeout(5000);

      dbox_connect.get(remote_file + 'invalid', function(err, content, metadata){
        should.exist(err);
        should.not.exist(content);
        should.not.exist(metadata);
        done();
      });
    })

  })

  describe('getDirectLink', function(){
    it('should return url', function(done){
      this.timeout(5000);
      
      dbox_connect.getDirectLink(remote_file, function(err, url){
        should.not.exist(err);
        should.exist(url);
        done();
      });
    })

    it('should return url faster', function(done){
      this.timeout(100);

      dbox_connect.getDirectLink(remote_file, function(err, url){
        should.not.exist(err);
        should.exist(url);
        done();
      });
    })
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

