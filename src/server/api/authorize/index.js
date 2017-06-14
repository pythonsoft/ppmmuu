const express = require('express');
const LogInfo = require('../log/loginfo');
const SystemPermission = require('./systempermission');
const OperationPrivileges = require('./operationPrivileges');

const lang = require('../../../i18n/cn');
const systemPermissionMessage = lang.systemPermission;


const Result = require('../../common/result');
const config = require('../../config');



const router = express.Router();

router.use(passport.roleMiddleware());

router.use(passport.sysPermissionMiddleware('ACCOUNT_OPERATION'));

/**
 * 获取系统用户权限情况列表
 */
router.get('/list', function(req, res) {
    let keyWords = req.query.keyWords || '';
    let page = req.query.page || 1;
    let pageSize = req.query.pageSize || 15;
    let fields = req.query.fields || '';

    var selectFields = '';
    if(fields){
        selectFields = fields.split(',').join(' ');
    }

    var options = {
        select: selectFields,
        limit: pageSize * 1,
        page: page * 1,
    };

    SystemPermission.list(keyWords, options, function(err, result){
        if(err) {
            res.json(Result.FAIL(err));
            return;
        }
        res.json(Result.SUCCESS(result));
    });
});

/**
 * 获取角色列表
 */
router.get('/listRoles',function(req, res) {
    return res.json(Result.SUCCESS(OperationPrivileges.listRoles('')));
});



/**
 * 获取单个系统用户详情
 */
router.get('/get',function(req, res) {
    let _id = req.query._id || '';

    SystemPermission.get(_id, '', function(err, doc){
        if(err) {
            res.json(Result.FAIL(err));
            return;
        }
        if(doc) {
            res.json(Result.SUCCESS(doc));
            return;
        }
        else{
            return res.json(Result.FAIL(systemPermissionMessage.canNotFindSystemPermission));
        }
    });
});

/**
 * 获取用户权限清单
 */
router.get('/getPrivileges',function(req, res) {
    let _id = req.query._id || '';
    let output = req.query.output || 'string';

    SystemPermission.getPrivileges(_id, output, function(err, result){
        if(err) {
            res.json(Result.FAIL(err));
            return;
        }
        res.json(Result.SUCCESS(result));
    });
});



/**
 * 设置用户角色
 */
router.post('/setRoles',function(req, res) {
    let _id = req.body._id || '';
    let userId = req.body.userId || '';
    let roles = req.body.roles || '';
    let id = '';
    let type = '';
    if(!_id && !userId){
        return res.json(Result.FAIL(systemPermissionMessage.noParameter));
    }else if(_id){
        id = _id;
        type = 'update';
    }else{
        id = userId;
        type = 'create';
    }

    if(id == req.user){
        return res.json(Result.FAIL(systemPermissionMessage.canNotChangeSelf));
    }

    roles = roles.split(',');
    let creator={
        id: req.user,
        name: req.vipName
    }

    SystemPermission.setRoles(type, id, roles, creator, function(err, r){
        if(err) {
            res.json(Result.FAIL(err));
            return;
        }
        let message = '设置用户(' + r.vipName + ')角色:' + roles.join(',');
        LogInfo.log(req.vipName, LogInfo.TYPE.USERMANAGE, message);
        res.json(Result.SUCCESS(r));
    });

});

/**
 * 删除用户权限记录
 */
router.post('/delete',function(req, res) {
    let _id = req.body._id || '';

    SystemPermission.delete(_id, function(err, r){
        if(err) {
            res.json(Result.FAIL(err));
            return;
        }
        let message = '删除用户('+ _id +')角色';
        LogInfo.log(req.vipName, LogInfo.TYPE.USERMANAGE, message);
        res.json(Result.SUCCESS('OK'));
    });
});

module.exports = router;
