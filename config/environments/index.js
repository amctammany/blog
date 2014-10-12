'use strict';
module.exports = function (app, passport) {
  require('./production')(app, passport);
  require('./development')(app, passport);
};
