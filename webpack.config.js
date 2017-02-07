var webpack = require('webpack');

module.exports = {
	entry: {
		admin: './client/js/main.js',
		mobile: './client/js/mobile.js',
		login: './client/js/login.js'
	},
	output: {
		filename: '[name].bundle.js',
		chunkFilename: '[id].bundle.js',
		path: __dirname + '/public/dist',
		publicPath: '/dist/'
	},
	module: {
		loaders: [{test: '/materialize-css/bin/', loader: 'imports?jQuery=jquery,$=jquery,hammerjs'},
	  		{test: /\.json$/, loader: 'json-loader'},
			{ test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader:"url?limit=10000&mimetype=application/font-woff" },
      		{ test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file" }]
	},
	node: {
		console: true,
		fs: 'empty',
		tls: 'empty',
		process: true
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.common.js',
			'jquery': 'jquery/src/jquery'
		}
	},
	plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
		new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' })
    ]
}