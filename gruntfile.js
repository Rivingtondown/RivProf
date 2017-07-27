module.exports = function(grunt) {
require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: {
        files: ['src/rivington.js'],
        tasks: ['jshint','babel'],
        options: {
          spawn: false,
        },
      },
    },
    babel: {
        options: {
            "sourceMap": false,
            "presets": ['es2015']
        },
        dist: {
          files: [{
            src : 'src/rivington.js',
            dest : '../Copy-Hero/js/plugins/Rivington.js'
          }]
        }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: false,
        eqnull: true,
        browser: false,
        asi: true,
        sub: true,
        globalstrict: true,
        esversion: 6,
        globals: {
          '_': true,
          DataManager: true,
          PluginManager: true,
          Game_Interpreter: true,
          Game_System: true,
          $gameMap: true,
          AudioManager: true,
          $gameParty: true,
          console: true,
          $gameActors: true,
          $gameSelfSwitches: true,
          $gameSystem: true,
          $dataSkills: true,
          $dataClasses: true,
          $dataItems: true,
          $dataMap: true,
          $gameMessage: true
        },
      },
      with_overrides: {
        options: {
          curly: false,
          undef: true,
        },
        files: {
          src: ['src/rivington.js']
        },
      }
    },
    uglify: {
        all_src : {
            options : {
              sourceMap : false,
              compress : false,
              mangle: false
              //sourceMapName : 'src/build/sourceMap.map'
            },
            src : ['lib/lodash.build.min.js','src/rivington-compiled.js'],
            dest : '../Copy-Hero/js/plugins/Rivington.js'
        }
    },
    'lodash': {
      'build': {
        // output location
        'dest': 'library/lodash.build.js',
        'options': {
          // modifiers for prepared builds
          // modern, strict, compat
          'modifier': 'strict',
          'category': ['collection', 'array'],
          'minus': ['Date', 'Function','Lang','Math','Number','Object','Seq','String','Util']
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lodash');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['babel','jshint'],'lodash');

};
