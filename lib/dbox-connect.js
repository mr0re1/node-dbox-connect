var dbox  = require('dbox')
  , fs    = require('fs')
  , path  = require('path')



var DBoxConnect = function(token, opt) {
  this.dbox_app = dbox.app({
    app_key: token.app_key, 
    app_secret: token.app_secret
  });
  this.dbox_client = this.dbox_app.client({
    oauth_token: token.oauth_token, 
    oauth_token_secret: token.oauth_token_secret, 
    uid: token.uid
  });

  this.dlcache = {};
}


/*
 * Methods
 */

DBoxConnect.prototype.getDirectLink = function(path, fn) {
  if (this.dlcache[path]) {
    var c = this.dlcache[path]
      , now = new Date();
    if (now < c.expires) return fn(null, c.url)
    else delete this.dlcache[path];
  }
  
  var cache = this.dlcache;

  this.dbox_client.media(path, function(status, reply){
    if (status != 200) return fn(reply);
    cache[path] = { url: reply.url, expires: new Date(reply.expires) };
    fn(null, reply.url);
  });
}

DBoxConnect.prototype.upload = function(source, target, fn) {
  var self = this;
  fs.readFile(source, function(err, data){
    if (err) return fn(err);
    self.dbox_client.put(target, data, function(status, reply){
      if (status == 200) fn(null, reply)
      else fn(reply)
    });
  });
}

DBoxConnect.prototype.mkdir = function(path, fn) {
  this.dbox_client.mkdir(path, function(status, reply){
    if (status == 200) fn(null, reply)
    else fn(reply)
  });
}

DBoxConnect.prototype.rm = function(path, fn) {
  this.dbox_client.rm(path, function(status, reply){
    if (status == 200) fn(null, reply)
    else fn(reply)
  });
}

/*
 * Middlewares
 */
DBoxConnect.prototype.redirect = function(pattern) {
  var self = this
    , route = RegExp(pattern);

  return function(req, res, next) {
    if (route.test(req.url)) {
      self.getDirectLink(req.url, function(err, direct) {
        if (err) next(err)
        else res.redirect(direct);
      })
    }
  }
}


DBoxConnect.prototype.uploader = function(opt) {
  opt = opt || {};
  for (var key in DBoxConnect.uploader_default) 
    opt[key] = (opt[key] != undefined) ? opt[key] : DBoxConnect.uploader_default[key];

  var self = this;  
  
  return function(req, res, next) {
    if (! req.files || ! req.files[opt.field]) return next();
    var file = req.files[opt.field]
      , target = opt.to + '/' + opt.nativeName ? file.name : path.basename(file.path);

    self.upload(file.path, target, function(err, reply) {
      if (err) return next(err)
      file.dbox_path = target;
      if (opt.removeLocal) fs.unlink(file.path, next)
      else next();
    })
    
  }
}
DBoxConnect.uploader_default = {
  field: 'file',
  to: '/',
  nativeName: false,
  removeLocal: true
}
/*
 * CUI utility
 */
DBoxConnect.obtaintoken = function() {
  var prompt = require('prompt');
  
  var default_app = {
    app_key:    process.env.npm_package_config_default_app_key,
    app_secret: process.env.npm_package_config_default_app_secret
  };


  function getApp(fn) {
    console.log('Input your DropBox application key and secret (see on www.dropbox.com/developers/apps) or nothing(NOT RECOMENDED)');
    prompt.get(['key', 'secret'], function(err, result){
      if (err) return fn(err);
      if (! result.key) return fn(null, dbox.app(default_app), default_app);

      var app_conf = {
        app_key: result.key,
        app_secret: result.secret
      };
      return fn(null, dbox.app(app_conf), app_conf);
    });
  };
 
  function getRequestToken(app, fn) {
    app.requesttoken(function(status, request_token){
      if(status !== 200) fn(new Error('On request token DropBox return status: ' + status))
      else fn(null, request_token);
    })
  };
  
  function getAccessToken(app, request_token, fn) {
    console.log('\n\nVisit this url to grant authorization to the client: \n',
      'https://www.dropbox.com/1/oauth/authorize?oauth_token='+request_token.oauth_token);
    console.log('Whet it will be DONE press any key');

    prompt.get(['any key'], function(err){
      if (err) fn(err)
      else 
        app.accesstoken(request_token, function(status, access_token){
          if (status !== 200) fn(new Error('On access token DropBox return status: ' + status))
          else fn(null, access_token);   
        });
    });

  }

  prompt.start();
  getApp(function(err, app, app_conf) {
    if(err) console.error(err)
    else getRequestToken(app, function(err, request_token){
      if(err) console.error(err)
      else getAccessToken(app, request_token, function(err, access_token){
        if(err) console.error(err)
        else {
          console.log(
            '\n\nUse this configuration to initialize your drobpox-agent:\n', 
            {
              app_key: app_conf.app_key,
              app_secret: app_conf.app_secret,
              oauth_token: access_token.oauth_token,
              oauth_token_secret: access_token.oauth_token_secret,
              uid: access_token.uid
          });
        }
      });
    });
  });
};


if(require.main === module)
  DBoxConnect.obtaintoken()
else module.exports = DBoxConnect;
