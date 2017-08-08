module.exports = function(grunt) {
require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: false,
        eqnull: true,
        browser: true,
        devel: true,
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
          Game_Map: true,
          $gameMap: true,
          AudioManager: true,
          $gameParty: true,
          $gameActors: true,
          $gameSwitches : true,
          $gameSelfSwitches: true,
          $gameSystem: true,
          $dataSkills: true,
          $dataClasses: true,
          $dataActors: true,
          $dataItems: true,
          $dataMap: true,
          $gameMessage: true,
          $gameTemp: true,
          $dataMapInfos: true,
          $gameInterpreter: true,
          Scene_Map: true,
          $gameVariables: true,
          OrangeTimeSystem: true
        },
      },
      with_overrides: {
        options: {
          curly: false,
          undef: true,
        },
        files: {
          src: [
            'src/rivington-harvest.js',
            'src/rivington-spawn.js'
          ]
        },
      }
    },
    babel: {
        options: {
            "sourceMap": false,
            "presets": ['es2015']
        },
        dist: {
          files: [{
            src : 'src/rivington-harvest.js',
            dest : 'build/rivington-harvest.js'
          },
          {
            src : 'src/rivington-spawn.js',
            dest : 'build/rivington-spawn.js'
          }]
        }
    },
    watch: {
      scripts: {
        files: ['src/rivington-harvest.js','src/rivington-spawn.js'],
        tasks: ['jshint','babel','copy'],
        options: {
          spawn: false,
        },
      },
    },
    copy: {
        main: {
            files: [{
                src: 'build/rivington-harvest.js',
                dest: '../No-Hero/js/plugins/Rivington-Harvest.js'
            },
            {
                src: 'build/rivington-spawn.js',
                dest: '../No-Hero/js/plugins/Rivington-Spawn.js'
            }]
        }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-lodash');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['babel','jshint'],'lodash');

};
