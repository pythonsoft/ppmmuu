/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');
const uuid = require('uuid');
const qrcode = require('qrcode');

const QRCodeInfo = require('./qrcodeInfo');

const qrcodeInfo = new QRCodeInfo();

const userService = require('../user/service');

const service = {};

service.getDetail = (query, cb) => {
  qrcodeInfo.collection.findOne(query, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('qrcodeInfoIsNotExist'));
    }

    return cb && cb(null, doc);
  });
};

service.createQRCode = (url, cb) => {
  const createdTime = new Date();
  const expiredTime = new Date();
  expiredTime.setMinutes(expiredTime.getMinutes() + 1);

  const info = {
    _id: uuid.v1(),
    isConfirm: QRCodeInfo.IS_CONFIRM.NO,
    expiredTime,
    ticket: '',
    createdTime,
    scanTime: null,
    code: '',
    description: '',
    detail: {},
  };

  const dataURL = `${url}?id=${info._id}`;

  qrcode.toDataURL(dataURL, (err, base64Data) => {
    if (err) {
      logger.error(err);
      return cb && cb(i18n.t('qrcodeCreateError'));
    }

    info.code = base64Data;

    qrcodeInfo.insertOne(info, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, info);
    });
  });
};

service.updateQRCode = (id, info = {}, cb) => {
  if (!id) {
    return cb && cb(i18n.t('qrcodeParamIsNull', { field: 'id' }));
  }

  qrcodeInfo.updateOne({ _id: id }, info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r.value);
  });
};

/**
 * 前端查询使用接口
 * @param res
 * @param id
 * @param cb
 * @returns {*}
 */
service.query = (res, id, cb) => {
  if (!id) {
    return cb && cb(i18n.t('qrcodeParamIsNull', { field: 'id' }));
  }

  service.getDetail({ _id: id }, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    const nowDate = new Date();

    if (doc.expiredTime < nowDate) {
      return cb && cb(i18n.t('qrcodeExpired'));
    }

    if (doc.isConfirm === QRCodeInfo.IS_CONFIRM.YES) {
      return cb && cb(i18n.t('qrcodeConfirm'));
    }

    if (!doc.ticket) {
      return cb && cb(null, 'waitingScan');
    }

    service.updateQRCode(id, {
      isConfirm: QRCodeInfo.IS_CONFIRM.YES,
    }, (err, r) => {
      if (err) {
        return cb && cb(err);
      }

      userService.loginByTicket(res, doc.ticket, (err, _userInfo) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, _userInfo);
      });
    });
  });
};

// 客户端扫码调用此接口
service.scan = (id, ticket, cb) => {
  if (!id) {
    return cb && cb(i18n.t('qrcodeParamIsNull', { field: 'id' }));
  }

  if (!ticket) {
    return cb && cb(i18n.t('qrcodeParamIsNull', { field: 'ticket' }));
  }

  const ticketResult = userService.decodeTicket(ticket);

  if (ticketResult.err) {
    return cb && cb(ticketResult.err);
  }

  service.getDetail({ _id: id }, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    const nowDate = new Date();

    if (doc.expiredTime < nowDate) {
      return cb && cb(i18n.t('qrcodeExpired'));
    }

    if (doc.isConfirm === QRCodeInfo.IS_CONFIRM.YES) {
      return cb && cb(i18n.t('qrcodeConfirm'));
    }

    qrcodeInfo.collection.updateOne({ _id: id }, {
      scanTime: new Date(),
      ticket,
    }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

module.exports = service;
