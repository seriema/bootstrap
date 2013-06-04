module.exports = function(grunt) {
    var jsFiles = [
        'js/bootstrap-transition.js',
        'js/bootstrap-alert.js',
        'js/bootstrap-button.js',
        'js/bootstrap-carousel.js',
        'js/bootstrap-collapse.js',
        'js/bootstrap-dropdown.js',
        'js/bootstrap-modal.js',
        'js/bootstrap-tooltip.js',
        'js/bootstrap-popover.js',
        'js/bootstrap-scrollspy.js',
        'js/bootstrap-tab.js',
        'js/bootstrap-typeahead.js',
        'js/bootstrap-affix.js'
    ];

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/**\n' + '* <%= pkg.name %>.js v<%= pkg.version %> by @fat and @mdo\n' + '* Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' + '* <%= _.pluck(pkg.licenses, "url").join(", ") %>\n' + '*/\n',
        // Task configuration.
        clean: {
            gh: ['<%= pkg.name %>.zip'],
            dist: ['<%= pkg.name %>', '_gh_pages', '<%= pkg.name %>.zip', 'docs/assets/<%= pkg.name %>.zip']
        },
        compress: {
            gh: {
                options: {
                    archive: '<%= pkg.name %>.zip'
                },
                expand: true,
                src: ['<%= pkg.name %>/**/*'],
                dest: '.'
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: false
            },
            bootstrap: {
                src: jsFiles,
                dest: 'bootstrap/js/<%= pkg.name %>.js'
            },
            dist: {
                src: jsFiles,
                dest: 'docs/assets/js/<%= pkg.name %>.js'
            }
        },
        copy: {
            bootstrap: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['fonts/*'],
                    dest: 'bootstrap/fonts/'
                }]
            },
            gh: {
                files: [{
                    expand: true,
                    src: ['docs/**/*'],
                    dest: '_gh_pages/'
                }]
            },
            zip: {
                files: [{
                    src: ['bootstrap.zip'],
                    dest: 'docs/assets/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['fonts/*'],
                    dest: 'docs/assets/fonts/'
                }, {
                    expand: true,
                    flatten: true,
                    src: ['js/*.js'],
                    dest: 'docs/assets/js/'
                }, {
                    expand: true,
                    flatten: true,
                    src: ['js/tests/vendor/jquery.js'],
                    dest: 'docs/assets/js/'
                }]
            }
        },
        jshint: {
            options: {
                jshintrc: 'js/.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['js/*.js']
            },
            test: {
                src: ['js/tests/unit/*.js']
            }
        },
        shell: {
            /*gh: {
                command: 'node docs/build production'
            },*/
            jekyll_win: {
                command: 'chcp 65001'
            },
            jekyll_build: {
                command: 'jekyll build'
            },
            jekyll_server: {
                command: 'jekyll server',
                options: {
                    stdout: true
                }
            },
            test: {
                command: 'phantomjs js/tests/phantom.js "http://localhost:3000/js/tests"'
            }
        },
        recess: {
            options: {
                compile: true
            },
            bootstrap: {
                files: {
                    'bootstrap/css/bootstrap.css': ['less/bootstrap.less']
                }
            },
            min: {
                options: {
                    compress: true
                },
                files: {
                    'bootstrap/css/bootstrap.min.css': ['less/bootstrap.less']
                }
            },
            dist: {
                files: {
                    'docs/assets/css/bootstrap.css': ['less/bootstrap.less']
                }
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            bootstrap: {
                files: {
                    'bootstrap/js/<%= pkg.name %>.min.js': ['<%= concat.bootstrap.dest %>']
                }
            },
            dist: {
                files: {
                    'docs/assets/js/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 3000,
                    base: '.'
                }
            }
        },
        watch: {
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'qunit']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'qunit']
            },
            jekyll: {
                files: ['_gh_pages/*.html'],
                tasks: ['jekyll:dev']
            }
        }
    });


    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-recess');


    // Default task.
    grunt.registerTask('default', ['jshint', 'recess:dist', 'copy:dist', 'concat:dist', 'uglify:dist']);
    //grunt.registerTask('build', ['default']);

    // Test task.
    grunt.registerTask('test', ['jshint', 'connect', 'shell:test']);

    // Clean task.
    grunt.registerTask('cleanup', ['clean:dist']);

    // JS COMPILE
    grunt.registerTask('bootstrap-js', ['concat:bootstrap', 'uglify:bootstrap']);

    // CSS COMPILE
    grunt.registerTask('bootstrap-css', ['recess:bootstrap', 'recess:min']);

    // FONTS
    grunt.registerTask('bootstrap-fonts', ['copy:bootstrap']);

    // BUILD SIMPLE BOOTSTRAP DIRECTORY
    grunt.registerTask('bootstrap', ['bootstrap-fonts', 'bootstrap-css', 'bootstrap-js']);

    // Task for gh-pages 4 fat & mdo ONLY (O_O )
    grunt.registerTask('jekyll', [process.platform==="win32"?'shell:jekyll_win':'', 'shell:jekyll_build', 'shell:jekyll_server']);
    grunt.registerTask('run', ['bootstrap', 'compress:docs', 'copy:zip', 'clean:gh', 'jekyll']);
};