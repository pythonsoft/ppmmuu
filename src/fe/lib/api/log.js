export default {
  postLogTest(data,cb) {
    $.ajax({
      url: '/api/log/test',
      type: 'post',
      data: data,
      cache: false
    }).done(data => {
      cb(data)
    })
  },

}