export default {
  getUserDetail(data,cb) {
    $.ajax({
      url: '/api/user/detail',
      type: 'get',
      data: data,
      cache: false
    }).done(data => {
      cb(data)
    })
  },

}