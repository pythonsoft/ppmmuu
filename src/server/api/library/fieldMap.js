'use strict';

const fieldMap = {};
fieldMap.catalogInfoMap = {
  _id: 'id',
  root: 'rootid',
  fromWhere: 'from_where',
  fullText: 'full_text',
  inpoint: 'inpoint',
  outpoint: 'outpoint',
  duration: 'duration',
  type: 'program_type',
  name: 'name',
  englishName: 'program_name_en',
  chineseName: 'program_name_cn',
  keyword: 'keyword',
  content: 'content',
  source: 'source',
  version: 'versions',
  keyman: 'keyman',
  language: 'language',
  available: 'publish_status',
  owner: 'owner',
  createdTime: 'created',
  lastModifyTime: 'last_modify',
  publishTime: 'publish_time',
  ccid: 'ccid',
  newsTime: 'news_data',
  airTime: 'airdata',
  newsType: 'news_type',
  occurCountry: 'occur_country',
  madeLocation: 'production_site',
  resourceDepartment: 'resource_location',
  hdFlag: 'hd_flag',
  pigeonhole: 'pigeonhole',
};

fieldMap.translateFields = {
  objectId: {
    cn: '',
  },
  englishName: {
    cn: '英文名',
  },
  chineseName: {
    cn: '中文名',
  },
  keyword: {
    cn: '关键字',
  },
  content: {
    cn: '内容',
  },
  source: {
    cn: '来源',
  },
  version: {
    cn: '版本',
  },
  keyman: {
    cn: '关键人物',
  },
  language: {
    cn: '语言',
  },
  root: {
    cn: '根节点',
  },
  type: {
    cn: '节目类型',
  },
  inpoint: {
    cn: '入点',
  },
  outpoint: {
    cn: '出点',
  },
  duration: {
    cn: '时长',
  },
  materialDate: {
    cn: '素材日期',
  },
  owner: {
    cn: '编目者',
  },
  createdTime: {
    cn: '创建时间',
  },
  lastModifyTime: {
    cn: '修改时间',
  },
  fromWhere: {
    cn: '入库来源',
  },
  publishTime: {
    cn: '发布时间',
  },
  ccid: {
    cn: '编目类',
  },
  newsTime: {
    cn: '新闻日期',
  },
  airTime: {
    cn: '首播日期',
  },
  newsType: {
    cn: '新闻类型',
  },
  occurCountry: {
    cn: '事发国家',
  },
  madeLocation: {
    cn: '制作地点',
  },
  resourceDepartment: {
    cn: '资源所属部门',
  },
  hdFlag: {
    cn: '高标清',
  },
  pigeonhole: {
    cn: '是否归档',
  },
};
module.exports = fieldMap;

