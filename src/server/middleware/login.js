/**
 * Created by chaoningxie on 26/2/17.
 */
const utils = require('../common/utils');
const token = require('../common/token');
const config =  require('../config');
const UserInfo = require('../api/user/userInfo');
const userInfo = new UserInfo();

let Login = {};

Login.isLogin = function(req) {
  const query = utils.trim(req.query);
  const ticket = query['ticket'] || (req.cookies['ticket'] || req.header('token'));

  if(!ticket) {
    return false;
  }

  const decodeTicket = token.decipher(ticket, config.KEY);

  if(!decodeTicket) {
    return false;
  }

  return decodeTicket;
};

Login.middleware = function(req, res, next) {
  const decodeTicket = Login.isLogin(req);

  if(decodeTicket) {
    const now = new Date().getTime();
    if(decodeTicket[1] > now) { //token有效期内
      req.ex = { UserId: decodeTicket[0] };
      if(req.query) {
        req.query = utils.trim(req.query);
      }else {
        req.query = {};
      }

      if(req.body) {
        req.body = utils.trim(req.body);
      }else {
        req.body = {};
      }
      
      userInfo.collection.findOne({
        _id: req.ex.UserId
      }, { password: 0 }, function(err, doc) {
        if(err) {
          res.clearCookie('ticket');
          res.redirect('/error');
          return false;
        }

        if(doc.needReload) {
          res.clearCookie('ticket');
          res.redirect('/login');
        }else {
          req.ex.userInfo = doc;
          next();
        }

      });

    }else { //过期
      res.clearCookie('ticket');
      res.redirect('/login');
    }
  }else {
    res.redirect('/login');
  }

};

module.exports = Login;
