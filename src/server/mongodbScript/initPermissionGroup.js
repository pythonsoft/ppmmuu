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
    parentIndex: '',
    topParentMenu: '管理',
  },
  {
    _id: 'library',
    name: '编目',
    index: 'library',
    parentIndex: '',
    topParentMenu: '入库',
  },
  {
    _id: 'mediaCenter',
    name: '媒体库',
    index: 'mediaCenter',
    parentIndex: '',
    topParentMenu: '媒体库',
  },
  {
    _id: 'accountManagement',
    name: '账户管理',
    index: 'accountManagement',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'account',
    name: '账户',
    index: 'account',
    parentIndex: 'accountManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'role',
    name: '角色',
    index: 'role',
    parentIndex: 'accountManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'permissionGroup',
    name: '权限组',
    index: 'permissionGroup',
    parentIndex: 'accountManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'permission',
    name: '权限',
    index: 'permission',
    parentIndex: 'accountManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'engine',
    name: '引擎管理',
    index: 'engine',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'storageManagement',
    name: '存储管理',
    index: 'storageManagement',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'bucket',
    name: '存储区',
    index: 'bucket',
    parentIndex: 'storageManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'storagePath',
    name: '路径',
    index: 'storagePath',
    parentIndex: 'storageManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'storageTactics',
    name: '策略',
    index: 'storageTactics',
    parentIndex: 'storageManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'libraryManager',
    name: '入库管理',
    index: 'libraryManager',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'libraryTemplate',
    name: '入库模板',
    index: 'libraryTemplate',
    parentIndex: 'libraryManager',
    topParentMenu: '管理',
  },
  {
    _id: 'taskManagement',
    name: '任务管理',
    index: 'taskManagement',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'transcode',
    name: '转码任务',
    index: 'transcode',
    parentIndex: 'taskManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'download',
    name: '下载任务',
    index: 'download',
    parentIndex: 'taskManagement',
    topParentMenu: '媒体库',
  },
  {
    _id: 'libraryTask',
    name: '入库任务',
    index: 'libraryTask',
    parentIndex: 'taskManagement',
    topParentMenu: '媒体库',
  },
  {
    _id: 'auditManager',
    name: '审核管理',
    index: 'auditManager',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'auditDownload',
    name: '下载审核',
    index: 'auditDownload',
    parentIndex: 'auditManager',
    topParentMenu: '管理',
  },
  {
    _id: 'auditEmpower',
    name: '审核授权',
    index: 'auditEmpower',
    parentIndex: 'auditManager',
    topParentMenu: '管理',
  },
  {
    _id: 'templateManagement',
    name: '模板管理',
    index: 'templateManagement',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'downloadTemplate',
    name: '下载模板',
    index: 'downloadTemplate',
    parentIndex: 'templateManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'transcodeTemplate',
    name: '转码模板',
    index: 'transcodeTemplate',
    parentIndex: 'templateManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'subscribeManagement',
    name: '订阅管理',
    index: 'subscribeManagement',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'subscribeInfo',
    name: '订阅信息',
    index: 'subscribeInfo',
    parentIndex: 'subscribeManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'subscribeType',
    name: '类型管理',
    index: 'subscribeType',
    parentIndex: 'subscribeManagement',
    topParentMenu: '管理',
  },
  {
    _id: 'configuration',
    name: '设置',
    index: 'configuration',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'help',
    name: '帮助',
    index: 'help',
    parentIndex: 'management',
    topParentMenu: '管理',
  },
  {
    _id: 'managementAbout',
    name: '关于',
    index: 'managementAbout',
    parentIndex: 'help',
    topParentMenu: '管理',
  },
  {
    _id: 'managementFeedback',
    name: '反馈',
    index: 'managementFeedback',
    parentIndex: 'help',
    topParentMenu: '管理',
  },
  {
    _id: 'shelf',
    name: '上架',
    index: 'shelf',
    parentIndex: '',
    topParentMenu: '上架',
  },
  {
    _id: 'departmentShelf',
    name: '部门任务',
    index: 'departmentShelf',
    parentIndex: 'shelf',
    topParentMenu: '上架',
  },
  {
    _id: 'prepareDepartmentShelf',
    name: '待认领',
    index: 'prepareDepartmentShelf',
    parentIndex: 'departmentShelf',
    topParentMenu: '上架',
  },
  {
    _id: 'allDepartmentShelf',
    name: '全部',
    index: 'allDepartmentShelf',
    parentIndex: 'departmentShelf',
    topParentMenu: '上架',
  },
  {
    _id: 'myShelf',
    name: '我的任务',
    index: 'myShelf',
    parentIndex: 'shelf',
    topParentMenu: '上架',
  },
  {
    _id: 'doingMyShelf',
    name: '处理中',
    index: 'doingMyShelf',
    parentIndex: 'myShelf',
    topParentMenu: '上架',
  },
  {
    _id: 'submittedMyShelf',
    name: '已提交',
    index: 'submittedMyShelf',
    parentIndex: 'myShelf',
    topParentMenu: '上架',
  },
  {
    _id: 'deletedMyShelf',
    name: '已删除',
    index: 'deletedMyShelf',
    parentIndex: 'myShelf',
    topParentMenu: '上架',
  },
  {
    _id: 'allMyShelf',
    name: '全部',
    index: 'allMyShelf',
    parentIndex: 'myShelf',
    topParentMenu: '上架',
  },
  {
    _id: 'lineShelf',
    name: '上架管理',
    index: 'lineShelf',
    parentIndex: 'shelf',
    topParentMenu: '上架',
  },
  {
    _id: 'prepareLineShelf',
    name: '待上架',
    index: 'prepareLineShelf',
    parentIndex: 'lineShelf',
    topParentMenu: '上架',
  },
  {
    _id: 'onlineShelf',
    name: '已上架',
    index: 'onlineShelf',
    parentIndex: 'lineShelf',
    topParentMenu: '上架',
  },
  {
    _id: 'offlineShelf',
    name: '下架',
    index: 'offlineShelf',
    parentIndex: 'lineShelf',
    topParentMenu: '上架',
  },
  {
    _id: 'departmentTask',
    name: '部门任务',
    index: 'departmentTask',
    parentIndex: 'library',
    topParentMenu: '任务',
  },
  {
    _id: 'department_catalog_task_unassigned',
    name: '待认领',
    index: 'department_catalog_task_unassigned',
    parentIndex: 'departmentTask',
    topParentMenu: '任务',
  },
  {
    _id: 'department_catalog_task_all',
    name: '全部',
    index: 'department_catalog_task_all',
    parentIndex: 'departmentTask',
    topParentMenu: '任务',
  },
  {
    _id: 'personalTask',
    name: '我的任务',
    index: 'personalTask',
    parentIndex: 'library',
    topParentMenu: '任务',
  },
  {
    _id: 'personal_catalog_task_doing',
    name: '编目中',
    index: 'personal_catalog_task_doing',
    parentIndex: 'personalTask',
    topParentMenu: '任务',
  },
  {
    _id: 'personal_catalog_task_submitted',
    name: '已提交',
    index: 'personal_catalog_task_submitted',
    parentIndex: 'personalTask',
    topParentMenu: '任务',
  },
  {
    _id: 'personal_catalog_task_deleted',
    name: '已删除',
    index: 'personal_catalog_task_deleted',
    parentIndex: 'personalTask',
    topParentMenu: '任务',
  },
  {
    _id: 'personal_catalog_task_all',
    name: '全部',
    index: 'personal_catalog_task_all',
    parentIndex: 'personalTask',
    topParentMenu: '任务',
  },
  {
    _id: 'auditTask',
    name: '审核任务',
    index: 'auditTask',
    parentIndex: 'taskCenter',
    topParentMenu: '任务',
  },
  {
    _id: 'trends',
    name: '首页',
    index: 'trends',
    parentIndex: '',
    topParentMenu: '舆情',
  },
  {
    _id: 'copy',
    name: '文稿',
    index: 'copy',
    parentIndex: '',
    topParentMenu: '文稿',
  },
  {
    _id: 'movieEditor',
    name: '视频编辑',
    index: 'movieEditor',
    parentIndex: '',
    topParentMenu: '媒体库',
  },
];


permissionGroup.collection.removeMany({}, (err) => {
  if (err) {
    throw new Error(`权限分组表初始化有问题:${err.message}`);
  }

  permissionGroup.collection.insert(infos, (err) => {
    if (err) {
      throw new Error(`权限分组表初始化有问题:${err.message}`);
    }
    return true;
  });
});
