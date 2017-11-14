
'use strict';

const service = require('../api/library/service');

service.addTemplate({
  source: 'MAM',
  departmentId: '3f4c3ad0-baca-11e7-86de-9b53c2c58dbd',
  transcodeTemplates: 'MP4_720P', //
  transcodeScript: 'result="MP4_720P"',
  hdExt: ['.mxf', '.mp4'],
}, 'd5bb8820-9385-11e7-8346-79c9253a3aed', 'xuyawen', (err, r) => {
  console.log('addTemplate done -->', err, r);
});
