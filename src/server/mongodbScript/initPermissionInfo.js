/**
 * Created by steven on 2017/9/7.
 */

'use strict';

const uuid = require('uuid');
const PermissionInfo = require('../api/role/permissionInfo');

const permissionInfo = new PermissionInfo();

const permissionNames = ["apnPush","saveApnToken","auditPass","listAudit","listAuditRule","createAuditRule","updateAuditRule","removeAuditRule","添加配置项","更新配置项","配置项列表","删除配置项","添加配置组","更新配置组","配置组列表","删除配置组","通道连线数量统计","获取所有通道","请求连线","查询连线","更新连线","处理连线，分配通道","列举小组","添加小组","删除分组","获取分组的详细信息","更新组信息","引擎列表","添加引擎","获取引擎的详细信息","更新引擎信息","删除引擎","更新引擎配置信息","列举引擎进程","列举进程命令","执行进程action操作","安装监控","获取单条反馈信息","反馈信息列表","组列表","组的详情","添加组","删除组","组成员列表","查看成员详情","添加组成员","删除组成员","组成员调整部门","禁用或启用组用户","修改组成员信息","获取公司或部门或小组或成员权限","获取公司或部门或小组或成员生效权限","更新公司或部门或小组或成员的权限","修改公司或部门或组的属性","搜索公司成员","绑定快传账户","上传升级包","安装升级包","列举安装包内的目录及文件","读取文件内容","安装版本详细信息","初始化编辑器","列举出项目下的资源","创建项目下的目录","添加视频片断到项目中","删除资源","更新目录或资源信息","创建新的项目","删除项目","列举出当前用户的项目","复制目录或文件到另外一个目录下","移动目录或文件到另外一个目录下","视频剪辑","下载任务","下载合并任务","创建转码模板","更新转码模板","下载任务列表","转码模板列表","下载任务详情","下载任务重启","下载任务停止","下载任务删除","删除转码模板","创建编目任务信息","更新编目任务信息","列举编目任务","获取编目任务详细信息","列举所在部门的编目任务","列举我的编目任务","派发任务","认领任务","退回任务","提交任务","删除任务","恢复任务","获取编目详细信息","获取编目任务的所有编目信息(翻译)","列举编目信息","创建编目信息","更新编目信息","创建文件信息","更新文件信息","获取文件列表","获取文件详细信息","获取文件字幕信息","生成入库XML文件","添加入库模板","获取入库模板详细信息","获取入库模板信息以及根据文件选择出需要的转码模板Id","列举入库模板信息","删除入库模板","更新入库模板","获取所有频道","列举节目","获取节目信息","获取直播下载链接","获取稿件标签配置","提交稿件时用到的相关配置项","获取稿件","保存稿件","稿件统计","稿件列表","提交稿件列表","稿件搜索历史","清除稿件搜索历史","改变稿件状态","复制稿件","删除稿件","添加稿件","附件绑定稿件","附件列表接口","稿件删除附件","稿件简繁转换","稿件获取联系人组列表","稿件获取联系人列表","稿件附件创建websocket任务","稿件附件更新websocket任务","再次提交稿件到大洋系统","大洋稿件入库管理","管理员再次提交","媒体库搜索","媒体库搜索默认页","媒体库搜索手机版首页","addProcessTemplateGroup","listProcessTemplateGroup","removeProcessTemplateGroup","getProcessTemplateGroup","updateProcessTemplateGroup","流程模板列表","创建流程模板","删除流程模板","更新流程模板信息","获取流程模板详细信息","getTemplateListByType","检询二维码扫码状态","获取二维码","扫二维码","报表统计","角色列表","角色详情","增加角色","编辑角色","编辑角色中增加权限","编辑角色中删除权限","删除角色","权限列表","分配角色给用户或组织","删除用户或组织的角色","启用或禁用权限","搜索拥有特定角色的用户,组织,部门,小组","角色中搜索用户或组织","权限组列表","获取上架任务详情(管理)","上架任务列表(管理)","删除上架任务(管理)","添加上架模板","获取上架模板详细信息","列举上架模板列表","删除入上架模板","更新上架模板","添加快编模板","获取快编模板详细信息","列举快编模板列表","删除快编模板","更新快编模板","查看上架任务流程详情","创建上架任务","获取任务详情","待认领列表","认领上架任务","派发上架任务","删除上架任务","部门任务全部列表","我的任务列表","保存上架任务","批量保存上架任务","提交上架任务","批量提交上架任务","退回上架任务","上架管理列表","上架","下架","下架再编辑","部门任务中搜索用户","编辑任务中的订阅类型列表","视频上架","列表页提交上架任务","上架任务流程详情","存储区列表","存储区详情","增加存储区","编辑存储区","启动或挂起存储区","删除存储区","存储路径列表","存储路径详情","增加存储路径","编辑存储路径","启动或挂起存储路径","删除存储路径","存储策略列表","存储策略详情","增加策略","编辑存储策略","启动或挂起策略","删除存储策略","增加订阅公司","修改订阅公司","获取订阅公司详情","订阅管理列表","删除订阅公司","订阅管理中搜索用户","增加订阅类型","修改订阅类型","获取订阅类型详情","订阅类型列表","删除订阅类型","addTemplateGroup","listTemplateGroup","removeTemplateGroup","getTemplateGroup","updateTemplateGroup","下载模板列表","创建下载模板","删除下载模板","更新下载模板信息","获取下载模板详细信息","下载模板中搜索用户或组织","更新下载模板分组使用人信息","转码模板获取水印图","list","listChildTask","restart","stop","同步AD账户","任务-审核任务列表","任务-审核任务通过或拒绝","user_restartJob","列举部门列表","所有权限"]
const permissionPaths = ["/apn/push","/apn/saveApnToken","/audit/pass","/audit/list","/audit/listAuditRule","/audit/createAuditRule","/audit/updateAuditRule","/audit/removeAuditRule","/configuration/add","/configuration/update","/configuration/list","/configuration/delete","/configuration/addGroup","/configuration/updateGroup","/configuration/listGroup","/configuration/deleteGroup","/connection/getSummary","/connection/getAllChannel","/connection/askLine","/connection/getLine","/connection/updateLine","/connection/dealLine","/engine/listGroup","/engine/addGroup","/engine/removeGroup","/engine/getGroup","/engine/updateGroup","/engine/listEngine","/engine/addEngine","/engine/getEngine","/engine/updateEngine","/engine/removeEngine","/engine/updateEngineConfiguration","/engine/listProcess","/engine/listAction","/engine/emitAction","/engine/installMonitor","/faq/getDetail","/faq/list","/group/list","/group/getDetail","/group/add","/group/delete","/group/listUser","/group/userDetail","/group/addUser","/group/deleteGroupUser","/group/justifyUserGroup","/group/enableUser","/group/updateUser","/group/getOwnerPermission","/group/getOwnerEffectivePermission","/group/updateOwnerPermission","/group/updateGroupInfo","/group/searchUser","/group/bindMediaExpressUser","/help/uploadPackage","/help/installPackage","/help/listPackage","/help/readFile","/help/detail","/ivideo/init","/ivideo/listItem","/ivideo/createDirectory","/ivideo/createItem","/ivideo/removeItem","/ivideo/updateItem","/ivideo/createProject","/ivideo/removeProject","/ivideo/listProject","/ivideo/copy","/ivideo/move","/ivideo/warehouse","/job/download","/job/multiDownload","/job/createTemplate","/job/updateTemplate","/job/list","/job/listTemplate","/job/query","/job/restart","/job/stop","/job/delete","/job/deleteTemplate","/library/createCatalogTask","/library/updateCatalogTask","/library/listCatalogTask","/library/getCatalogTask","/library/listDepartmentCatalogTask","/library/listMyCatalogTask","/library/assignCatalogTask","/library/applyCatalogTask","/library/sendBackCatalogTask","/library/submitCatalogTask","/library/deleteCatalogTask","/library/resumeCatalogTask","/library/getCatalog","/library/getCatalogInfoTranslation","/library/listCatalog","/library/createCatalog","/library/updateCatalog","/library/createFile","/library/updateFile","/library/listFile","/library/getFile","/library/getSubtitles","/library/generateXML","/library/addTemplate","/library/getTemplateInfo","/library/getTemplateResult","/library/listTemplate","/library/removeTemplate","/library/updateTemplate","/live/channels","/live/listProgram","/live/getProgram","/live/createDownloadUrl","/manuscript/getTagsConfig","/manuscript/getManuscriptConfig","/manuscript/getManuscript","/manuscript/addOrUpdate","/manuscript/getSummary","/manuscript/list","/manuscript/listSubmitScript","/manuscript/getSearchHistory","/manuscript/clearSearchHistory","/manuscript/changeManuscriptStatus","/manuscript/copy","/manuscript/clearAll","/manuscript/addAttachment","/manuscript/bindAttachment","/manuscript/listAttachments","/manuscript/deleteAttachments","/manuscript/hongKongSimplified","/manuscript/listGroup","/manuscript/listUser","/manuscript/createWebSocketTask","/manuscript/updateWebSocketTask","/manuscript/resubmitScript","/manuscript/listManageSubmitScript","/manuscript/manageResubmitScript","/media/esSearch","/media/getEsMediaList","/media/defaultMedia","/processTemplate/addGroup","/processTemplate/listGroup","/processTemplate/removeGroup","/processTemplate/getGroup","/processTemplate/updateGroup","/processTemplate/list","/processTemplate/createTemplate","/processTemplate/remove","/processTemplate/update","/processTemplate/getDetail","/processTemplate/getTemplateListByType","/qrcode/query","/qrcode/login","/qrcode/scan","/requests","/role/list","/role/getDetail","/role/add","/role/update","/role/updateRoleAddPermission","/role/updateRoleDeletePermission","/role/delete","/role/listPermission","/role/assignRole","/role/deleteOwnerRole","/role/enablePermission","/role/getRoleOwners","/role/search/userOrGroup","/role/listPermissionGroup","/shelfManage/getShelfDetail","/shelfManage/listTask","/shelfManage/deleteShelfTask","/shelfManage/addTemplate","/shelfManage/getTemplateInfo","/shelfManage/listTemplate","/shelfManage/removeTemplate","/shelfManage/updateTemplate","/shelfManage/addFastEditTemplate","/shelfManage/getFastEditTemplateInfo","/shelfManage/listFastEditTemplate","/shelfManage/removeFastEditTemplate","/shelfManage/updateFastEditTemplate","/shelfManage/getShelfTaskProcess","/shelves/createShelfTask","/shelves/getShelfDetail","/shelves/listDepartmentPrepareShelfTask","/shelves/claimShelfTask","/shelves/assignShelfTask","/shelves/deleteShelfTask","/shelves/listDepartmentShelfTask","/shelves/listMyselfShelfTask","/shelves/saveShelf","/shelves/batchSaveShelf","/shelves/submitShelf","/shelves/batchSubmitShelf","/shelves/sendBackShelf","/shelves/listLineShelfTask","/shelves/onlineShelfTask","/shelves/offlineShelfTask","/shelves/editShelfTaskAgain","/shelves/searchUser","/shelves/listSubscribeType","/shelves/warehouse","/shelves/batchSubmitByIds","/shelves/processDetail","/storage/listBucket","/storage/getBucketDetail","/storage/addBucket","/storage/updateBucket","/storage/enableBucket","/storage/deleteBucket","/storage/listPath","/storage/getPathDetail","/storage/addPath","/storage/updatePath","/storage/enablePath","/storage/deletePath","/storage/listTactics","/storage/getTacticsDetail","/storage/addTactics","/storage/updateTactics","/storage/enableTactics","/storage/deleteTactics","/subscribeManagement/create","/subscribeManagement/update","/subscribeManagement/getSubscribeInfo","/subscribeManagement/list","/subscribeManagement/delete","/subscribeManagement/searchCompany","/subscribeManagement/createSubscribeType","/subscribeManagement/updateSubscribeType","/subscribeManagement/getSubscribeType","/subscribeManagement/listSubscribeType","/subscribeManagement/deleteSubscribeType","/template/addGroup","/template/listGroup","/template/removeGroup","/template/getGroup","/template/updateGroup","/template/list","/template/createDownloadTemplate","/template/remove","/template/update","/template/getDetail","/template/search/userOrGroup","/template/updateGroupUser","/template/getWatermark","/transcode/list","/transcode/listChildTask","/transcode/restart","/transcode/stop","/user/adAccountSync","/user/listAuditJob","/user/passOrRejectAudit","/user/restartJob","/user/listUserByDepartment","all"]
const permissionGroups = ["apn","apn","auditDownload","auditDownload","auditEmpower","auditEmpower","auditEmpower","auditEmpower","configuration","configuration","configuration","configuration","configuration","configuration","configuration","configuration","connection","connection","connection","connection","connection","connection","engine","engine","engine","engine","engine","engine","engine","engine","engine","engine","engine","engine","engine","engine","engine","managementFeedback","managementFeedback","account","account","account","account","account","account","account","account","account","account","account","account","account","account","account","account","account","managementAbout","managementAbout","managementAbout","managementAbout","managementAbout","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","movieEditor","transcodeTemplate","transcodeTemplate","download","transcodeTemplate","download","download","download","download","transcodeTemplate","library","library","library","library","departmentTask","personalTask","departmentTask","library","personalTask","personalTask","library","departmentTask","library","library","library","library","library","library","library","library","library","library","libraryTemplate","libraryTemplate","libraryTemplate","libraryTemplate","libraryTemplate","libraryTemplate","libraryTemplate","live","live","live","live","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copy","copyManagement","copyManagement","mediaCenter","mediaCenter","mediaCenter","processTemplate","processTemplate","processTemplate","processTemplate","processTemplate","processTemplate","processTemplate","processTemplate","processTemplate","processTemplate","processTemplate","qrcode","qrcode","qrcode","report","role","role","role","role","role","role","role","permission","role","role","permissionGroup","role","role","role","shelfList","shelfList","shelfList","shelfTemplate","shelfTemplate","shelfTemplate","shelfTemplate","shelfTemplate","fastEditTemplate","fastEditTemplate","fastEditTemplate","fastEditTemplate","shelfTemplate","shelfList","departmentShelf","departmentShelf","departmentShelf","departmentShelf","departmentShelf","departmentShelf","departmentShelf","myShelf","myShelf","myShelf","myShelf","myShelf","myShelf","lineShelf","lineShelf","lineShelf","lineShelf","departmentShelf","myShelf","myShelf","myShelf","myShelf","bucket","bucket","bucket","bucket","bucket","bucket","storagePath","storagePath","storagePath","storagePath","storagePath","storagePath","storageTactics","storageTactics","storageTactics","storageTactics","storageTactics","storageTactics","subscribeInfo","subscribeInfo","subscribeInfo","subscribeInfo","subscribeInfo","subscribeInfo","subscribeType","subscribeType","subscribeType","subscribeType","subscribeType","downloadTemplate","downloadTemplate","downloadTemplate","downloadTemplate","downloadTemplate","downloadTemplate","downloadTemplate","downloadTemplate","downloadTemplate","downloadTemplate","downloadTemplate","downloadTemplate","transcodeTemplate","transcode","transcode","transcode","transcode","account","auditTask","auditTask","downloadTask","account","root"]

const nLength = permissionNames.length;
const pLength = permissionPaths.length;
const mLength = permissionGroups.length;
if (nLength && nLength === pLength && nLength === mLength) {
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
        groupIndex: permissionGroups[i],
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
} else {
  throw new Error('api接口权限注释有问题');
}
