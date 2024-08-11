const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/assets/scripts/index.js',
    output: {
        filename: 'main.min.js',
        path: path.resolve(__dirname, 'dist/assets/scripts')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/, // Обработка CSS-файлов
                use: ['style-loader', 'css-loader'] // Загрузчики
            }
            // Если используете PostCSS:
            // {
            //     test: /\.css$/,
            //     use: ['style-loader', 'css-loader', 'postcss-loader']
            // }
        ]
    },
    devtool: 'source-map'
};
