module.exports = function(app){
  app.use('/api/log', require('./api/log/index'));
  app.use('/api/user', require('./api/user/index'));
}