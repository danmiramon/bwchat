module.exports = function(grunt){

    //Load NPM Task Plugins
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-copy');



    //Initial config
    grunt.initConfig({

        //DEVELOPMENT
        //Typescript: JavaScript
        ts:{
            options:{
                fast: 'never',
                module: 'amd',
                target: 'es6',
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

        //COPY Images and Translation Files
        copy:{
            images:{
                expand:true,
                cwd:'source/',
                src:'**/*.png',
                dest:'public/'
            },
            translations:{
                expand:true,
                cwd:'source/',
                src:'**/*.json',
                dest:'public/'
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
            typescriptClient:{
                files: 'source/js/**/*.ts',
                tasks: 'ts:client'
            },

            typescriptServer:{
                files: 'source/server/**/*.ts',
                tasks: 'ts:server'
            },

            typescriptTest:{
                files: 'source/tests/**/*.ts',
                tasks: 'ts:test'
            },

            sass:{
                files: 'source/**/*.scss',
                tasks: 'sass'
            },

            htmlmin:{
                files: 'source/**/*.html',
                tasks: 'htmlmin'
            },

            copyImages:{
                files: 'source/**/*.png',
                task: 'copy:images'
            },

            copyTrans:{
                files: 'source/**/*.json',
                task: 'copy:translations'
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
    grunt.registerTask('build', ['ts', 'sass', 'htmlmin', 'copy']);

    //Default Task
    grunt.registerTask('default', ['build', 'concurrent']);

};