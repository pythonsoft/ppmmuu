
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
    selected: '',
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
    selected: '',
  },
  {
    key: 'f_str_145',
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
    selected: '',
  },
  {
    key: 'f_str_324',
    label: '事發國家',
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
    selected: '',
  },
  {
    key: 'f_str_323',
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
    selected: '',
  },
  {
    key: 'f_str_223',
    label: '製作地點',
    items: [
      { value: '北京', label: '北京' },
      { value: '深圳', label: '深圳' },
      { value: '香港', label: '香港' },
      { value: '台北', label: '台北' },
      { value: '上海', label: '上海' },
      { value: 'NIL', label: 'NIL' },
    ],
    selected: '',
  },
  {
    key: 'f_str_314',
    label: '資源所屬部門',
    items: [
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
      { value: '影帶管理部', label: '影帶管理部' },
    ],
    selected: '',
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
    selected: 'all',
  },
  {
    key: 'f_str_067',
    label: '是否歸檔',
    items: [
      { value: 'all', label: '全部' },
      { value: '是', label: '是' },
      { value: '否', label: '否' },
    ],
    selected: 'all',
  },
];

const subscribeConfig = [
  {
    key: 'subscribeType',
    label: '节目类型',
    items: [
    ],
    selected: '',
    multiple: true,
    type: 'string',
    example: ['体育1', '娱乐1'],
    defaultValue: '',
  },
  {
    key: 'FIELD323',
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
    selected: '',
    multiple: true,
    type: 'string',
    example: ['播出版', '參展版'],
    defaultValue: '',
  },
  {
    key: 'duration',
    label: '时长',
    items: [
      { value: { gte: 0, lt: 6000 }, label: '短片(4分钟以下)' },
      { value: { gte: 30000 }, label: '短片(20分钟以上)' },
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
      { value: { 'details.FIELD162': { order: 'asc' } }, label: '新闻时间由远到近' },
      { value: { 'details.FIELD162': { order: 'desc' } }, label: '新闻时间由近到远' },
      { value: { 'details.FIELD36': { order: 'desc' } }, label: '首播时间由近到远' },
      { value: { 'details.FIELD36': { order: 'asc' } }, label: '首播时间由远到近' },
    ],
    selected: '',
    multiple: false,
    type: 'string',
    example: '',
    defaultValue: 'should',
  },
  {
    key: 'FIELD162',
    label: '新闻日期',
    selected: '',
    multiple: false,
    type: 'daterange',
    example: { gte: '2017-10-16T08:52:17.200Z', lt: '2017-10-17T08:52:17.200Z' },
    defaultValue: '',
  },
  {
    key: 'FIELD36',
    label: '首播日期',
    selected: '',
    multiple: false,
    type: 'daterange',
    example: { gte: '2017-10-16T08:52:17.200Z', lt: '2017-10-17T08:52:17.200Z' },
    defaultValue: '',
  },
];


const subscribeConfigKey = '订阅搜索配置';
configGroup.collection.findOne({ name: subscribeConfigKey }, (err, doc) => {
  if (err) {
    console.log(err);
  } else if (!doc) {
    configGroup.insertOne({ name: subscribeConfigKey }, (err) => {
      if (err) {
        console.log(err);
      }
      configGroup.collection.findOne({ name: subscribeConfigKey }, (err, doc) => {
        if (err) {
          console.log(err);
        }

        if (!doc) {
          console.log('没有创建订阅搜索配置组');
        } else {
          const genre = doc._id;
          const info = {
            key: 'subscribeSearchConfig',
            value: JSON.stringify(subscribeConfig),
            description: '',
            genre,
          };
          configInfo.insertOne(info, (err) => {
            if (err) {
              throw new Error(`创建订阅搜索配置出错:${err.message}`);
            }
          });
        }
      });
    });
  }
});

configGroup.collection.removeOne({ name: '新版媒体库搜索配置' }, (err) => {
  configInfo.collection.removeMany({ key: { $in: ['meidaCenterSearchSelects', 'mediaCenterSearchRadios'] } }, (err) => {
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
  });
});
