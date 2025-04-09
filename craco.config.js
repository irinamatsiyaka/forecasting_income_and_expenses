// craco.config.js
const webpack = require("webpack");

module.exports = {
   webpack: {
      configure: (webpackConfig) => {
         webpackConfig.devtool = false;
         // Устанавливаем fallback для модулей:
         webpackConfig.resolve.fallback = {
            ...webpackConfig.resolve.fallback,
            fs: false, // fs не нужен в браузере
            path: false, // игнорируем path (если arima не требует его функционал)
            buffer: require.resolve("buffer/"),
         };

         // Добавляем плагин, чтобы игнорировать модули fs и path
         webpackConfig.plugins.push(
            new webpack.IgnorePlugin({ resourceRegExp: /^fs$/ }),
            new webpack.IgnorePlugin({ resourceRegExp: /^path$/ })
         );

         return webpackConfig;
      },
   },
};
