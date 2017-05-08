module.exports = function(app){
  app.use('/api/log', require('./api/log'));
  app.use('/api/user', require('./api/user'));
}