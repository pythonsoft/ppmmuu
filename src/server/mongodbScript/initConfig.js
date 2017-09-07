
'use strict';

const ConfigGroup = require('../api/configuration/configurationGroupInfo');

const configGroup = new ConfigGroup();
const ConfigInfo = require('../api/configuration/configurationInfo');

const configInfo = new ConfigInfo();

const meidaCenterSearchSelects = [
  {
    key: 'program_type',
    label: '節目類型',
    items: [
      { value: '', label: '请选择' },
      { value: '宣傳', label: '宣傳' },
      { value: '廣告', label: '廣告' },
      { value: '採購', label: '採購' },
      { value: '包裝', label: '包裝' },
      { value: '自製', label: '自製' },
      { value: '墊播', label: '墊播' },
      { value: '素材', label: '素材' }
    ],
    selected: ''
  },
  {
    key: 'ccid',
    label: '編目類',
    items: [
      { value: '', label: '请选择' },
      { value: '視音頻類', label: '視音頻類' },
      { value: '片段子類', label: '片段子類' },
      { value: '場景子類', label: '場景子類' },
      { value: '片頭子類', label: '片頭子類' },
      { value: 'segment', label: 'segment' }
    ],
    selected: ''
  },
  {
    key: 'f_str_145',
    label: '新聞類型',
    items: [
      { value: '', label: '请选择' },
      { value: '鳳凰新聞', label: '鳳凰新聞' },
      { value: '美聯社外電', label: '美聯社外電' },
      { value: '路透社外電', label: '路透社外電' },
      { value: '香港台新聞', label: '香港台新聞' },
      { value: 'ATV', label: 'ATV' },
      { value: '自拍新聞', label: '自拍新聞' },
      { value: 'CCTV', label: 'CCTV' },
      { value: 'CNN', label: 'CNN' },
      { value: 'OCF', label: 'OCF' },
      { value: '特別節目Feed', label: '特別節目Feed' },
      { value: '台灣新聞', label: '台灣新聞' },
      { value: '墊底片', label: '墊底片' },
      { value: '香港新聞', label: '香港新聞' },
      { value: '大陸新聞', label: '大陸新聞' },
      { value: '資詢台新聞', label: '資詢台新聞' },
      { value: '全球', label: '全球' },
      { value: '資詢台十週年節目素材', label: '資詢台十週年節目素材' },
      { value: 'NowTV', label: 'NowTV' }
    ],
    selected: ''
  },
  {
    key: 'f_str_324',
    label: '事發國家',
    items: [
      { value: '', label: '请选择' },
      { value: '安哥拉', label: 'Angola AO安哥拉' },
      { value: '阿富汗', label: 'Afghanistan AF阿富汗' },
      { value: '阿爾巴尼亞', label: 'Albania AL阿爾巴尼亞' },
      { value: '阿爾及利亞', label: 'Algeria DZ阿爾及利亞' },
      { value: '安道爾共和國', label: 'Andorra AD安道爾共和國' },
      { value: '安圭拉島', label: 'Anguilla AI安圭拉島' },
      { value: '安提瓜和巴布達', label: 'Barbuda Antigua AG安提瓜和巴布達' },
      { value: '阿根廷', label: 'Argentina AR阿根廷' },
      { value: '亞美尼亞', label: 'Armenia AM亞美尼亞' },
      { value: '澳大利亞', label: 'Australia AU澳大利亞' },
      { value: '奧地利', label: 'Austria AT奧地利' },
      { value: '阿塞拜疆', label: 'Azerbaijan AZ阿塞拜疆' },
      { value: '巴哈馬', label: 'Bahamas BS巴哈馬' },
      { value: '巴林', label: 'Bahrain BH巴林' },
      { value: '孟加拉國', label: 'Bangladesh BD孟加拉國' },
      { value: '巴巴多斯', label: 'Barbados BB巴巴多斯' },
      { value: '白俄羅斯', label: 'Belarus BY白俄羅斯' },
      { value: '比利時', label: 'Belgium BE比利時' },
      { value: '伯利茲', label: 'Belize BZ伯利茲' },
      { value: '貝寧', label: 'Benin BJ貝寧' },
      { value: '百慕大群島', label: 'Bermuda Is BM百慕大群島' },
      { value: '玻利維亞', label: 'Bolivia BO玻利維亞' },
      { value: '博茨瓦納', label: 'Botswana BW博茨瓦納' },
      { value: '巴西', label: 'Brazil BR巴西' },
      { value: '文萊', label: 'Brunei BN文萊' },
      { value: '保加利亞', label: 'Bulgaria BG保加利亞' },
      { value: '布基納法索', label: 'Burkina-faso BF布基納法索' },
      { value: '緬甸', label: 'Burma MM緬甸' },
      { value: '布隆迪', label: 'Burundi BI布隆迪' },
      { value: '喀麥隆', label: 'Cameroon CM喀麥隆' },
      { value: '加拿大', label: 'Canada CA加拿大' },
      { value: '中非共和國', label: 'Central African Republic CF中非共和國' },
      { value: '乍得', label: 'Chad TD乍得' },
      { value: '智利', label: 'Chile CL智利' },
      { value: '中國', label: 'China CN中國' },
      { value: '哥倫比亞', label: 'Colombia CO哥倫比亞' },
      { value: '剛果', label: 'Congo CG剛果' },
      { value: '庫克群島', label: 'Cook Is. CK庫克群島' },
      { value: '哥斯達黎加', label: 'Costa Rica CR哥斯達黎加' },
      { value: '古巴', label: 'Cuba CU古巴' },
      { value: '塞浦路斯', label: 'Cyprus CY塞浦路斯' },
      { value: '捷克', label: 'Czech Republic CZ捷克' },
      { value: '丹麥', label: 'Denmark DK丹麥' },
      { value: '吉布提', label: 'Djibouti DJ吉布提' },
      { value: '多米尼加共和國', label: 'Dominica Rep. DO多米尼加共和國' },
      { value: '厄瓜多爾', label: 'Ecuador EC厄瓜多爾' },
      { value: '埃及', label: 'Egypt EG埃及' },
      { value: '薩爾瓦多', label: 'EI Salvador SV薩爾瓦多' },
      { value: '愛沙尼亞', label: 'Estonia EE愛沙尼亞' },
      { value: '埃塞俄比亞', label: 'Ethiopia ET埃塞俄比亞' },
      { value: '斐濟', label: 'Fiji FJ斐濟' },
      { value: '芬蘭', label: 'Finland FI芬蘭' },
      { value: '法國', label: 'France FR法國' },
      { value: '法屬圭亞那', label: 'French Guiana GF法屬圭亞那' },
      { value: '加蓬', label: 'Gabon GA加蓬' },
      { value: '岡比亞', label: 'Gambia GM岡比亞' },
      { value: '格魯吉亞', label: 'Georgia GE格魯吉亞' },
      { value: '德國', label: 'Germany DE德國' },
      { value: '加納', label: 'Ghana GH加納' },
      { value: '直布羅陀', label: 'Gibraltar GI直布羅陀' },
      { value: '希臘', label: 'Greece GR希臘' },
      { value: '格林納達', label: 'Grenada GD格林納達' },
      { value: '關島', label: 'Guam GU關島' },
      { value: '危地馬拉', label: 'Guatemala GT危地馬拉' },
      { value: '幾內亞', label: 'Guinea GN幾內亞' },
      { value: '圭亞那', label: 'Guyana GY圭亞那' },
      { value: '海地', label: 'Haiti HT海地' },
      { value: '洪都拉斯', label: 'Honduras HN洪都拉斯' },
      { value: '香港', label: 'Hongkong HK香港' },
      { value: '匈牙利', label: 'Hungary HU匈牙利' },
      { value: '冰島', label: 'Iceland IS冰島' },
      { value: '印度', label: 'India IN印度' },
      { value: '印度尼西亞', label: 'Indonesia ID印度尼西亞' },
      { value: '伊朗', label: 'Iran IR伊朗' },
      { value: '伊拉克', label: 'Iraq IQ伊拉克' },
      { value: '愛爾蘭', label: 'Ireland IE愛爾蘭' },
      { value: '以色列', label: 'Israel IL以色列' },
      { value: '意大利', label: 'Italy IT意大利' },
      { value: '牙買加', label: 'Jamaica JM牙買加' },
      { value: '日本', label: 'Japan JP日本' },
      { value: '約旦', label: 'Jordan JO約旦' },
      { value: '柬埔寨', label: 'Kampuchea (Cambodia ) KH柬埔寨' },
      { value: '哈薩克斯坦', label: 'Kazakstan KZ哈薩克斯坦' },
      { value: '肯尼亞', label: 'Kenya KE肯尼亞' },
      { value: '韓國', label: 'Korea KR韓國' },
      { value: '科威特', label: 'Kuwait KW科威特' },
      { value: '吉爾吉斯坦', label: 'Kyrgyzstan KG吉爾吉斯坦' },
      { value: '老撾', label: 'Laos LA老撾' },
      { value: '拉脫維亞', label: 'Latvia LV拉脫維亞' },
      { value: '黎巴嫩', label: 'Lebanon LB黎巴嫩' },
      { value: '萊索托', label: 'Lesotho LS萊索托' },
      { value: '利比里亞', label: 'Liberia LR利比里亞' },
      { value: '利比亞', label: 'Libya LY利比亞' },
      { value: '列支敦士登', label: 'Liechtenstein LI列支敦士登' },
      { value: '立陶宛', label: 'Lithuania LT立陶宛' },
      { value: '盧森堡', label: 'Luxembourg LU盧森堡' },
      { value: '澳門', label: 'Macao MO澳門' },
      { value: '馬達加斯加', label: 'Madagascar MG馬達加斯加' },
      { value: '馬拉維', label: 'Malawi MW馬拉維' },
      { value: '馬來西亞', label: 'Malaysia MY馬來西亞' },
      { value: '馬爾代夫', label: 'Maldives MV馬爾代夫' },
      { value: '馬里', label: 'Mali ML馬里' },
      { value: '馬耳他', label: 'Malta MT馬耳他' },
      { value: '毛里求斯', label: 'Mauritius MU毛里求斯' },
      { value: '墨西哥', label: 'Mexico MX墨西哥' },
      { value: '摩爾多瓦', label: 'Moldova MD摩爾多瓦' },
      { value: '摩納哥', label: 'Monaco MC摩納哥' },
      { value: '蒙古', label: 'Mongolia MN蒙古' },
      { value: '蒙特塞拉特島', label: 'Montserrat Is. MS蒙特塞拉特島' },
      { value: '摩洛哥', label: 'Morocco MA摩洛哥' },
      { value: '莫桑比克', label: 'Mozambique MZ莫桑比克' },
      { value: '納米比亞', label: 'Namibia NA納米比亞' },
      { value: '瑙魯', label: 'Nauru NR瑙魯' },
      { value: '尼泊爾', label: 'Nepal NP尼泊爾' },
      { value: '荷蘭', label: 'Netherlands NL荷蘭' },
      { value: '新西蘭', label: 'New Zealand NZ新西蘭' },
      { value: '尼加拉瓜', label: 'Nicaragua NI尼加拉瓜' },
      { value: '尼日爾', label: 'Niger NE尼日爾' },
      { value: '尼日利亞', label: 'Nigeria NG尼日利亞' },
      { value: '朝鮮', label: 'North Korea KP朝鮮' },
      { value: '挪威', label: 'Norway NO挪威' },
      { value: '阿曼', label: 'Oman OM阿曼' },
      { value: '巴基斯坦', label: 'Pakistan PK巴基斯坦' },
      { value: '巴拿馬', label: 'Panama PA巴拿馬' },
      { value: '巴布亞新幾內亞', label: 'Papua New Cuinea PG巴布亞新幾內亞' },
      { value: '巴拉圭', label: 'Paraguay PY巴拉圭' },
      { value: '秘魯', label: 'Peru PE秘魯' },
      { value: '菲律賓', label: 'Philippines PH菲律賓' },
      { value: '波蘭', label: 'Poland PL波蘭' },
      { value: '法屬玻利尼西亞', label: 'French Polynesia PF法屬玻利尼西亞' },
      { value: '葡萄牙', label: 'Portugal PT葡萄牙' },
      { value: '波多黎各', label: 'Puerto Rico PR波多黎各' },
      { value: '卡塔爾', label: 'Qatar QA卡塔爾' },
      { value: '羅馬尼亞', label: 'Romania RO羅馬尼亞' },
      { value: '俄羅斯', label: 'Russia RU俄羅斯' },
      { value: '聖盧西亞', label: 'Saint Lueia LC聖盧西亞' },
      { value: '聖文森特島', label: 'Saint Vincent VC聖文森特島' },
      { value: '聖馬力諾', label: 'San Marino SM聖馬力諾' },
      { value: '聖多美和普林西比', label: 'Sao Tome and Principe ST聖多美和普林西比' },
      { value: '沙特阿拉伯', label: 'Saudi Arabia SA沙特阿拉伯' },
      { value: '塞內加爾', label: 'Senegal SN塞內加爾' },
      { value: '塞舌爾', label: 'Seychelles SC塞舌爾' },
      { value: '塞拉利昂', label: 'Sierra Leone SL塞拉利昂' },
      { value: '新加坡', label: 'Singapore SG新加坡' },
      { value: '斯洛伐克', label: 'Slovakia SK斯洛伐克' },
      { value: '斯洛文尼亞', label: 'Slovenia SI斯洛文尼亞' },
      { value: '所羅門群島', label: 'Solomon Is. SB所羅門群島' },
      { value: '索馬里', label: 'Somali SO索馬里' },
      { value: '南非', label: 'South Africa ZA南非' },
      { value: '西班牙', label: 'Spain ES西班牙' },
      { value: '斯里蘭卡', label: 'Sri Lanka LK斯里蘭卡' },
      { value: '蘇丹', label: 'Sudan SD蘇丹' },
      { value: '蘇里南', label: 'Suriname SR蘇里南' },
      { value: '斯威士蘭', label: 'Swaziland SZ斯威士蘭' },
      { value: '瑞典', label: 'Sweden SE瑞典' },
      { value: '瑞士', label: 'Switzerland CH瑞士' },
      { value: '敘利亞', label: 'Syria SY敘利亞' },
      { value: '台灣', label: 'Taiwan TW台灣' },
      { value: '塔吉克斯坦', label: 'Tajikstan TJ塔吉克斯坦' },
      { value: '坦桑尼亞', label: 'Tanzania TZ坦桑尼亞' },
      { value: '泰國', label: 'Thailand TH泰國' },
      { value: '多哥', label: 'Togo TG多哥' },
      { value: '湯加', label: 'Tonga TO湯加' },
      { value: '特立尼達和多巴哥', label: 'Trinidad and Tobago TT特立尼達和多巴哥' },
      { value: '突尼斯', label: 'Tunisia TN突尼斯' },
      { value: '土耳其', label: 'Turkey TR土耳其' },
      { value: '土庫曼斯坦', label: 'Turkmenistan TM土庫曼斯坦' },
      { value: '烏干達', label: 'Uganda UG烏干達' },
      { value: '烏克蘭', label: 'Ukraine UA烏克蘭' },
      { value: '阿拉伯聯合酋長國', label: 'United Arab Emirates AE阿拉伯聯合酋長國' },
      { value: '英國', label: 'United Kiongdom GB英國' },
      { value: '美國', label: 'United States of America US美國' },
      { value: '烏拉圭', label: 'Uruguay UY烏拉圭' },
      { value: '烏茲別克斯坦', label: 'Uzbekistan UZ烏茲別克斯坦' },
      { value: '委內瑞拉', label: 'Venezuela VE委內瑞拉' },
      { value: '越南', label: 'Vietnam VN越南' },
      { value: '也門', label: 'Yemen YE也門' },
      { value: '南斯拉夫', label: 'Yugoslavia YU南斯拉夫' },
      { value: '津巴布韋', label: 'Zimbabwe ZW津巴布韋' },
      { value: '扎伊爾', label: 'Zaire ZR扎伊爾' },
      { value: '贊比亞', label: 'Zambia ZM贊比亞' }
    ],
    selected: ''
  },
  {
    key: 'f_str_323',
    label: '版本',
    items: [
      { value: '', label: '请选择' },
      { value: '播出版', label: '播出版' },
      { value: '素材版', label: '素材版' },
      { value: '配音字幕版', label: '配音字幕版' },
      { value: '字幕分離播出版', label: '字幕分離播出版' },
      { value: '字幕分離母版', label: '字幕分離母版' },
      { value: '字幕版', label: '字幕版' },
      { value: '母版', label: '母版' },
      { value: '剪輯版', label: '剪輯版' },
      { value: '國際版', label: '國際版' },
      { value: '拷貝板', label: '拷貝板' },
      { value: '播放前版', label: '播放前版' },
      { value: '參展版', label: '參展版' }
    ],
    selected: ''
  },
  {
    key: 'f_str_223',
    label: '製作地點',
    items: [
      { value: '', label: '请选择' },
      { value: '北京', label: '北京' },
      { value: '深圳', label: '深圳' },
      { value: '香港', label: '香港' },
      { value: '台北', label: '台北' },
      { value: '上海', label: '上海' },
      { value: 'NIL', label: 'NIL' }
    ],
    selected: ''
  },
  {
    key: 'f_str_314',
    label: '資源所屬部門',
    items: [
      { value: '', label: '请选择' },
      { value: '節目資料管理部', label: '節目資料管理部' },
      { value: '鏡面宣傳部', label: '鏡面宣傳部' },
      { value: '頻道編輯部', label: '頻道編輯部' },
      { value: '共享資源', label: '共享資源' },
      { value: '中文台專題主編組', label: '中文台專題主編組' },
      { value: '中文台專題製作組', label: '中文台專題製作組' },
      { value: '中文台娛樂製作組', label: '中文台娛樂製作組' },
      { value: '中文台時尚製作組', label: '中文台時尚製作組' },
      { value: '中文台時尚主編組', label: '中文台時尚主編組' },
      { value: '節目購銷部', label: '節目購銷部' },
      { value: '影帶管理部', label: '影帶管理部' }
    ],
    selected: ''
  }
];

const mediaCenterSearchRadios = [
  {
    key: 'hd_flag',
    label: '高標清',
    items: [
      { value: '', label: '全部' },
      { value: 1, label: '高清' },
      { value: 0, label: '標清' }
    ],
    selected: ''
  },
  {
    key: 'f_str_067',
    label: '是否歸檔',
    items: [
      { value: '', label: '全部' },
      { value: '是', label: '是' },
      { value: '否', label: '否' }
    ],
    selected: ''
  }
];

configGroup.collection.findOne({ name: '新版媒体库搜索配置' }, { fields: { name: 1 } }, (err, doc) => {
  if (err) {
    console.log(err);
    return false;
  }

  if (doc) {
    console.log('init config info success!');
    return false;
  }

  configGroup.insertOne({ name: '新版媒体库搜索配置' }, (err) => {
    if (err) {
      console.log(err);
    }

    configGroup.collection.findOne({ name: '新版媒体库搜索配置' }, (err, doc) => {
      if (err) {
        console.log(err);
      }

      if (!doc) {
        console.log('没有创建媒体库搜索配置组');
      } else {
        const genre = doc._id;
        const info = [
          {
            key: 'meidaCenterSearchSelects',
            value: JSON.stringify(meidaCenterSearchSelects),
            description: '',
            genre,
          },
          {
            key: 'mediaCenterSearchRadios',
            value: JSON.stringify(mediaCenterSearchRadios),
            description: '',
            genre,
          },
        ];
        configInfo.insertMany(info, (err) => {
          if (err) {
            throw new Error(`创建媒体库搜索配置出错:${err.message}`);
          }
          return true;
        });
      }
    });
  });
});

