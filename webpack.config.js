var path = require('path');

module.exports = {
    context: path.join(__dirname, 'src'), // resolves entry below, must be absolute path
    entry: './main.js',
    mode: 'development',
	resolve: {
	  modules: [ path.resolve('./node_modules')],
	  fallback: {
	    "fs": false,
	    "tls": false,
	    "net": false,
	    "path": false,
	    "zlib": false,
	    "http": false,
	    "https": false,
	    "url": false
      }
    },    
    output: {
        path: path.join(__dirname, 'public'), 
        filename: 'main_w_fcl_client.js',
        publicPath: 'public'
    }
};