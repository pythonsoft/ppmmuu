/**
 * Created by steven on 2017/9/7.
 */

'use strict';

const uuid = require('uuid');
const PermissionInfo = require('../api/role/permissionInfo');

const permissionInfo = new PermissionInfo();

const permissionNames = ['添加配置项', '更新配置项', '配置项列表', '删除配置项', '添加配置组', '更新配置组', '配置组列表', '删除配置组', '列举小组', '添加小组', '删除分组', '获取分组的详细信息', '更新组信息', '引擎列表', '添加引擎', '获取引擎的详细信息', '更新引擎信息', '删除引擎', '更新引擎配置信息', '列举引擎进程', '列举进程命令', '执行进程action操作', '安装监控', '组列表', '组的详情', '添加组', '删除组', '组成员列表', '查看成员详情', '添加组成员', '删除组成员', '组成员调整部门', '禁用或启用组用户', '修改组成员信息', '获取公司或部门或小组或成员权限', '获取公司或部门或小组或成员生效权限', '更新公司或部门或小组或成员的权限', '修改公司或部门或组的属性', '搜索公司成员', '初始化编辑器', '列举出项目下的资源', '创建项目下的目录', '添加视频片断到项目中', '删除资源', '更新目录或资源信息', '创建新的项目', '删除项目', '列举出当前用户的项目', 'download', 'createTemplate', 'updateTemplate', 'listJob', 'listTemplate', 'queryJob', 'restartJob', 'stopJob', 'deleteJob', 'deleteTemplate', '角色列表', '角色详情', '增加角色', '编辑角色', '编辑角色中增加权限', '编辑角色中删除权限', '删除角色', '权限列表', '分配角色给用户或组织', '删除用户或组织的角色', '启用或禁用权限', '搜索拥有特定角色的用户,组织,部门,小组', '角色中搜索用户或组织', '存储区列表', '存储区详情', '增加存储区', '编辑存储区', '启动或挂起存储区', '删除存储区', '存储路径列表', '存储路径详情', '增加存储路径', '编辑存储路径', '启动或挂起存储路径', '删除存储路径', '存储策略列表', '存储策略详情', '增加策略', '编辑存储策略', '启动或挂起策略', '删除存储策略', 'list', 'listChildTask', 'restart', 'stop', '上传图片', '所有权限'];
const permissionPaths = ['/configuration/add', '/configuration/update', '/configuration/list', '/configuration/delete', '/configuration/addGroup', '/configuration/updateGroup', '/configuration/listGroup', '/configuration/deleteGroup', '/engine/listGroup', '/engine/addGroup', '/engine/removeGroup', '/engine/getGroup', '/engine/updateGroup', '/engine/listEngine', '/engine/addEngine', '/engine/getEngine', '/engine/updateEngine', '/engine/removeEngine', '/engine/updateEngineConfiguration', '/engine/listProcess', '/engine/listAction', '/engine/emitAction', '/engine/installMonitor', '/group/list', '/group/getDetail', '/group/add', '/group/delete', '/group/listUser', '/group/userDetail', '/group/addUser', '/group/deleteGroupUser', '/group/justifyUserGroup', '/group/enableUser', '/group/updateUser', '/group/getOwnerPermission', '/group/getOwnerEffectivePermission', '/group/updateOwnerPermission', '/group/updateGroupInfo', '/group/searchUser', '/ivideo/init', '/ivideo/listItem', '/ivideo/createDirectory', '/ivideo/createItem', '/ivideo/removeItem', '/ivideo/updateItem', '/ivideo/createProject', '/ivideo/removeProject', '/ivideo/listProject', '/job/download', '/job/createTemplate', '/job/updateTemplate', '/job/list', '/job/listTemplate', '/job/query', '/job/restart', '/job/stop', '/job/delete', '/job/deleteTemplate', '/role/list', '/role/getDetail', '/role/add', '/role/update', '/role/updateRoleAddPermission', '/role/updateRoleDeletePermission', '/role/delete', '/role/listPermission', '/role/assignRole', '/role/deleteOwnerRole', '/role/enablePermission', '/role/getRoleOwners', '/role/search/userOrGroup', '/storage/listBucket', '/storage/getBucketDetail', '/storage/addBucket', '/storage/updateBucket', '/storage/enableBucket', '/storage/deleteBucket', '/storage/listPath', '/storage/getPathDetail', '/storage/addPath', '/storage/updatePath', '/storage/enablePath', '/storage/deletePath', '/storage/listTactics', '/storage/getTacticsDetail', '/storage/addTactics', '/storage/updateTactics', '/storage/enableTactics', '/storage/deleteTactics', '/transcode/list', '/transcode/listChildTask', '/transcode/restart', '/transcode/stop', '/upload/', 'all'];

const nLength = permissionNames.length;
const pLength = permissionPaths.length;
if (nLength && nLength === pLength) {
  /* eslint-disable consistent-return */
  permissionInfo.collection.removeMany({}, (err) => {
    if (err) {
      throw new Error(`权限表初始化有问题:${err.message}`);
    }
    const info = [];
    for (let i = 0; i < permissionPaths.length; i++) {
      info.push({
        _id: uuid.v1(),
        name: permissionNames[i],
        path: permissionPaths[i],
        createdTime: new Date(),
        modifyTime: new Date(),
        status: '0',
      });
    }
    if (info.length) {
      permissionInfo.collection.insert(info, {
        w: 1,
      }, (err) => {
        if (err) {
          throw new Error(`权限表初始化有问题:${err.message}`);
        }
        return true;
      });
    }
  });
  /* eslint-enable consistent-return */
} else if (nLength !== pLength) {
  throw new Error('api接口权限注释有问题');
}
