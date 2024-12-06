module.exports = function(config) {
  config.set({
  basePath: '',
  frameworks: ['jasmine', '@angular-devkit/build-angular'],
  plugins: [
    require('karma-jasmine'),
    require('karma-chrome-launcher'),
    require('karma-coverage'),
    require('@angular-devkit/build-angular/plugins/karma')
  ],
  client: {
    clearContext: false
  },
  files: [
    { pattern: './src/**/*.spec.ts', watched: false }
  ],
  preprocessors: {
    './src/**/*.spec.ts': ['coverage']
  },
  reporters: ['progress', 'coverage'],
  port: 9876,
  colors: true,
  logLevel: config.LOG_INFO,
  autoWatch: true,
  browsers: ['Chrome'],
  restartOnFileChange: true
  });
}; restartOnFileChange: true