module.exports = function(grunt){

    //Load NPM Task Plugins
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');



    //Initial config
    grunt.initConfig({

        //DEVELOPMENT
        //Typescript: JavaScript
        ts:{
            options:{
                fast: 'never',
                module: 'amd',
                target: 'es5',
                sourceMap: false,
                declaration: true,
                //noImplicitAny: true
            },
            client:{
                files:[
                    { src: ['source/js/**/*.ts'], dest: 'public/js/app.js' }
                ]
            },
            server:{
                options:{
                    module: 'commonjs',
                },
                files:[
                    { src: 'source/server/server.ts', dest: './'}
                ]

            },
            test:{
                options:{
                    module: 'commonjs'
                },
                files:[
                    { src: 'source/tests/index.ts', dest: './public/tests'}
                ]
            }
        },


        //SCSS: CSS
        sass:{
            sty:{
                options:{
                    style: 'compressed'
                },
                src: ['source/css/main.scss'],
                dest: 'public/css/main.min.css'
            }
        },

        //HTML: HTMLmin
        htmlmin:{
            dist:{
                options:{
                    removeComments: true,
                    collapseWhiteSpace: true
                },
                files:[
                    {
                        expand: true,
                        cwd: 'source/',
                        src: '**/*.html',
                        dest: 'public/'
                    }
                ]

            }
        },



        //PRODUCTION
        //Uglify
        uglify:{
            compress:{
                files:[
                    { src: 'public/js/bundle.js',  dest: 'public/js/bundle.min.js' },
                    { src: 'public/js/app.js',  dest: 'public/js/app.min.js' },
                    { src: 'server.js',  dest: 'server.min.js' }
                ]
            }
        },




        //WATCHERS
        watch:{
            typescript:{
                files: 'source/**/*.ts',
                tasks: 'ts'
            },

            sass:{
                files: 'source/**/*.scss',
                tasks: 'sass'
            },

            htmlmin:{
                files: 'source/**/*.html',
                tasks: 'htmlmin'
            },
        },

        nodemon:{
            dev:{
                script: 'server.js'
            }
        },

        concurrent:{
            options:{
                logConcurrentOutput: true
            },
            tasks: ['nodemon', 'watch']
        }
    });







    //Production task
    //grunt.registerTask('production', 'uglify');
    grunt.registerTask('build', ['ts', 'sass', 'htmlmin']);

    //Default Task
    grunt.registerTask('default', ['build', 'concurrent']);

};