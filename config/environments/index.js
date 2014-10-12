module.exports = function (app, passport) {
  require('./development')(app, passport);
  require('./production')(app, passport);
};
