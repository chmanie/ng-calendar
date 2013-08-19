/* jshint node: true, strict: false */

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    connect: {
      server: {
        options: {
          port: 9001,
          base: './',
          keepalive: true
        }
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-karma');

  // Default task.
  grunt.registerTask('default', []);

};
