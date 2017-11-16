var path = require("path");
var webpack = require("webpack");
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin')
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function (grunt) {
    'use strict';

    // Phaser webpack config
    var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
    var phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
    var pixi = path.join(phaserModule, 'build/custom/pixi.js');
    var p2 = path.join(phaserModule, 'build/custom/p2.js');

    var webpackConfig = {
        entry: {
            app: [path.resolve(__dirname, 'src/game')],
            vendor: ['pixi', 'p2', 'phaser']
        },
        module: {
            rules: [
                { 
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader', 
                            query: {
                                presets: ['env']
                            }
                        }
                    ], 
                    include: path.join(__dirname, 'src') 
                },
        		{
        		    test: /adventskalender-js-api/,
        		    use: [
        		        {
        			    loader: 'babel-loader',
        			    query: {
        				presets: ['env']
        			    }
        			}
        		    ]
        		},
                { 
                    test: /pixi\.js/, 
                    use: ['expose-loader?PIXI'] 
                },
                { 
                    test: /phaser-split\.js$/, 
                    use: ['expose-loader?Phaser'] 
                },
                { 
                    test: /p2\.js/, 
                    use: ['expose-loader?p2'] 
                }
            ]
        },
        output: {
            pathinfo: true,
            path: path.resolve(__dirname, '_build'),
            publicPath: "",
            filename: 'game.js'
        },
        resolve: {
            alias: {
                'phaser': phaser,
                'pixi': pixi,
                'p2': p2
            }
        }
    }

    grunt.initConfig({
        copy: {
            dist: {
                files: [
                    {expand: true, cwd: 'assets', dest: '_build/assets', src: ['**/*', '!**/*.wav', '!**/*.ltr']}
                ]
            }
        },

        webpack: {
            dist: Object.assign({
                plugins: [
                    new CleanWebpackPlugin(['_build']),
                    new webpack.optimize.UglifyJsPlugin({
                        drop_console: true,
                        minimize: true,
                        output: {
                            comments: false
                        }
                    }),
                    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor'/* chunkName= */, filename: 'vendor.js'/* filename= */}),
                    new HtmlWebpackPlugin({
                        filename: path.resolve(__dirname, '_build/index.html'),
                        template: path.resolve(__dirname, 'templates/index.html'),
                        chunks: ['vendor', 'app'],
                        chunksSortMode: 'manual',
                        minify: {
                            removeAttributeQuotes: true,
                            collapseWhitespace: true,
                            html5: true,
                            minifyCSS: true,
                            minifyJS: true,
                            minifyURLs: true,
                            removeComments: true,
                            removeEmptyAttributes: true
                        },
                        hash: true
                    })
                ]
            }, webpackConfig),
            dev: Object.assign({
                devtool: 'cheap-source-map',
                watch: true,
                plugins: [
                    new CleanWebpackPlugin(['_build']),
                    new webpack.optimize.CommonsChunkPlugin({ name: 'vendor'/* chunkName= */, filename: 'vendor.js'/* filename= */}),
                    new HtmlWebpackPlugin({
                        filename: path.resolve(__dirname, '_build/index.html'),
                        template: path.resolve(__dirname, 'templates/index.html'),
                        chunks: ['vendor', 'app'],
                        chunksSortMode: 'manual',
                        minify: {
                            removeAttributeQuotes: false,
                            collapseWhitespace: false,
                            html5: false,
                            minifyCSS: false,
                            minifyJS: false,
                            minifyURLs: false,
                            removeComments: false,
                            removeEmptyAttributes: false
                        },
                        hash: false
                    }),
                    new BrowserSyncPlugin({
                        host: process.env.IP || 'localhost',
                        port: process.env.PORT || 80,
                        server: {
                            baseDir: ['./', './_build']
                        }
                    })
                ]
            }, webpackConfig)
        },

        "gh-pages": {
            options: {
                base: "_build/"
            },
            src: ['**']
        }
    });

    grunt.registerTask('dist', [
        'webpack:dist',
        'copy:dist'
    ]);

    grunt.registerTask('dev', [
        'webpack:dev'
    ]);

    grunt.registerTask('deploy-gh', [
        'dist',
        'gh-pages'
    ]);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-gh-pages');
};
