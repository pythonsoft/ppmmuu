const CatalogInfo = require('../api/library/catalogInfo');
const CatalogTaskInfo = require('../api/library/catalogTaskInfo');
const FileInfo = require('../api/library/fileInfo');
const ShelfTaskInfo = require('../api/shelves/shelfTaskInfo');
const WatchingHistoryInfo = require('../api/user/watchingHistoryInfo');

const catalogInfo = new CatalogInfo();
const catalogTaskInfo = new CatalogTaskInfo();
const fileInfo = new FileInfo();
const shelfTaskInfo = new ShelfTaskInfo();
const watchingHistoryInfo = new WatchingHistoryInfo();

catalogTaskInfo.collection.update({}, { $set: { fromWhere: 'HK_RUKU' } }, { multi: true }, () => {});
catalogInfo.collection.update({}, { $set: { fromWhere: 'HK_RUKU' } }, { multi: true }, () => {});
fileInfo.collection.update({}, { $set: { fromWhere: 'HK_RUKU' } }, { multi: true }, () => {});
shelfTaskInfo.collection.update({ fromWhere: 1 }, { $set: { fromWhere: 'MAM' } }, { multi: true }, () => {});
shelfTaskInfo.collection.update({ fromWhere: 2 }, { $set: { fromWhere: 'DAYANG' } }, { multi: true }, () => {});
shelfTaskInfo.collection.update({ fromWhere: 3 }, { $set: { fromWhere: 'HK_RUKU' } }, { multi: true }, () => {});
watchingHistoryInfo.collection.update({ fromWhere: { $exists: false } }, { $set: { fromWhere: 'MAM' } }, { multi: true }, () => {});
