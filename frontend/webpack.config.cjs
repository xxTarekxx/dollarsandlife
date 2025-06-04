// frontend/webpack.config.cjs

const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// --- MODIFIED SECTION FOR DEBUGGING ---
const nodeEnvForDotenv = process.env.NODE_ENV; // See what NODE_ENV is before webpack --mode might override it for the export
const envPath = nodeEnvForDotenv === 'production' ? path.resolve(__dirname, '.env.production') : path.resolve(__dirname, '.env');


const envConfig = dotenv.config({ path: envPath }); // Explicitly load based on initial NODE_ENV

if (envConfig.error) {
    console.warn(`[Webpack Build] Warning: dotenv.config() error: `, envConfig.error);
} else if (Object.keys(envConfig.parsed || {}).length === 0) {
    console.warn(`[Webpack Build] Warning: dotenv.config() loaded an empty object from ${envPath}. Check file content and path.`);
} else {
}

// --- END OF MODIFIED SECTION ---

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production'; // argv.mode is reliable from webpack CLI


    return {
        mode: isProduction ? 'production' : 'development',
        entry: './src/main.tsx', // You have this as entry
        output: {
            filename: isProduction ? 'assets/[name].[contenthash].js' : 'assets/[name].js',
            path: path.resolve(__dirname, 'build'),
            publicPath: '/',
            clean: true,
        },
        module: { // Your existing module rules
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif|svg|webp)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/images/[hash][ext][query]'
                    }
                },
            ],
        },
        plugins: [ // Your existing plugins, ensure DefinePlugin is correct
            new HtmlWebpackPlugin({
                template: './index.html',
                filename: 'index.html',
            }),
            new MiniCssExtractPlugin({
                filename: 'assets/[name].[contenthash].css',
                chunkFilename: 'assets/[id].[contenthash].css',
            }),
            ...(isProduction
                ? [
                    new CompressionPlugin({
                        filename: '[path][base].gz',
                        algorithm: 'gzip',
                        test: /\.(js|mjs|json|css|html|svg|webp)$/i,
                        threshold: 1024,
                        minRatio: 0.8,
                    }),
                    new CompressionPlugin({
                        filename: '[path][base].br',
                        algorithm: 'brotliCompress',
                        test: /\.(js|mjs|json|css|html|svg|webp)$/i,
                        threshold: 1024,
                        minRatio: 0.8,
                    }),
                ]
                : []),
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: 'stats.html',
                openAnalyzer: false,
            }),
            // --- ENSURE THIS DefinePlugin IS CORRECT ---
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
                'process.env.REACT_APP_API_BASE': JSON.stringify(process.env.REACT_APP_API_BASE), // Uses process.env populated by dotenv
                'process.env.REACT_APP_INTERNAL_IP_PREFIX': JSON.stringify(process.env.REACT_APP_INTERNAL_IP_PREFIX),
                'process.env.REACT_APP_EMAILJS_SERVICE_ID': JSON.stringify(process.env.REACT_APP_EMAILJS_SERVICE_ID),
                'process.env.REACT_APP_EMAILJS_TEMPLATE_ID': JSON.stringify(process.env.REACT_APP_EMAILJS_TEMPLATE_ID),
                'process.env.REACT_APP_EMAILJS_USER_ID': JSON.stringify(process.env.REACT_APP_EMAILJS_USER_ID),
                'process.env.REACT_APP_RECAPTCHA_SITE_KEY': JSON.stringify(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
                'process.env.REACT_APP_RSS2JSON_API_KEY': JSON.stringify(process.env.REACT_APP_RSS2JSON_API_KEY),
            }),
            // --- END OF DefinePlugin SECTION ---
            new CopyPlugin({
                patterns: [
                    { from: 'public/data', to: 'data' },
                    { from: 'public/403-apache.html', to: '403-apache.html' }, // <-- ADD THIS
                    { from: 'public/404-apache.html', to: '404-apache.html' }, // <-- ADD THIS
                    { from: 'public/500-apache.html', to: '500-apache.html' }, // <-- ADD THIS
                    { from: 'src/assets', to: 'images' },
                    { from: 'ads', to: 'ads' },
                    { from: '.htaccess', to: '' },
                    { from: 'ads.txt', to: 'ads.txt' },
                    { from: 'f2f534c237f3484bbed9b00b5ccad78a.txt', to: 'f2f534c237f3484bbed9b00b5ccad78a.txt' },
                    { from: 'robots.txt', to: 'robots.txt' },
                    { from: 'public/sitemap.xml', to: 'sitemap.xml' },
                ],
            }),
        ],
        resolve: { // Your existing resolve
            extensions: ['.tsx', '.ts', '.js'],
        },
        devServer: { // Your existing devServer
            port: 3000,
            static: {
                directory: path.join(__dirname, 'public'),
            },
            historyApiFallback: true,
            hot: true,
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
        },
        optimization: { // Your existing optimization
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'all',
                    },
                    recaptcha: { // ... and other cacheGroups
                        test: /[\\/]node_modules[\\/]react-google-recaptcha[\\/]/,
                        name: 'recaptcha',
                        chunks: 'all',
                    },
                    emailjs: {
                        test: /[\\/]node_modules[\\/]emailjs-com[\\/]/,
                        name: 'emailjs',
                        chunks: 'all',
                    },
                    fortawesome: {
                        test: /[\\/]node_modules[\\/]@fortawesome[\\/]/,
                        name: 'fortawesome',
                        chunks: 'all',
                    },
                },
            },
            usedExports: true,
        },
        performance: { // Your existing performance
            maxAssetSize: 1000000,
            hints: isProduction ? 'warning' : false,
        },
    };
};