'use strict';

module.exports = {
  usernameOrPasswordIsWrong: {
    code: '-1001',
    message: 'username or password is wrong',
  },
  userInfoFindWrong: {
    code: '-1002',
    message: 'find userInfo system wrong',
  },
  userIdIsNull: {
    code: '-1003',
    message: 'parameter _id is null',
  },
  userNotFind: {
    code: '-1004',
    message: 'cannot find user',
  },
  getRoleNoId: {
    code: '-2005',
    message: 'get role parameter _id required',
  },
  deleteRoleNoIds: {
    code: '-2006',
    message: 'delete role parameter _id required',
  },
  assignRoleNoRoles: {
    code: '-2007',
    message: 'assign role parameter roles required',
  },
  assignRoleNoId: {
    code: '-2008',
    message: 'assign role parameter _id required',
  },
  roleInfoIsNotExist: {
    code: '-2009',
    message: 'role info is not exist',
  },
  assignPermissionNoUserIds: {
    code: '-2010',
    message: 'assign permissions parameter userIds required',
  },
  enablePermissionNoIds: {
    code: '-2014',
    message: 'enable or disable permission need parameter _ids',
  },
  enablePermissionStatusNotCorrect: {
    code: '-2015',
    message: 'enable or disable permission parameter status is not correct',
  },
  loginCannotFindUser: {
    code: '-3001',
    message: 'login cannot find user',
  },
  notLogin: {
    code: '-3002',
    message: "user don't login",
  },
  loginExpired: {
    code: '-3003',
    message: 'login has expired',
  },
  loginCannotGetUserInfo: {
    code: '-3004',
    message: "login can't get userInfo",
  },
  noAccess: {
    code: '-4001',
    message: 'no access to this api',
  },
  databaseError: {
    code: '-1',
    message: 'data base error.',
  },
  validateError: {
    code: '-10',
    message: 'parameter {{param}} is not correct',
  },
  uniqueError: {
    code: '-20',
    message: '{{key}}({{value}}) has been used',
  },
  groupIdIsNull: {
    code: '-5000',
    message: 'no parameter groupId.',
  },
  aboveGroupIsNotExist: {
    code: '-5001',
    message: 'parent group is not exist',
  },
  groupIsNotExist: {
    code: '-5002',
    message: 'group is not exist.',
  },
  groupDeleteDenyIsYes: {
    code: '-5003',
    message: 'you cannot delete this group that has set up delete protection',
  },
  cannotDeleteProtectGroup: {
    code: '-5004',
    message: 'the following groups have set up delete protection, and can not perform delete operations, please cancel the protection after the trial, {{groupNames}}',
  },
  groupTypeIsUnValidate: {
    code: '-5005',
    message: 'group type is not correct',
  },
  groupNameIsNull: {
    code: '-5006',
    message: 'group name is null.',
  },
  groupNameIsAlreadyExist: {
    code: '-5007',
    message: 'group name is already exist in the same level.',
  },
  cannotFindGroup: {
    code: '-5008',
    message: 'cannot find group',
  },
  getUserOrDepartmentRoleAndPermissionsNoId: {
    code: '-6001',
    message: 'get user or department role and permissions no parameter _id',
  },
  permissionIsUnActive: {
    code: '-7001',
    message: 'this permission has been forbidden',
  },
  taskIdIsNull: {
    code: '-8001',
    message: 'task id is null',
  },
  taskInfoIsNull: {
    code: '-8002',
    message: 'task info is null',
  },
  parentTaskInfoIsNull: {
    code: '-8003',
    message: 'parent task info is null',
  },
  parentIdIsNull: {
    code: '-8003',
    message: 'parent taskId is null',
  },
  typeError: {
    code: '-10001',
    message: '{{field}} 输入类型错误',
  },
};
