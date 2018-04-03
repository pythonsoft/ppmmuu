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
      { value: '宣傳', label: '宣傳' },
      { value: '廣告', label: '廣告' },
      { value: '採購', label: '採購' },
      { value: '包裝', label: '包裝' },
      { value: '自製', label: '自製' },
      { value: '墊播', label: '墊播' },
      { value: '素材', label: '素材' },
    ],
    selected: ['廣告'],
    show: true,
  },
  {
    key: 'ccid',
    label: '編目類',
    items: [
      { value: '視音頻類', label: '視音頻類' },
      { value: '片段子類', label: '片段子類' },
      { value: '場景子類', label: '場景子類' },
      { value: '片頭子類', label: '片頭子類' },
      { value: 'segment', label: 'segment' },
    ],
    selected: [],
    show: true,
  },
  {
    key: 'resource_location',
    label: '資源所屬部門',
    items: [
      { value: '節目資料管理部', label: '節目資料管理部' },
      { value: '鏡面宣傳部', label: '鏡面宣傳部' },
      { value: '頻道編播部', label: '頻道編播部' },
      { value: '共享資源', label: '共享資源' },
      { value: '中文台專題主編組', label: '中文台專題主編組' },
      { value: '中文台專題製作組', label: '中文台專題製作組' },
      { value: '中文台娛樂製作組', label: '中文台娛樂製作組' },
      { value: '中文台時尚製作組', label: '中文台時尚製作組' },
      { value: '中文台時尚主編組', label: '中文台時尚主編組' },
      { value: '節目購銷部', label: '節目購銷部' },
      { value: '影帶管理部', label: '影帶管理部' },
    ],
    selected: [],
    show: true,
  },
  {
    key: 'news_type',
    label: '新聞類型',
    items: [
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
      { value: '資訊台新聞', label: '資訊台新聞' },
      { value: '全球', label: '全球' },
      { value: '資訊台十週年節目素材', label: '資訊台十週年節目素材' },
      { value: 'NowTV', label: 'NowTV' },
    ],
    selected: [],
    show: false,
  },
  {
    key: 'occur_country',
    label: '事發地区',
    items: [
      { value: '安哥拉 Angola AO', label: 'Angola AO安哥拉' },
      { value: '阿富汗 Afghanistan AF', label: 'Afghanistan AF阿富汗' },
      { value: '阿爾巴尼亞 Albania AL', label: 'Albania AL阿爾巴尼亞' },
      { value: '阿爾及利亞 Algeria DZ', label: 'Algeria DZ阿爾及利亞' },
      { value: '安道爾共和國 Andorra AD', label: 'Andorra AD安道爾共和國' },
      { value: '安圭拉島 Anguilla AI', label: 'Anguilla AI安圭拉島' },
      { value: '安提瓜和巴布達 Barbuda Antigua AG', label: 'Barbuda Antigua AG安提瓜和巴布達' },
      { value: '阿根廷 Argentina AR', label: 'Argentina AR阿根廷' },
      { value: '亞美尼亞 Armenia AM', label: 'Armenia AM亞美尼亞' },
      { value: '澳大利亞 Australia AU', label: 'Australia AU澳大利亞' },
      { value: '奧地利 Austria AT', label: 'Austria AT奧地利' },
      { value: '阿塞拜疆 Azerbaijan AZ', label: 'Azerbaijan AZ阿塞拜疆' },
      { value: '巴哈馬 Bahamas BS', label: 'Bahamas BS巴哈馬' },
      { value: '巴林 Bahrain BH', label: 'Bahrain BH巴林' },
      { value: '孟加拉國 Bangladesh BD', label: 'Bangladesh BD孟加拉國' },
      { value: '巴巴多斯 Barbados BB', label: 'Barbados BB巴巴多斯' },
      { value: '白俄羅斯 Belarus BY', label: 'Belarus BY白俄羅斯' },
      { value: '比利時 Belgium BE', label: 'Belgium BE比利時' },
      { value: '伯利茲 Belize BZ', label: 'Belize BZ伯利茲' },
      { value: '貝寧 Benin BJ', label: 'Benin BJ貝寧' },
      { value: '百慕大群島 Bermuda Is BM', label: 'Bermuda Is BM百慕大群島' },
      { value: '玻利維亞 Bolivia BO', label: 'Bolivia BO玻利維亞' },
      { value: '博茨瓦納 Botswana BW', label: 'Botswana BW博茨瓦納' },
      { value: '巴西 Brazil BR', label: 'Brazil BR巴西' },
      { value: '文萊 Brunei BN', label: 'Brunei BN文萊' },
      { value: '保加利亞 Bulgaria BG', label: 'Bulgaria BG保加利亞' },
      { value: '布基納法索 Burkina-faso BF', label: 'Burkina-faso BF布基納法索' },
      { value: '緬甸 Burma MM', label: 'Burma MM緬甸' },
      { value: '布隆迪 Burundi BI', label: 'Burundi BI布隆迪' },
      { value: '喀麥隆 Cameroon CM', label: 'Cameroon CM喀麥隆' },
      { value: '加拿大 Canada CA', label: 'Canada CA加拿大' },
      { value: '中非共和國 Central African Republic CF', label: 'Central African Republic CF中非共和國' },
      { value: '乍得 Chad TD', label: 'Chad TD乍得' },
      { value: '智利 Chile CL', label: 'Chile CL智利' },
      { value: '中國 China CN', label: 'China CN中國' },
      { value: '哥倫比亞 Colombia CO', label: 'Colombia CO哥倫比亞' },
      { value: '剛果 Congo CG', label: 'Congo CG剛果' },
      { value: '庫克群島 Cook Is. CK', label: 'Cook Is. CK庫克群島' },
      { value: '哥斯達黎加 Costa Rica CR', label: 'Costa Rica CR哥斯達黎加' },
      { value: '古巴 Cuba CU', label: 'Cuba CU古巴' },
      { value: '塞浦路斯 Cyprus CY', label: 'Cyprus CY塞浦路斯' },
      { value: '捷克 Czech Republic CZ', label: 'Czech Republic CZ捷克' },
      { value: '丹麥 Denmark DK', label: 'Denmark DK丹麥' },
      { value: '吉布提 Djibouti DJ', label: 'Djibouti DJ吉布提' },
      { value: '多米尼加共和國 Dominica Rep. DO', label: 'Dominica Rep. DO多米尼加共和國' },
      { value: '厄瓜多爾 Ecuador EC', label: 'Ecuador EC厄瓜多爾' },
      { value: '埃及 Egypt EG', label: 'Egypt EG埃及' },
      { value: '薩爾瓦多 EI Salvador SV', label: 'EI Salvador SV薩爾瓦多' },
      { value: '愛沙尼亞 Estonia EE', label: 'Estonia EE愛沙尼亞' },
      { value: '埃塞俄比亞 Ethiopia ET', label: 'Ethiopia ET埃塞俄比亞' },
      { value: '斐濟 Fiji FJ', label: 'Fiji FJ斐濟' },
      { value: '芬蘭 Finland FI', label: 'Finland FI芬蘭' },
      { value: '法國 France FR', label: 'France FR法國' },
      { value: '法屬圭亞那 French Guiana GF', label: 'French Guiana GF法屬圭亞那' },
      { value: '加蓬 Gabon GA', label: 'Gabon GA加蓬' },
      { value: '岡比亞 Gambia GM', label: 'Gambia GM岡比亞' },
      { value: '格魯吉亞 Georgia GE', label: 'Georgia GE格魯吉亞' },
      { value: '德國 Germany DE', label: 'Germany DE德國' },
      { value: '加納 Ghana GH', label: 'Ghana GH加納' },
      { value: '直布羅陀 Gibraltar GI', label: 'Gibraltar GI直布羅陀' },
      { value: '希臘 Greece GR', label: 'Greece GR希臘' },
      { value: '格林納達 Grenada GD', label: 'Grenada GD格林納達' },
      { value: '關島 Guam GU', label: 'Guam GU關島' },
      { value: '危地馬拉 Guatemala GT', label: 'Guatemala GT危地馬拉' },
      { value: '幾內亞 Guinea GN', label: 'Guinea GN幾內亞' },
      { value: '圭亞那 Guyana GY', label: 'Guyana GY圭亞那' },
      { value: '海地 Haiti HT', label: 'Haiti HT海地' },
      { value: '洪都拉斯 Honduras HN', label: 'Honduras HN洪都拉斯' },
      { value: '香港 Hongkong HK', label: 'Hongkong HK香港' },
      { value: '匈牙利 Hungary HU', label: 'Hungary HU匈牙利' },
      { value: '冰島 Iceland IS', label: 'Iceland IS冰島' },
      { value: '印度 India IN', label: 'India IN印度' },
      { value: '印度尼西亞 Indonesia ID', label: 'Indonesia ID印度尼西亞' },
      { value: '伊朗 Iran IR', label: 'Iran IR伊朗' },
      { value: '伊拉克 Iraq IQ', label: 'Iraq IQ伊拉克' },
      { value: '愛爾蘭 Ireland IE', label: 'Ireland IE愛爾蘭' },
      { value: '以色列 Israel IL', label: 'Israel IL以色列' },
      { value: '意大利 Italy IT', label: 'Italy IT意大利' },
      { value: '牙買加 Jamaica JM', label: 'Jamaica JM牙買加' },
      { value: '日本 Japan JP', label: 'Japan JP日本' },
      { value: '約旦 Jordan JO', label: 'Jordan JO約旦' },
      { value: '柬埔寨 Kampuchea (Cambodia ) KH', label: 'Kampuchea (Cambodia ) KH柬埔寨' },
      { value: '哈薩克斯坦 Kazakstan KZ', label: 'Kazakstan KZ哈薩克斯坦' },
      { value: '肯尼亞 Kenya KE', label: 'Kenya KE肯尼亞' },
      { value: '韓國 Korea KR', label: 'Korea KR韓國' },
      { value: '科威特 Kuwait KW', label: 'Kuwait KW科威特' },
      { value: '吉爾吉斯坦 Kyrgyzstan KG', label: 'Kyrgyzstan KG吉爾吉斯坦' },
      { value: '老撾 Laos LA', label: 'Laos LA老撾' },
      { value: '拉脫維亞 Latvia LV', label: 'Latvia LV拉脫維亞' },
      { value: '黎巴嫩 Lebanon LB', label: 'Lebanon LB黎巴嫩' },
      { value: '萊索托 Lesotho LS', label: 'Lesotho LS萊索托' },
      { value: '利比里亞 Liberia LR', label: 'Liberia LR利比里亞' },
      { value: '利比亞 Libya LY', label: 'Libya LY利比亞' },
      { value: '列支敦士登 Liechtenstein LI', label: 'Liechtenstein LI列支敦士登' },
      { value: '立陶宛 Lithuania LT', label: 'Lithuania LT立陶宛' },
      { value: '盧森堡 Luxembourg LU', label: 'Luxembourg LU盧森堡' },
      { value: '澳門 Macao MO', label: 'Macao MO澳門' },
      { value: '馬達加斯加 Madagascar MG', label: 'Madagascar MG馬達加斯加' },
      { value: '馬拉維 Malawi MW', label: 'Malawi MW馬拉維' },
      { value: '馬來西亞 Malaysia MY', label: 'Malaysia MY馬來西亞' },
      { value: '馬爾代夫 Maldives MV', label: 'Maldives MV馬爾代夫' },
      { value: '馬里 Mali ML', label: 'Mali ML馬里' },
      { value: '馬耳他 Malta MT', label: 'Malta MT馬耳他' },
      { value: '毛里求斯 Mauritius MU', label: 'Mauritius MU毛里求斯' },
      { value: '墨西哥 Mexico MX', label: 'Mexico MX墨西哥' },
      { value: '摩爾多瓦 Moldova MD', label: 'Moldova MD摩爾多瓦' },
      { value: '摩納哥 Monaco MC', label: 'Monaco MC摩納哥' },
      { value: '蒙古 Mongolia MN', label: 'Mongolia MN蒙古' },
      { value: '蒙特塞拉特島 Montserrat Is. MS', label: 'Montserrat Is. MS蒙特塞拉特島' },
      { value: '摩洛哥 Morocco MA', label: 'Morocco MA摩洛哥' },
      { value: '莫桑比克 Mozambique MZ', label: 'Mozambique MZ莫桑比克' },
      { value: '納米比亞 Namibia NA', label: 'Namibia NA納米比亞' },
      { value: '瑙魯 Nauru NR', label: 'Nauru NR瑙魯' },
      { value: '尼泊爾 Nepal NP', label: 'Nepal NP尼泊爾' },
      { value: '荷蘭 Netherlands NL', label: 'Netherlands NL荷蘭' },
      { value: '新西蘭 New Zealand NZ', label: 'New Zealand NZ新西蘭' },
      { value: '尼加拉瓜 Nicaragua NI', label: 'Nicaragua NI尼加拉瓜' },
      { value: '尼日爾 Niger NE', label: 'Niger NE尼日爾' },
      { value: '尼日利亞 Nigeria NG', label: 'Nigeria NG尼日利亞' },
      { value: '朝鮮 North Korea KP', label: 'North Korea KP朝鮮' },
      { value: '挪威 Norway NO', label: 'Norway NO挪威' },
      { value: '阿曼 Oman OM', label: 'Oman OM阿曼' },
      { value: '巴基斯坦 Pakistan PK', label: 'Pakistan PK巴基斯坦' },
      { value: '巴拿馬 Panama PA', label: 'Panama PA巴拿馬' },
      { value: '巴布亞新幾內亞 Papua New Cuinea', label: 'Papua New Cuinea PG巴布亞新幾內亞' },
      { value: '巴拉圭 Paraguay PY', label: 'Paraguay PY巴拉圭' },
      { value: '秘魯 Peru PE', label: 'Peru PE秘魯' },
      { value: '菲律賓 Philippines PH', label: 'Philippines PH菲律賓' },
      { value: '波蘭 Poland PL', label: 'Poland PL波蘭' },
      { value: '法屬玻利尼西亞 French Polynesia PF', label: 'French Polynesia PF法屬玻利尼西亞' },
      { value: '葡萄牙 Portugal PT', label: 'Portugal PT葡萄牙' },
      { value: '波多黎各 Puerto Rico PR', label: 'Puerto Rico PR波多黎各' },
      { value: '卡塔爾 Qatar QA', label: 'Qatar QA卡塔爾' },
      { value: '羅馬尼亞 Romania RO', label: 'Romania RO羅馬尼亞' },
      { value: '俄羅斯 Russia RU', label: 'Russia RU俄羅斯' },
      { value: '聖盧西亞 Saint Lueia LC', label: 'Saint Lueia LC聖盧西亞' },
      { value: '聖文森特島 Saint Vincent VC', label: 'Saint Vincent VC聖文森特島' },
      { value: '聖馬力諾 San Marino SM', label: 'San Marino SM聖馬力諾' },
      { value: '聖多美和普林西比 Sao Tome and Principe ST', label: 'Sao Tome and Principe ST聖多美和普林西比' },
      { value: '沙特阿拉伯 Saudi Arabia SA', label: 'Saudi Arabia SA沙特阿拉伯' },
      { value: '塞內加爾 Senegal SN', label: 'Senegal SN塞內加爾' },
      { value: '塞舌爾 Seychelles SC', label: 'Seychelles SC塞舌爾' },
      { value: '塞拉利昂 Sierra Leone SL', label: 'Sierra Leone SL塞拉利昂' },
      { value: '新加坡 Singapore SG', label: 'Singapore SG新加坡' },
      { value: '斯洛伐克 Slovakia SK', label: 'Slovakia SK斯洛伐克' },
      { value: '斯洛文尼亞 Slovenia SI', label: 'Slovenia SI斯洛文尼亞' },
      { value: '所羅門群島 Solomon Is. SB', label: 'Solomon Is. SB所羅門群島' },
      { value: '索馬里 Somali SO', label: 'Somali SO索馬里' },
      { value: '南非 South Africa ZA', label: 'South Africa ZA南非' },
      { value: '西班牙 Spain ES', label: 'Spain ES西班牙' },
      { value: '斯里蘭卡 Sri Lanka LK', label: 'Sri Lanka LK斯里蘭卡' },
      { value: '蘇丹 Sudan SD', label: 'Sudan SD蘇丹' },
      { value: '蘇里南 Suriname SR', label: 'Suriname SR蘇里南' },
      { value: '斯威士蘭 Swaziland SZ', label: 'Swaziland SZ斯威士蘭' },
      { value: '瑞典 Sweden SE', label: 'Sweden SE瑞典' },
      { value: '瑞士 Switzerland CH', label: 'Switzerland CH瑞士' },
      { value: '敘利亞 Syria SY', label: 'Syria SY敘利亞' },
      { value: '台灣 Taiwan TW', label: 'Taiwan TW台灣' },
      { value: '塔吉克斯坦 Tajikstan TJ', label: 'Tajikstan TJ塔吉克斯坦' },
      { value: '坦桑尼亞 Tanzania TZ', label: 'Tanzania TZ坦桑尼亞' },
      { value: '泰國 Thailand TH', label: 'Thailand TH泰國' },
      { value: '多哥 Togo TG', label: 'Togo TG多哥' },
      { value: '湯加 Tonga TO', label: 'Tonga TO湯加' },
      { value: '特立尼達和多巴哥 Trinidad and Tobago TT', label: 'Trinidad and Tobago TT特立尼達和多巴哥' },
      { value: '突尼斯 Tunisia TN', label: 'Tunisia TN突尼斯' },
      { value: '土耳其 Turkey TR', label: 'Turkey TR土耳其' },
      { value: '土庫曼斯坦 Turkmenistan TM', label: 'Turkmenistan TM土庫曼斯坦' },
      { value: '烏干達 Uganda UG', label: 'Uganda UG烏干達' },
      { value: '烏克蘭 Ukraine UA', label: 'Ukraine UA烏克蘭' },
      { value: '阿拉伯聯合酋長國 United Arab Emirates AE', label: 'United Arab Emirates AE阿拉伯聯合酋長國' },
      { value: '英國 United Kiongdom GB', label: 'United Kiongdom GB英國' },
      { value: '美國 United States of America US', label: 'United States of America US美國' },
      { value: '烏拉圭 Uruguay UY', label: 'Uruguay UY烏拉圭' },
      { value: '烏茲別克斯坦 Uzbekistan UZ', label: 'Uzbekistan UZ烏茲別克斯坦' },
      { value: '委內瑞拉 Venezuela VE', label: 'Venezuela VE委內瑞拉' },
      { value: '越南 Vietnam VN', label: 'Vietnam VN越南' },
      { value: '也門 Yemen YE', label: 'Yemen YE也門' },
      { value: '南斯拉夫 Yugoslavia YU', label: 'Yugoslavia YU南斯拉夫' },
      { value: '津巴布韋 Zimbabwe ZW', label: 'Zimbabwe ZW津巴布韋' },
      { value: '扎伊爾 Zaire ZR', label: 'Zaire ZR扎伊爾' },
      { value: '贊比亞 Zambia ZM', label: 'Zambia ZM贊比亞' },
    ],
    selected: [],
    show: false,
  },
  {
    key: 'versions',
    label: '版本',
    items: [
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
      { value: '參展版', label: '參展版' },
    ],
    selected: [],
    show: false,
  },
  {
    key: 'production_site',
    label: '製作地點',
    items: [
      { value: '北京', label: '北京' },
      { value: '深圳', label: '深圳' },
      { value: '香港', label: '香港' },
      { value: '台北', label: '台北' },
      { value: '上海', label: '上海' },
      { value: 'NIL', label: 'NIL' },
    ],
    selected: [],
    show: false,
  },
];

const mediaCenterSearchRadios = [
  {
    key: 'hd_flag',
    label: '高標清',
    items: [
      { value: 'all', label: '全部' },
      { value: 1, label: '高清' },
      { value: 0, label: '標清' },
    ],
    selected: 1,
    show: true,
  },
  {
    key: 'pigeonhole',
    label: '是否歸檔',
    items: [
      { value: 'all', label: '全部' },
      { value: '是', label: '是' },
      { value: '否', label: '否' },
    ],
    selected: '是',
    show: true,
  },
];

const subscribeConfig = [
  {
    key: 'subscribeType',
    label: '订阅类型',
    items: [
    ],
    selected: '',
    multiple: true,
    type: 'string',
    example: ['体育1', '娱乐1'],
    defaultValue: '',
  },
  {
    key: 'duration',
    label: '时长',
    items: [
      { value: { gte: 0, lt: 6000 }, label: '短片(4分钟以下)' },
      { value: { gte: 30000 }, label: '长片(20分钟以上)' },
    ],
    selected: '',
    multiple: false,
    type: 'string',
    example: '',
    defaultValue: '',
  },
  {
    key: 'sort',
    label: '排序依据',
    items: [
      { value: 'should', label: '相关程度' },
      { value: { 'editorInfo.airTime': { order: 'desc' } }, label: '播出时间由近到远' },
      { value: { 'editorInfo.airTime': { order: 'asc' } }, label: '播出时间由远到近' },
      { value: { lastModifyTime: { order: 'desc' } }, label: '上架时间由近到远' },
      { value: { lastModifyTime: { order: 'asc' } }, label: '上架时间由远到近' },
    ],
    selected: '',
    multiple: false,
    type: 'string',
    example: '',
    defaultValue: 'should',
  },
  {
    key: 'airTime',
    label: '播出时间',
    selected: [],
    multiple: false,
    type: 'daterange',
    example: { gte: '2017-10-16T08:52:17.200Z', lt: '2017-10-17T08:52:17.200Z' },
    defaultValue: '',
  },
  {
    key: 'lastModifyTime',
    label: '上架时间',
    selected: [],
    multiple: false,
    type: 'daterange',
    example: { gte: '2017-10-16T08:52:17.200Z', lt: '2017-10-17T08:52:17.200Z' },
    defaultValue: '',
  },
];


const assistTags = [
  {
    key: 'tags',
    label: '标签',
    items: [
      { value: '1', label: '口播' },
      { value: '2', label: '正文' },
      { value: '3', label: '同声期' },
      { value: '4', label: '现场配音' },
      { value: '5', label: '字幕' },
      { value: '6', label: '备注' },
    ],
    selected: [],
  },
];

const manuscriptTags = [
  {
    key: 'tags',
    label: '标签',
    type: 'label',
    items: [
      { value: '1', label: '口播' },
      { value: '2', label: '正文' },
      { value: '3', label: '同声期' },
      { value: '4', label: '现场配音' },
      { value: '5', label: '字幕' },
      { value: '6', label: '备注' },
    ],
    selected: [],
    multiple: true,
  },
];

const manuscriptSubmit = [
  {
    key: 'important',
    label: '重要性',
    type: 'label',
    items: [
      { value: '1', label: '高' },
      { value: '2', label: '普通' },
      { value: '3', label: '紧急稿件' },
    ],
    selected: '1',
    multiple: false,
  },
  {
    key: 'type',
    label: '稿件类别',
    type: 'select',
    items: [
      { value: '1', label: 'SOT' },
      { value: '2', label: 'LVO' },
      { value: '3', label: 'T+B' },
      { value: '4', label: 'SOT成片' },
      { value: '5', label: '垫底片' },
      { value: '6', label: '干稿+圆' },
      { value: '7', label: '干稿' },
      { value: '8', label: 'SB+LVO' },
      { value: '9', label: 'SB+only' },
      { value: '10', label: 'SOT专题' },
      { value: '11', label: 'LVO专题' },
      { value: '12', label: 'ID' },
      { value: '13', label: 'Rundown' },
    ],
    selected: '1',
    multiple: false,
  },
  {
    key: 'source',
    label: '来源',
    type: 'select',
    items: [
      { value: '1', label: 'HK香港' },
      { value: '2', label: 'BJ北京' },
      { value: '3', label: 'NY纽约' },
      { value: '4', label: 'SAN三藩市' },
      { value: '5', label: 'LA洛杉矶' },
      { value: '6', label: 'WAS华盛顿' },
      { value: '7', label: 'PAR巴黎' },
      { value: '8', label: 'LON伦敦' },
      { value: '9', label: 'MOS莫斯科' },
      { value: '10', label: 'TKY东京' },
      { value: '11', label: 'SYD悉尼' },
      { value: '12', label: 'TER德黑兰' },
      { value: '13', label: 'SH上海' },
      { value: '14', label: 'SZ深圳' },
      { value: '15', label: 'TW台湾' },
      { value: '16', label: '特约记者' },
      { value: '17', label: '娱乐新闻' },
      { value: '18', label: '其他' },
    ],
    selected: '1',
    multiple: false,
  },
  {
    key: 'contentType',
    label: '类别',
    type: 'select',
    items: [
      { value: '1', label: '正点' },
      { value: '2', label: '直通车' },
      { value: '3', label: '全媒体' },
      { value: '4', label: '网络' },
      { value: '5', label: '早班车' },
      { value: '6', label: '全球连线' },
      { value: '7', label: '总编辑时间' },
      { value: '8', label: '华闻大直播' },
      { value: '9', label: '香港台' },
      { value: '10', label: '垫底片' },
      { value: '11', label: '罐头' },
      { value: '12', label: '国际' },
      { value: '13', label: '港澳' },
      { value: '14', label: '台湾' },
      { value: '15', label: '大陆' },
      { value: '16', label: '财经' },
      { value: '17', label: '体育' },
      { value: '18', label: '娱乐' },
      { value: '19', label: '专题' },
      { value: '20', label: '其他' },
    ],
    selected: '1',
    multiple: false,
  },
];

const initConfig = function initConfig(groupName, info) {
  configGroup.collection.removeOne({ name: groupName }, (err) => {
    const keys = [];
    for (let i = 0, len = info.length; i < len; i++) {
      keys.push(info[i].key);
    }
    configInfo.collection.removeMany({ key: { $in: keys } }, (err) => {
      configGroup.insertOne({ name: groupName }, (err, r) => {
        if (err) {
          console.log(err);
          throw err;
        }

        const genre = r.insertedId;
        for (let i = 0, len = info.length; i < len; i++) {
          info[i].genre = genre;
        }
        configInfo.insertMany(info, (err) => {
          if (err) {
            throw new Error(`创建${groupName}配置出错:${err.message}`);
          }
          return true;
        });
      });
    });
  });
};

const mediaInfo = [
  {
    key: 'meidaCenterSearchSelects',
    value: JSON.stringify(meidaCenterSearchSelects),
    description: '',
  },
  {
    key: 'mediaCenterSearchRadios',
    value: JSON.stringify(mediaCenterSearchRadios),
    description: '',
  },
];
initConfig('新版媒体库搜索配置', mediaInfo);

const subInfo = [{
  key: 'subscribeSearchConfig',
  value: JSON.stringify(subscribeConfig),
  description: '',
}];
initConfig('订阅搜索配置', subInfo);

const manuscriptInfoTags = [{
  key: 'manuscriptTags',
  value: JSON.stringify(manuscriptTags),
  description: '',
}];
initConfig('稿件标签配置', manuscriptInfoTags);

const manuscriptInfo = [{
  key: 'manuscriptInfoConfig',
  value: JSON.stringify(manuscriptSubmit),
  description: '',
}];
initConfig('稿件配置', manuscriptInfo);

// // 条目信息字段显示排序
// const entryFieldSort = ['FIELD332', 'FIELD187', 'FIELD36', 'FIELD196', 'FIELD197', 'FIELD195', 'FIELD198', 'FIELD320', 'FIELD183', 'FIELD276', 'FIELD314', 'FIELD067', 'FIELD139', 'FIELD338', 'FIELD07', 'FIELD088', 'FIELD304', 'FIELD180', 'FIELD185', 'FIELD269', 'FIELD333', 'FIELD334', 'FIELD263', 'FIELD154', 'FIELD245', 'FIELD246', 'FIELD251', 'FIELD252', 'FIELD259', 'FIELD255', 'FIELD262', 'FIELD290', 'FIELD34', 'FIELD220', 'FIELD222', 'FIELD100', 'FIELD145', 'FIELD162', 'FIELD296', 'FIELD297', 'FIELD298', 'FIELD299', 'FIELD309', 'FIELD270', 'FIELD223', 'FIELD282', 'FIELD221', 'FIELD283', 'FIELD284', 'FIELD149', 'FIELD51', 'FIELD052', 'FIELD328', 'FIELD292', 'FIELD293', 'FIELD294', 'FIELD188', 'FIELD326', 'FIELD311', 'FIELD329', 'FIELD275', 'FIELD330', 'FIELD247', 'FIELD232', 'FIELD327', 'FIELD225', 'FIELD226', 'FIELD228', 'FIELD227', 'FIELD200', 'FIELD171', 'FIELD45', 'FIELD094', 'FIELD098', 'FIELD095', 'FIELD099', 'FIELD116', 'FIELD164', 'FIELD03', 'FIELD104', 'FIELD57', 'FIELD133', 'FIELD163', 'FIELD176', 'FIELD335', 'FIELD235', 'FIELD234', 'FIELD143', 'FIELD217', 'FIELD216', 'FIELD233', 'FIELD186', 'FIELD121', 'FIELD310', 'FIELD147', 'FIELD55', 'FIELD193', 'FIELD37', 'FIELD21', 'FIELD22', 'FIELD23', 'FIELD24', 'FIELD120', 'FIELD144', 'FIELD105', 'FIELD233', 'FIELD231', 'FIELD235', 'FIELD234', 'FIELD273', 'FIELD237', 'FIELD238', 'FIELD236', 'FIELD231', 'FIELD178', 'FIELD83', 'FIELD235', 'FIELD234', 'FIELD172', 'FIELD14', 'FIELD33', 'FIELD312', 'FIELD61', 'FIELD159', 'FIELD281', 'FIELD280', 'FIELD80', 'FIELD150', 'FIELD151', 'FIELD168', 'FIELD174', 'FIELD194', 'FIELD190', 'FIELD53', 'FIELD02', 'FIELD108', 'FIELD107', 'FIELD324', 'FIELD265', 'FIELD267', 'FIELD148', 'FIELD175', 'FIELD182', 'FIELD47', 'FIELD129', 'FIELD12', 'FIELD118', 'FIELD69', 'FIELD66', 'FIELD68', 'FIELD71', 'FIELD134', 'FIELD135', 'FIELD323', 'FIELD155', 'FIELD04', 'FIELD25', 'FIELD81', 'FIELD26', 'FIELD62', 'FIELD72', 'FIELD156', 'FIELD065', 'FIELD13', 'FIELD260', 'FIELD325', 'FIELD250', 'FIELD214', 'FIELD321', 'FIELDPUBLISH', 'FIELD115', 'FIELD079', 'FIELD030', 'FIELD189', 'FIELD215', 'FIELD170', 'FIELD169', 'FIELD204', 'FIELD209', 'FIELD271', 'FIELD208', 'FIELD136', 'FIELD89', 'FIELD161', 'FIELD173', 'FIELD244', 'FIELD243', 'FIELD74', 'FIELD165', 'FIELD40', 'FIELD28', 'FIELD29', 'FIELD27', 'FIELD233', 'FIELD235', 'FIELD234', 'FIELD273', 'FIELD274', 'FIELD237', 'FIELD238', 'FIELD236', 'FIELD237', 'FIELD238', 'FIELD224', 'FIELD58', 'FIELD289', 'FIELD73', 'FIELD125', 'FIELD268', 'FIELD85', 'FIELD20', 'FIELD18', 'FIELD19', 'FIELD75', 'FIELD123', 'FIELD230', 'FIELD113', 'FIELD286', 'FIELD17', 'FIELD35', 'FIELD109', 'FIELD167', 'FIELD166', 'FIELD141', 'FIELD160', 'FIELD157', 'FIELD192', 'FIELD191', 'FIELD70', 'FIELD319', 'FIELD41', 'FIELD42', 'FIELD158', 'FIELD103', 'FIELD261', 'FIELD60', 'FIELD49', 'FIELD48', 'FIELD50', 'FIELD59', 'FIELD181', 'FIELD220', 'FIELD80', 'FIELD324', 'FIELD067', 'FIELD36', 'FIELD189', 'FIELD162', 'FIELD145', 'FIELD276', 'FIELD314', 'FIELD183', 'FIELD088', 'FIELD221', 'FIELD44', 'FIELD90', 'FIELD01', 'FIELD86', 'FIELD38', 'FIELD285', 'FIELD199', 'FIELD131', 'FIELD201', 'FIELD106', 'FIELD84', 'FIELD313', 'FIELD279', 'FIELD132', 'FIELD64', 'FIELD63', 'FIELD142', 'FIELD318', 'FIELD126', 'FIELD130', 'FIELD152', 'FIELD322', 'FIELD177', 'FIELD211', 'FIELD256', 'FIELD203', 'FIELD295', 'FIELD213', 'FIELD77', 'FIELD212', 'FIELD138', 'FIELD119', 'FIELD117', 'FIELD249', 'FIELD137', 'FIELD92', 'FIELD272', 'FIELD242', 'FIELD179', 'FIELD046', 'FIELD110', 'FIELD128', 'FIELD124', 'FIELD127', 'FIELD184', 'FIELD218', 'FIELD219', 'FIELD253', 'FIELD254', 'FIELD287', 'FIELD288', 'FIELD257', 'FIELD258', 'FIELD54', 'FIELD205', 'FIELD207', 'FIELD206', 'FIELD202', 'FIELD114', 'FIELD76', 'FIELD31', 'FIELD236', 'FIELD266', 'FIELD111', 'FIELD102', 'FIELD101', 'FIELD146', 'FIELD277', 'FIELD278', 'FIELD06', 'FIELD300', 'FIELD096', 'FIELD317', 'FIELD093', 'FIELD097', 'FIELD248', 'FIELD241', 'FIELD239', 'FIELD240', 'FIELD05', 'FIELD08', 'FIELD291', 'FIELD43', 'FIELD16', 'FIELD39', 'FIELD15', 'FIELD32', 'FIELD078', 'FIELD140', 'FIELD210', 'FIELD307', 'FIELD308', 'FIELD87', 'FIELD264', 'FIELD229', 'FIELD228', 'FIELD227', 'FIELD122', 'FIELD56', 'FIELD331', 'FIELD153', 'FIELD315', 'FIELD09', 'FIELD91', 'FIELD11', 'FIELD10', 'FIELD112', 'FIELD82'];
// // 片段信息字段显示排序
// const fragmentFieldSort = ['FIELD187', 'FIELD195', 'FIELD196', 'FIELD276', 'FIELD314', 'FIELD222', 'FIELD220', 'FIELD139', 'FIELD145', 'FIELD162', 'FIELD309', 'FIELD326', 'FIELD327', 'FIELD328', 'FIELD311', 'FIELD275', 'FIELD330', 'FIELD329', 'FIELD100', 'FIELD171', 'FIELD45', 'FIELD335', 'FIELD164', 'FIELD03', 'FIELD57', 'FIELD133', 'FIELD163', 'FIELD55', 'FIELD178', 'FIELD83', 'FIELD172', 'FIELD14', 'FIELD168', 'FIELD174', 'FIELD194', 'FIELD53', 'FIELD02', 'FIELD108', 'FIELD324', 'FIELD148', 'FIELD175', 'FIELD25', 'FIELD81', 'FIELD26', 'FIELD62', 'FIELD325', 'FIELD067', 'FIELD170', 'FIELD169', 'FIELD332', 'FIELD161', 'FIELD173', 'FIELD165', 'FIELD28', 'FIELD29', 'FIELD27', 'FIELD58', 'FIELD268', 'FIELD167', 'FIELD166', 'FIELD319', 'FIELD44', 'FIELD01', 'FIELD86', 'FIELD84', 'FIELD279', 'FIELD64', 'FIELD63', 'FIELD318', 'FIELD176', 'FIELD177', 'FIELD295', 'FIELD77', 'FIELD138', 'FIELD223', 'FIELD180', 'FIELD31', 'FIELD088', 'FIELD304', 'FIELD300', 'FIELD317', 'FIELD221', 'FIELD87', 'FIELD56', 'FIELD331', 'FIELD315', 'FIELD91', 'FIELD82'];
//
// const entryFieldSortInfo = [{
//   key: 'entryFieldSortInfoConfig',
//   value: JSON.stringify(entryFieldSort),
//   description: '条目信息字段显示排序',
// }];
// initConfig('条目信息字段显示', entryFieldSortInfo);
//
// const fragmentFieldSortInfo = [{
//   key: 'fragmentFieldSortInfoConfig',
//   value: JSON.stringify(fragmentFieldSort),
//   description: '片段信息字段显示排序',
// }];
// initConfig('片段信息字段显示', fragmentFieldSortInfo);

// 订阅下载格式，下载支持如下格式
const subscribeDownloadType = [
  {
    key: '全高清',
    value: '6',
    description: '订阅下载1080P资源',
  },
  {
    key: '标清',
    value: '7',
    description: '订阅下载360P资源',
  },
  {
    key: 'wav',
    value: '8',
    description: '订阅下载音频WAV资源',
  },
  {
    key: 'mp3',
    value: '9',
    description: '订阅下载音频mp3资源',
  },
];

const subscribeDownloadTypeInfo = [{
  key: 'subscribe_download_type',
  value: JSON.stringify(subscribeDownloadType),
  description: '订阅信息文件下载格式',
}];

initConfig('subscribe_download_type', subscribeDownloadTypeInfo);

