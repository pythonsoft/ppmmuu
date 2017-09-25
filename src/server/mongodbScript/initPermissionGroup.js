/**
 * Created by steven on 17/9/25.
 */

'use strict';

const PermissionGroup = require('../api/role/permissionGroup');
const permissionGroup = new PermissionGroup();

const infos = [
  {
    _id: 'management',
    name: '管理',
    index: 'management',
    parentIndex: ''
  },
  {
    _id: 'accountManagement',
    name: '账户管理',
    index: 'accountManagement',
    parentIndex: 'management'
  },
  {
    _id: 'account',
    name: '账户',
    index: 'account',
    parentIndex: 'accountManagement'
  },
  {
    _id: 'role',
    name: '角色',
    index: 'role',
    parentIndex: 'accountManagement'
  },
  {
    _id: 'permission',
    name: '权限',
    index: 'permission',
    parentIndex: 'accountManagement'
  },
  {
    _id: 'engine',
    name: '引擎管理',
    index: 'engine',
    parentIndex: 'management'
  },
  {
    _id: 'storageManagement',
    name: '存储管理',
    index: 'storageManagement',
    parentIndex: 'management'
  },
  {
    _id: 'bucket',
    name: '存储区',
    index: 'bucket',
    parentIndex: 'storageManagement'
  },
  {
    _id: 'storagePath',
    name: '路径',
    index: 'storagePath',
    parentIndex: 'storageManagement'
  },
  {
    _id: 'storageTactics',
    name: '策略',
    index: 'storageTactics',
    parentIndex: 'storageManagement'
  },
  {
    _id: 'bucket',
    name: '存储区',
    index: 'bucket',
    parentIndex: 'storageManagement'
  },
  {
    _id: 'storagePath',
    name: '路径',
    index: 'storagePath',
    parentIndex: 'storageManagement'
  },
  {
    _id: 'storageTactics',
    name: '策略',
    index: 'storageTactics',
    parentIndex: 'storageManagement'
  },
  {
    _id: 'taskManagement',
    name: '任务管理',
    index: 'taskManagement',
    parentIndex: 'management'
  },
  {
    _id: 'transcode',
    name: '转码任务',
    index: 'transcode',
    parentIndex: 'taskManagement'
  },
  {
    _id: 'download',
    name: '下载任务',
    index: 'download',
    parentIndex: 'taskManagement'
  },
  {
    _id: 'templateManagement',
    name: '模板管理',
    index: 'templateManagement',
    parentIndex: 'management'
  },
  {
    _id: 'downloadTemplate',
    name: '下载模板',
    index: 'downloadTemplate',
    parentIndex: 'templateManagement'
  },
  {
    _id: 'transcodeTemplate',
    name: '转码模板',
    index: 'transcodeTemplate',
    parentIndex: 'templateManagement'
  },
  {
    _id: 'configuration',
    name: '设置',
    index: 'configuration',
    parentIndex: 'management'
  },
  {
    _id: 'help',
    name: '帮助',
    index: 'help',
    parentIndex: 'management'
  },
  {
    _id: 'managementAbout',
    name: '关于',
    index: 'managementAbout',
    parentIndex: 'help'
  },
  {
    _id: 'managementFeedback',
    name: '反馈',
    index: 'managementFeedback',
    parentIndex: 'help'
  }
];

permissionGroup.collection.removeMany({}, function(err){
  if(err){
    throw new Error(`权限分组表初始化有问题:${err.message}`);
  }
  
  permissionGroup.collection.insert(infos, function(err){
    if(err){
      throw new Error(`权限分组表初始化有问题:${err.message}`);
    }
    return true;
  })
})