const { defineConfig } = require('@vue/cli-service')
// const webpack = require('webpack')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		},
  },
  // configureWebpack: {
  //   plugins: [
  //     new webpack.ProvidePlugin({
  //       process: 'process/browser',
  //       Buffer: ['buffer', 'Buffer']
  //     })
  //   ]
  // }
  
})
