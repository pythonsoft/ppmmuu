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
    message: '参数_id为空',
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
  noAccess: {
    code: '-4001',
    message: '无权访问此接口',
  },
  databaseError: {
    code: '-1',
    message: '数据库异常.',
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
    code: '-9011',
    message: '策略类型不存在',
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
    code: '-300023',
    message: '子任务ID不存在',
  },
};