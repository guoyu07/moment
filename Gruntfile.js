module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env : {
            sauceLabs : (grunt.file.exists('.sauce-labs.creds') ?
                    grunt.file.readJSON('.sauce-labs.creds') : {})
        },
        karma : {
            options: {
                frameworks: ['qunit'],
                files: [
                    'build/umd/min/moment-with-locales.js',
                    'build/umd/min/tests.js'
                ],
                sauceLabs: {
                    startConnect: true,
                    testName: 'MomentJS'
                },
                customLaunchers: {
                    slChromeWinXp: {
                        base: 'SauceLabs',
                        browserName: 'chrome',
                        platform: 'Windows XP'
                    },
                    slIe9Win7: {
                        base: 'SauceLabs',
                        browserName: 'internet explorer',
                        platform: 'Windows 7',
                        version: '9'
                    },
                    slIe8Win7: {
                        base: 'SauceLabs',
                        browserName: 'internet explorer',
                        platform: 'Windows 7',
                        version: '8'
                    },
                    slFfLinux: {
                        base: 'SauceLabs',
                        browserName: 'firefox',
                        platform: 'Linux'
                    },
                    slSafariOsx: {
                        base: 'SauceLabs',
                        browserName: 'safari',
                        platform: 'OS X 10.8'
                    }
                }
            },
            server: {
                browsers: []
            },
            chrome: {
                singleRun: true,
                browsers: ['Chrome']
            },
            firefox: {
                singleRun: true,
                browsers: ['Firefox']
            },
            sauce: {
                options: {reporters: ['dots']},
                singleRun: true,
                browsers: [
                    'slChromeWinXp',
                    'slIe9Win7',
                    'slIe8Win7',
                    'slFfLinux',
                    'slSafariOsx'
                ]
            }
        },
        uglify : {
            main: {
                files: {
                    'min/moment-with-locales.min.js'     : 'min/moment-with-locales.js',
                    'min/locales.min.js'                 : 'min/locales.js',
                    'min/moment.min.js'                  : 'moment.js'
                }
            },
            options: {
                mangle: true,
                compress: {
                    dead_code: false // jshint ignore:line
                },
                output: {
                    ascii_only: true // jshint ignore:line
                },
                report: 'min',
                preserveComments: 'some'
            }
        },
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/**.js',
                'src/**/*.js'
            ],
            options: {
                jshintrc: true
            }
        },
        jscs: {
            all: [
                'Gruntfile.js',
                'tasks/**.js',
                'src/**/*.js'
            ],
            options: {
                config: '.jscs.json'
            }
        },
        watch : {
            test : {
                files : [
                    'src/**/*.js',
                ],
                tasks: ['test']
            },
            jshint : {
                files : '<%= jshint.all %>',
                tasks: ['jshint']
            }
        },
        benchmark: {
            all: {
                src: ['benchmarks/*.js']
            }
        },
        exec: {
            'meteor-init': {
                command: [
                    // Make sure Meteor is installed, per https://meteor.com/install.
                    // The curl'ed script is safe; takes 2 minutes to read source & check.
                    'type meteor >/dev/null 2>&1 || { curl https://install.meteor.com/ | sh; }',
                    // Meteor expects package.js to be in the root directory of
                    // the checkout, but we already have a package.js for Dojo
                    'mv package.js package.dojo && cp meteor/package.js .'
                ].join(';')
            },
            'meteor-cleanup': {
                // remove build files and restore Dojo's package.js
                command: 'rm -rf ".build.*" versions.json; mv package.dojo package.js'
            },
            'meteor-test': {
                command: 'spacejam --mongo-url mongodb:// test-packages ./'
            },
            'meteor-publish': {
                command: 'meteor publish'
            }
        }

    });

    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt);

    // Default task.
    grunt.registerTask('default', ['lint', 'test:node']);

    // linting
    grunt.registerTask('lint', ['jshint', 'jscs']);

    // test tasks
    grunt.registerTask('test', ['test:node']);
    grunt.registerTask('test:node', ['transpile', 'qtest']);
    grunt.registerTask('test:server', ['transpile', 'karma:server']);
    grunt.registerTask('test:browser', ['transpile', 'karma:chrome', 'karma:firefox']);
    grunt.registerTask('test:sauce-browser', ['transpile', 'env:sauceLabs', 'karma:sauce']);
    grunt.registerTask('test:travis-sauce-browser', ['transpile', 'karma:sauce']);
    grunt.registerTask('test:meteor', ['exec:meteor-init', 'exec:meteor-test', 'exec:meteor-cleanup']);

    // travis build task
    grunt.registerTask('build:travis', ['default']);
    grunt.registerTask('meteor-publish', ['exec:meteor-init', 'exec:meteor-publish', 'exec:meteor-cleanup']);

    // Task to be run when releasing a new version
    grunt.registerTask('release', [
        'default',
        'update-index',
        'component',
        'uglify:main'
    ]);
};
