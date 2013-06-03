var dbox  = require('dbox')
  , fs    = require('fs');


var DBoxAgent = function(opt) {
  
};















DBoxAgent.obtaintoken = function() {
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
          console.log('\n\nUse this configuration to initialize your drobpox-agent:\n', {
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
}

if(require.main === module)
  DBoxAgent.obtaintoken();
