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
  name: {
    cn: '節目名稱',
  },
  englishName: {
    cn: '英文名',
  },
  chineseName: {
    cn: '中文名',
  },
  keyword: {
    cn: '關鍵字',
  },
  content: {
    cn: '內容',
  },
  source: {
    cn: '來源',
  },
  version: {
    cn: '版本',
  },
  keyman: {
    cn: '關鍵人物',
  },
  language: {
    cn: '語言',
  },
  root: {
    cn: '根節點',
  },
  type: {
    cn: '節目類型',
  },
  inpoint: {
    cn: '入點',
  },
  outpoint: {
    cn: '出點',
  },
  duration: {
    cn: '時長',
  },
  materialDate: {
    cn: '素材日期',
    format(v) {
      if (v && v.from && v.to) {
        return `${v.from}-${v.to}`;
      } else if (v && v.from) {
        return v.from;
      } else if (v && v.to) {
        return v.to;
      }
      return '';
    },
  },
  owner: {
    cn: '編目者',
    format(v) {
      if (v && v.name) {
        return v.name;
      }
      return '';
    },
  },
  createdTime: {
    cn: '創建時間',
  },
  lastModifyTime: {
    cn: '修改時間',
  },
  fromWhere: {
    cn: '入庫來源',
  },
  publishTime: {
    cn: '發佈時間',
  },
  ccid: {
    cn: '編目類',
  },
  newsTime: {
    cn: '新聞日期',
  },
  airTime: {
    cn: '首播日期',
  },
  newsType: {
    cn: '新聞類型',
  },
  occurCountry: {
    cn: '事發國家',
  },
  madeLocation: {
    cn: '製作地點',
  },
  resourceDepartment: {
    cn: '資源所屬部門',
  },
  hdFlag: {
    cn: '高標清',
  },
  pigeonhole: {
    cn: '是否歸檔',
  },
};
module.exports = fieldMap;

