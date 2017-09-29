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
  },
  {
    _id: 'library',
    name: '编目',
    index: 'library',
    parentIndex: '',
  },
  {
    _id: 'accountManagement',
    name: '账户管理',
    index: 'accountManagement',
    parentIndex: 'management',
  },
  {
    _id: 'account',
    name: '账户',
    index: 'account',
    parentIndex: 'accountManagement',
  },
  {
    _id: 'role',
    name: '角色',
    index: 'role',
    parentIndex: 'accountManagement',
  },
  {
    _id: 'permission',
    name: '权限',
    index: 'permission',
    parentIndex: 'accountManagement',
  },
  {
    _id: 'engine',
    name: '引擎管理',
    index: 'engine',
    parentIndex: 'management',
  },
  {
    _id: 'storageManagement',
    name: '存储管理',
    index: 'storageManagement',
    parentIndex: 'management',
  },
  {
    _id: 'bucket',
    name: '存储区',
    index: 'bucket',
    parentIndex: 'storageManagement',
  },
  {
    _id: 'storagePath',
    name: '路径',
    index: 'storagePath',
    parentIndex: 'storageManagement',
  },
  {
    _id: 'storageTactics',
    name: '策略',
    index: 'storageTactics',
    parentIndex: 'storageManagement',
  },
  {
    _id: 'taskManagement',
    name: '任务管理',
    index: 'taskManagement',
    parentIndex: 'management',
  },
  {
    _id: 'transcode',
    name: '转码任务',
    index: 'transcode',
    parentIndex: 'taskManagement',
  },
  {
    _id: 'download',
    name: '下载任务',
    index: 'download',
    parentIndex: 'taskManagement',
  },
  {
    _id: 'templateManagement',
    name: '模板管理',
    index: 'templateManagement',
    parentIndex: 'management',
  },
  {
    _id: 'downloadTemplate',
    name: '下载模板',
    index: 'downloadTemplate',
    parentIndex: 'templateManagement',
  },
  {
    _id: 'transcodeTemplate',
    name: '转码模板',
    index: 'transcodeTemplate',
    parentIndex: 'templateManagement',
  },
  {
    _id: 'configuration',
    name: '设置',
    index: 'configuration',
    parentIndex: 'management',
  },
  {
    _id: 'help',
    name: '帮助',
    index: 'help',
    parentIndex: 'management',
  },
  {
    _id: 'managementAbout',
    name: '关于',
    index: 'managementAbout',
    parentIndex: 'help',
  },
  {
    _id: 'managementFeedback',
    name: '反馈',
    index: 'managementFeedback',
    parentIndex: 'help',
  },
  {
    _id: 'shelf',
    name: '上架',
    index: 'shelf',
    parentIndex: '',
  },
  {
    _id: 'departmentShelf',
    name: '部门任务',
    index: 'departmentShelf',
    parentIndex: 'shelf',
  },
  {
    _id: 'prepareDepartmentShelf',
    name: '待认领',
    index: 'prepareDepartmentShelf',
    parentIndex: 'departmentShelf',
  },
  {
    _id: 'allDepartmentShelf',
    name: '全部',
    index: 'allDepartmentShelf',
    parentIndex: 'departmentShelf',
  },
  {
    _id: 'myShelf',
    name: '我的任务',
    index: 'myShelf',
    parentIndex: 'shelf',
  },
  {
    _id: 'doingMyShelf',
    name: '处理中',
    index: 'doingMyShelf',
    parentIndex: 'myShelf',
  },
  {
    _id: 'submittedMyShelf',
    name: '已提交',
    index: 'submittedMyShelf',
    parentIndex: 'myShelf',
  },
  {
    _id: 'deletedMyShelf',
    name: '已删除',
    index: 'deletedMyShelf',
    parentIndex: 'myShelf',
  },
  {
    _id: 'allMyShelf',
    name: '全部',
    index: 'allMyShelf',
    parentIndex: 'myShelf',
  },
  {
    _id: 'lineShelf',
    name: '上架管理',
    index: 'lineShelf',
    parentIndex: 'shelf',
  },
  {
    _id: 'prepareLineShelf',
    name: '待上架',
    index: 'prepareLineShelf',
    parentIndex: 'lineShelf',
  },
  {
    _id: 'onlineShelf',
    name: '已上架',
    index: 'onlineShelf',
    parentIndex: 'lineShelf',
  },
  {
    _id: 'offlineShelf',
    name: '下架',
    index: 'offlineShelf',
    parentIndex: 'lineShelf',
  },
  {
    _id: 'departmentTask',
    name: '部门任务',
    index: 'departmentTask',
    parentIndex: 'library',
  },
  {
    _id: 'department_catalog_task_unassigned',
    name: '待认领',
    index: 'department_catalog_task_unassigned',
    parentIndex: 'departmentTask',
  },
  {
    _id: 'department_catalog_task_all',
    name: '全部',
    index: 'department_catalog_task_all',
    parentIndex: 'departmentTask',
  },
  {
    _id: 'personalTask',
    name: '我的任务',
    index: 'personalTask',
    parentIndex: 'library',
  },
  {
    _id: 'personal_catalog_task_doing',
    name: '编目中',
    index: 'personal_catalog_task_doing',
    parentIndex: 'personalTask',
  },
  {
    _id: 'personal_catalog_task_submitted',
    name: '已提交',
    index: 'personal_catalog_task_submitted',
    parentIndex: 'personalTask',
  },
  {
    _id: 'personal_catalog_task_deleted',
    name: '已删除',
    index: 'personal_catalog_task_deleted',
    parentIndex: 'personalTask',
  },
  {
    _id: 'personal_catalog_task_all',
    name: '全部',
    index: 'personal_catalog_task_all',
    parentIndex: 'personalTask',
  }
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
