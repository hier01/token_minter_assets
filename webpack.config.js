const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    context: path.join(__dirname, 'src'), // resolves entry below, must be absolute path
    entry: './main.js',
    mode: 'development',
	resolve: {
	  modules: [ path.resolve('./node_modules')],
    },    
	plugins: [
		new NodePolyfillPlugin(),
	],
    output: {
        path: path.join(__dirname, 'public'), 
        filename: 'main_w_fcl_client.js',
        publicPath: 'public'
    }
};