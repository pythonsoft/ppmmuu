'use strict';

module.exports = {
  usernameOrPasswordIsWrong: {
    code: '-1001',
    message: '用户名或密码不正确',
  },
  userInfoFindWrong: {
    code: '-1002',
    message: '查找userInfo系统报错',
  },
  userIdIsNull: {
    code: '-1003',
    message: '用户标识为空',
  },
  userNotFind: {
    code: '-1004',
    message: '找不到用户',
  },
  oldPasswordIsNotCorrect: {
    code: '-1005',
    message: '旧密码不正确',
  },
  newPasswordIsNotCorrect: {
    code: '-1006',
    message: '新密码格式不正确',
  },
  confirmNewPasswordIsNotCorrect: {
    code: '-1007',
    message: '两次输入新密码不相同',
  },
  newPasswordIsSameWithOldPassword: {
    code: '-1008',
    message: '新密码与旧密码相同',
  },
  userExpiredTime: {
    code: '-1009',
    message: '用户已过期',
  },
  userNameIsNull: {
    code: '-1010',
    message: '用户名称为空',
  },
  infosNotCorrect: {
    code: '-1011',
    message: '缺少参数infos或者infos类型不是数组',
  },
  getRoleNoId: {
    code: '-2005',
    message: '获取角色详情需要参数_id',
  },
  deleteRoleNoIds: {
    code: '-2006',
    message: '删除角色需要参数_ids',
  },
  assignRoleNoRoles: {
    code: '-2007',
    message: '分配角色需要参数roles',
  },
  assignRoleNoId: {
    code: '-2008',
    message: '分配角色需要参数_id',
  },
  roleInfoIsNotExist: {
    code: '-2009',
    message: '找不到角色',
  },
  assignPermissionNoUserIds: {
    code: '-2010',
    message: '分配权限需要参数userIds',
  },
  enablePermissionNoIds: {
    code: '-2014',
    message: '启用或禁用权限需要参数_ids',
  },
  enablePermissionStatusNotCorrect: {
    code: '-2015',
    message: '启用或禁用权限参数status不正确',
  },
  canNotFindRole: {
    code: '-2016',
    message: '找不到角色',
  },
  getRoleOwnersNoId: {
    code: '-2017',
    message: '获取角色拥有者需要参数_id',
  },
  deleteRoleOwnersNoId: {
    code: '-2018',
    message: '删除用户角色需要参数_id',
  },
  deleteRoleOwnersNoRoles: {
    code: '-2019',
    message: '删除用户角色需要参数roles',
  },
  canNotFindRoleAssign: {
    code: '-2020',
    message: '找不到角色分配记录',
  },
  updateRoleNoId: {
    code: '-2021',
    message: '更新角色需要参数_id',
  },
  canNotDisableAllPermission: {
    code: '-2022',
    message: '不能禁用权限(所有权限)',
  },
  loginCannotFindUser: {
    code: '-3001',
    message: '登录时找不到用户',
  },
  notLogin: {
    code: '-3002',
    message: '用户没有登录',
  },
  loginExpired: {
    code: '-3003',
    message: '登录已过期',
  },
  loginCannotGetUserInfo: {
    code: '-3004',
    message: '登录找不到用户信息',
  },
  needReLogin: {
    code: '-3005',
    message: '需要重新登录',
  },
  noAccess: {
    code: '-4001',
    message: '无权访问此接口',
  },
  databaseError: {
    code: '-1',
    message: '数据库异常.',
  },
  databaseErrorDetail: {
    code: '-2',
    message: '{{error}}',
  },
  validateError: {
    code: '-10',
    message: '参数 {{param}} 不正确',
  },
  uniqueError: {
    code: '-20',
    message: '{{field}}({{value}})已经被使用了',
  },
  jsonParseError: {
    code: '-30',
    message: 'JSON对象解析出错',
  },
  groupIdIsNull: {
    code: '-5000',
    message: '请输入组织Id.',
  },
  aboveGroupIsNotExist: {
    code: '-5001',
    message: '上级组织不存在.',
  },
  groupIsNotExist: {
    code: '-5002',
    message: '组织不存在.',
  },
  groupDeleteDenyIsYes: {
    code: '-5003',
    message: '该组织设置了删除保持，不能将该组织删除.',
  },
  cannotDeleteProtectGroup: {
    code: '-5004',
    message: '以下组织设置了删除保护，不能执行删除操作，请取消保护后再进行偿试，{{groupNames}}',
  },
  groupTypeIsUnValidate: {
    code: '-5005',
    message: '组织type不正确.',
  },
  groupNameIsNull: {
    code: '-5006',
    message: '组织name为空.',
  },
  groupNameIsAlreadyExist: {
    code: '-5007',
    message: '同一级已经存在相同的组织名.',
  },
  cannotFindGroup: {
    code: '-5008',
    message: '找不到组织',
  },
  parentGroupInfoIsNotExist: {
    code: '-5009',
    message: '上一级组织信息不存在',
  },
  createCompanyFailed: {
    code: '-5010',
    message: '创建公司失败',
  },
  emailHasBeenRegistered: {
    code: '-5011',
    message: '此邮箱已经被注册',
  },
  nameHasBeenRegistered: {
    code: '-5012',
    message: '此姓名已经被注册',
  },
  getUserOrDepartmentRoleAndPermissionsNoId: {
    code: '-6001',
    message: '获取用户或部门角色和权限详情没有参数_id',
  },
  permissionIsUnActive: {
    code: '-7001',
    message: '此权限已经被禁用',
  },
  taskIdIsNull: {
    code: '-8001',
    message: '任务Id不存在',
  },
  taskInfoIsNull: {
    code: '-8002',
    message: '任务信息不存在',
  },
  parentTaskInfoIsNull: {
    code: '-8003',
    message: '父任务信息不存在',
  },
  parentIdIsNull: {
    code: '-8003',
    message: '父任务Id不存在',
  },
  taskTargetIsNull: {
    code: '-8004',
    message: '任务目标信息不完整',
  },
  taskCreatorIsNull: {
    code: '-8005',
    message: '任务创建者信息不完整',
  },
  taskCreatorIdNameTypeIsNull: {
    code: '-8006',
    message: '任务创建者信息不完全，请检查，id，name, type',
  },
  bucketIdIsNull: {
    code: '-9001',
    message: '存储区Id不存在',
  },
  bucketInfoIsNull: {
    code: '-9002',
    message: '存储区信息不存在',
  },
  bucketNameIsNull: {
    code: '-9003',
    message: '存储区名称不存在',
  },
  bucketDeleteDeny: {
    code: '-9004',
    message: '存储区处于删除保护状态，删除此存储区请将删除保护关闭',
  },
  pathIdIsNull: {
    code: '-9005',
    message: '请输入路径Id',
  },
  pathInfoIsNull: {
    code: '-9006',
    message: '路径信息不存在',
  },
  pathNameIsNull: {
    code: '-9007',
    message: '请填写路径名称',
  },
  pathCreatorIsNull: {
    code: '-9007',
    message: '请填写路径创建人',
  },
  tacticsIdIsNull: {
    code: '-9008',
    message: '策略Id不存在',
  },
  tacticsInfoIsNull: {
    code: '-9009',
    message: '策略信息不存在',
  },
  sourceIdIsNull: {
    code: '-9010',
    message: '添加策略的目标Id不存在',
  },
  sourceTypeIsNull: {
    code: '-9011',
    message: '添加策略的目标类型不存在',
  },
  sourceTypeIsNotExist: {
    code: '-9012',
    message: '策略类型不存在',
  },
  pathIdOrViceIdAndBucketIdIsNull: {
    code: '-9013',
    message: '请输入路径Id或路径副标识和所属存储区Id',
  },
  canNotFindPath: {
    code: '-9014',
    message: '找不到路径信息',
  },
  typeError: {
    code: '-10001',
    message: '{{field}} 输入类型错误',
  },
  requireError: {
    code: '-10002',
    message: '必须填写 {{field}}',
  },
  validationError: {
    code: '-10003',
    message: '{{field}} 不符合验证规则',
  },
  fieldIsNotExistError: {
    code: '-10004',
    message: '{{field}} 字段不在实体类中，无法进行存取操作',
  },
  searchUserOrGroupTypeNotCorrect: {
    code: '-11001',
    message: '搜索用户或组织参数type不正确',
  },
  engineGroupIdIsNull: {
    code: '-12001',
    message: '请输入引擎组Id.',
  },
  engineGroupInfoIsNull: {
    code: '-12002',
    message: '引擎组信息不存在.',
  },
  parentEngineGroupInfoIsNull: {
    code: '-12003',
    message: '上级引擎组信息不存在.',
  },
  engineGroupDeleteDenyIsYes: {
    code: '-12004',
    message: '该引擎组设置了删除保护，不能将该引擎组删除.',
  },
  systemEngineGroupCannotDelete: {
    code: '-12005',
    message: '该引擎组为系统级别，不能将该引擎组删除.',
  },
  systemEngineGroupName: {
    code: '-12006',
    message: '引擎组列表',
  },
  engineInfoIdIsNull: {
    code: '-12007',
    message: '引擎ID不存在',
  },
  engineConfigurationParseError: {
    code: '-12008',
    message: '引擎配置项不符合标准',
  },
  engineConfigurationCanNotBeNull: {
    code: '-12008',
    message: '引擎配置项不能为空值',
  },
  engineIpCanNotBeNull: {
    code: '-12009',
    message: '引擎IP不能为空',
  },
  getSysInfoFailed: {
    code: '-12011',
    message: '获取引擎信息失败',
  },
  processIdCanNotBeNull: {
    code: '-12009',
    message: '进程Id不能为空',
  },
  configProcessNameCanNotBeNull: {
    code: '-12010',
    message: '配置文件中的进程名称不能为空',
  },
  processActionCanNotBeNull: {
    code: '-12010',
    message: '进程操作(action)不能为空',
  },
  solrSearchFailed: {
    code: '-13001',
    message: '搜索失败',
  },
  solrSearchError: {
    code: '-13002',
    message: '{{error}}',
  },
  getIconFailed: {
    code: '-13003',
    message: '获取缩略图失败',
  },
  getIconError: {
    code: '-13004',
    message: '{{error}}',
  },
  getObjectFailed: {
    code: '-13005',
    message: '获取单条详情失败',
  },
  getObjectError: {
    code: '-13006',
    message: '{{error}}',
  },
  getMeidaCenterSearchConfigsJSONError: {
    code: '-13007',
    message: '媒体库搜索配置项配置出错',
  },
  getSubtitleFailed: {
    code: '-13008',
    message: '获取字幕失败',
  },
  getSubtitleError: {
    code: '-13009',
    message: '{{error}}',
  },
  objectIdIsNull: {
    code: '-13010',
    message: 'objectid参数为空',
  },
  setupFailed: {
    code: '-20001',
    message: '安装监控客户端失败',
  },
  listProcessFailed: {
    code: '-20002',
    message: '进程列表出错',
  },
  ActionFailed: {
    code: '-20003',
    message: 'Action失败',
  },
  UpdateConfigFailed: {
    code: '-20004',
    message: '更新客户端配置文件失败',
  },
  childTaskParentIdIsNull: {
    code: '-30001',
    message: '主任务ID不能为空',
  },
  taskTypeIsNotExist: {
    code: '-30002',
    message: '任务类型不存在',
  },
  childTaskIdIsNotExist: {
    code: '-30003',
    message: '子任务ID不存在',
  },
  ivideoProjectCreatorIdIsNull: {
    code: '-40001',
    message: '媒体编辑器项目创建人Id为空',
  },
  ivideoProjectInfoIsNotExist: {
    code: '-40002',
    message: '媒体编辑器项目信息不存在',
  },
  ivideoParentIdIsNull: {
    code: '-40003',
    message: '资源父级Id为空',
  },
  ivideoProjectIdIsNull: {
    code: '-40003',
    message: '项目Id为空',
  },
  ivideoProjectNameIsNull: {
    code: '-40004',
    message: '项目名为空',
  },
  ivideoProjectDefaultName: {
    code: '-40005',
    message: '我的资源',
  },
  ivideoItemNameIsNull: {
    code: '-40006',
    message: '资源名称为空',
  },
  ivideoRemoveItemIdIsNull: {
    code: '-40007',
    message: '删除的目标对象Id为空',
  },
  ivideoItemCanNotRemove: {
    code: '-40008',
    message: '此项目不能被删除',
  },
  ivideoProjectDefaultNameNull: {
    code: '-40009',
    message: '默认项目',
  },
  ivideoProjectCanNotRemove: {
    code: '-40010',
    message: '此项目不能被删除',
  },
  ivideoItemDefaultName: {
    code: '-40011',
    message: '默认目录',
  },
  ivideoRemoveItemIsNull: {
    code: '-40012',
    message: '删除的目标对象为空',
  },
  ivideoDefaultDirectoryCanNotRemove: {
    code: '-40013',
    message: '默认目录不能删除',
  },
  ivideoDefaultDirectoryIsNull: {
    code: '-40013',
    message: '默认目录不存在',
  },
  joDownloadParamsIsNull: {
    code: '-50001',
    message: '下载参数为空，请正确传入参数',
  },
  joDownloadParamsFileNameIsNull: {
    code: '-50002',
    message: '下载参数filename为空，请正确传入参数',
  },
  joDownloadParamsObjectIdIsNull: {
    code: '-50003',
    message: '下载参数objectid为空，请正确传入参数',
  },
  joDownloadParamsInpointOrOutpointTypeError: {
    code: '-50004',
    message: '下载参数inpoint或outpoint参数类型不正确',
  },
  joDownloadParamsInpointLessThanOutpointTypeError: {
    code: '-50005',
    message: '下载参数inpoint值小于outpoint值',
  },
  joDownloadError: {
    code: '-50006',
    message: '下载出错:{{error}}',
  },
  jobDistributeError: {
    code: '-50007',
    message: '纷发出错:{{error}}',
  },
  jobDistributeFieldIsNull: {
    code: '-50008',
    message: '纷发出错, {{field}}为空',
  },
  jobMediaExpressDispatchFieldIsNull: {
    code: '-50009',
    message: '快传出错, {{field}}为空',
  },
  jobListParamsIsNull: {
    code: '-50010',
    message: '任务列表参数为空',
  },
  jobListTemplateParamsIsNull: {
    code: '-50011',
    message: '模板列表参数为空',
  },
  jobQueryParamsIsNull: {
    code: '-50012',
    message: '任务详情参数为空',
  },
  jobQueryParamsIdIsNull: {
    code: '-50013',
    message: '任务详情参数jobid为空',
  },
  jobRestartParamsIsNull: {
    code: '-50014',
    message: '重启任务参数为空',
  },
  jobRestartParamsIdIsNull: {
    code: '-50015',
    message: '重启任务参数id为空',
  },
  jobStopParamsIsNull: {
    code: '-50016',
    message: '停止任务参数为空',
  },
  jobStopParamsIdIsNull: {
    code: '-50017',
    message: '停止任务参数id为空',
  },
  jobDeleteParamsIsNull: {
    code: '-50018',
    message: '删除任务参数为空',
  },
  jobDeleteParamsIdIsNull: {
    code: '-50019',
    message: '删除任务参数id为空',
  },
  jobCreateTemplateParamsIsNull: {
    code: '-50020',
    message: '创建template参数为空',
  },
  jobCreateTemplateParamsCreateJsonIsNull: {
    code: '-50021',
    message: '创建template参数createJson为空',
  },
  joDownloadParamsFileTypeIdIsNull: {
    code: '-50022',
    message: '下载参数filetypeid为空，请正确传入参数',
  },
  joDownloadParamsFileDestinationIsNull: {
    code: '-50023',
    message: '下载参数destination为空，请正确传入参数',
  },
  joDownloadPermissionDeny: {
    code: '-50024',
    message: '没有操作权限',
  },
  joShortDownloadParams: {
    code: '-50025',
    message: '缺少downloadParams参数',
  },
  joShortReceiverId: {
    code: '-50026',
    message: '缺少receiverId参数',
  },
  joShortReceiverType: {
    code: '-50027',
    message: '缺少receiverType参数',
  },
  joShortTemplateId: {
    code: '-50028',
    message: '缺少templateId参数',
  },
  jobDownloadParamsIsNull: {
    code: '-50029',
    message: '下载参数为空',
  },
  notImplementedVerityType: {
    code: '-60000',
    message: '未实装的verifyType',
  },
  templateStorageIdIsNotExist: {
    code: '-70000',
    message: '存储ID不存在',
  },
  templateIdIsNotExist: {
    code: '-70001',
    message: '模板ID不存在',
  },
  templateIsNotExist: {
    code: '-70002',
    message: '模板不存在',
  },
  templateBucketIdIsNotExist: {
    code: '-70003',
    message: '模板的存储Id不存在',
  },
  templateBucketIsNotExist: {
    code: '-70004',
    message: '模板的对应的存储信息不存在',
  },
  templatePathIsNotExist: {
    code: '-70005',
    message: '需要用到的以下存储路径信息不存在，{{paths}}',
  },
  templateDownloadPathError: {
    code: '-70005',
    message: '存储路径不正确，请确保脚本有返回result值，当前要求存储路径为:{{downloadPath}}',
  },
  templateTranscodeTemplatesInvalidJSON: {
    code: '-70006',
    message: '传入的transcodeTemplates是一个不合法的JSON结构体, [{ "_id": "", "name": "" }]',
  },
  templateTypeNotExist: {
    code: '-70007',
    message: '模板类型不存在，请传入正确的类型，当前传入类型为, {{type}}',
  },
  templateGroupIdIsNull: {
    code: '-70008',
    message: '下载模板组groupId不存在',
  },
  templateGroupCannotFind: {
    code: '-70009',
    message: '下载模板组找不到',
  },
  idIsNull: {
    code: '-80000',
    message: 'id为空',
  },
  requestCallApiError: {
    code: '-90000',
    message: '{{error}}',
  },
  requestCallApiFailed: {
    code: '-90001',
    message: 'api请求超时',
  },
  unBindMediaExpressUser: {
    code: '-90002',
    message: '没有绑定快传账户，请先绑定',
  },
  bindMediaExpressUserNeedRefresh: {
    code: '-90003',
    message: '绑定的快传账号用户名或密码发生变化，请重新绑定',
  },
  libraryCatalogTaskInfoIsNull: {
    code: '-100001',
    message: '输入的编目任务信息为空',
  },
  libraryCatalogTaskIdIsNull: {
    code: '-100002',
    message: '输入的编目任务Id为空',
  },
  libraryAssignCatalogTaskOwnerIdIsNull: {
    code: '-100003',
    message: ' 派发任务时OwnerId为空',
  },
  libraryCreateCatalogInfoIsNull: {
    code: '-100004',
    message: '创建编目信息时，编目信息为空',
  },
  libraryCreateCatalogInfoFieldIsNull: {
    code: '-100005',
    message: '创建编目信息时，{{field}}为空',
  },
  libraryCreateCatalogTaskInfoFieldIsNull: {
    code: '-100006',
    message: '创建编目信息时，{{field}}为空',
  },
  libraryCatalogTaskSubmitNull: {
    code: '-100007',
    message: '没有可以提交的编目任务',
  },
  libraryParentCatalogIsNotExist: {
    code: '-100008',
    message: '父级编目信息不存在',
  },
  libraryFileInfoIsNull: {
    code: '-100009',
    message: '创建文件信息时，文件信息为空',
  },
  libraryFileInfoFieldIsNull: {
    code: '-100010',
    message: '创建文件信息时，{{field}}为空',
  },
  libraryObjectIdIsNull: {
    code: '-100010',
    message: 'object id 为空',
  },
  libraryCatalogTaskSendBackNull: {
    code: '-100011',
    message: '没有可以退回的编目任务',
  },
  libraryCatalogTaskResumeNull: {
    code: '-100012',
    message: '没有可以恢复的编目任务',
  },
  libraryCatalogObjectIdIsNull: {
    code: '-100013',
    message: '输入的编目任务ObjectId为空',
  },
  shelfStatusNotCorrect: {
    code: '-110001',
    message: '状态不正确',
  },
  shelfShortIds: {
    code: '-110002',
    message: '缺少参数_ids',
  },
  shelfExistOtherStatus: {
    code: '-110003',
    message: '存在其他状态的任务，请先剔除掉',
  },
  shelfExistDeleteStatus: {
    code: '-110004',
    message: '存在状态为删除的任务，请先剔除掉',
  },
  shelfShortDealer: {
    code: '-110005',
    message: '缺少参数dealer',
  },
  shelfShortId: {
    code: '-110006',
    message: '缺少参数_id',
  },
  shelfNotFind: {
    code: '-110007',
    message: '找不到任务',
  },
  shelfCanNotSave: {
    code: '-110008',
    message: '不是处理中的任务不能保存或提交',
  },
  shelfExistNotDoingStatus: {
    code: '-110009',
    message: '不是处理中的任务不能退回',
  },
  shelfExistNotSubmittedStatus: {
    code: '-110010',
    message: '存在状态不是待上架的任务,请先剔除掉',
  },
  shelfExistNotOnlineStatus: {
    code: '-110011',
    message: '存在状态不是上架的任务,请先剔除掉',
  },
  NotOfflineStatusCanNotEditAgain: {
    code: '-110012',
    message: '状态不是下架的任务不能再编辑',
  },
  shelfHasExists: {
    code: '-110013',
    message: '之前上架过',
  },
  shelfObjectIdIsNull: {
    code: '-110014',
    message: '参数objectId为空',
  },
  subscribeInfoHasExists: {
    code: '-120000',
    message: '该公司已有订阅信息，不能重复增加',
  },
  subscribeInfoNotFind: {
    code: '-120001',
    message: '找不到订阅详情',
  },
  subscribeInfoShortId: {
    code: '-120002',
    message: '缺少参数_id',
  },
  subscribeInfoShortIds: {
    code: '-120003',
    message: '缺少参数_ids',
  },
  subscribeTypeNotFind: {
    code: '-120004',
    message: '找不到此订阅类型',
  },
  subscribeTypeIsNull: {
    code: '-120005',
    message: '订阅参数type为空',
  },
  invalidSearchParams: {
    code: '-120005',
    message: '非法的搜索参数',
  },
  auditFieldIsNotExist: {
    code: '-130001',
    message: '审核任务进行时，参数 {{field}} 为空',
  },
  auditInfoIsNotExist: {
    code: '-130002',
    message: '审核任务信息不存在',
  },
  auditRuleFieldIsNotExist: {
    code: '-130003',
    message: '审核授权进行时，参数 {{field}} 为空',
  },
  auditRuleWhitelistIsInvalid: {
    code: '-130004',
    message: '审核授权白名单参数格式不正确',
  },
  auditInfoCannotFind: {
    code: '-130005',
    message: '找不到审核信息',
  },
  companyHasNoSubscribeInfo: {
    code: '-140001',
    message: '您所在的公司没有签定订阅合同',
  },
  companySubscribeInfoUnused: {
    code: '-140002',
    message: '您所在的公司签定的订阅合同还没到开始使用时间',
  },
  companySubscribeInfoExpired: {
    code: '-140003',
    message: '您所在的公司签定的订阅合同已经过期了',
  },
  invalidSubscribeType: {
    code: '-140004',
    message: '非法的节目类型参数',
  },
  companySubscribeInfoNoSubscribeType: {
    code: '-140005',
    message: '您所在的公司签订的订阅合同没有订阅类型',
  },
  noSubscribeSearchConfig: {
    code: '-140006',
    message: '没有配置订阅搜索',
  },
  subscribeSearchConfigInvalidJson: {
    code: '-140007',
    message: '订阅搜索配置项json不正确',
  },
  noDownloadPath: {
    code: '-150001',
    message: '没有配置下载路径,请联系管理员配置',
  },
};
