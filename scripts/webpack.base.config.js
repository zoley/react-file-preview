const path = require('path');
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.svg/,
        use: ['url-loader']
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png)$/,
        use: ["url-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js",".jsx"],
    alias: {
      "@": path.resolve(__dirname, "../src")
    },
  },
};
