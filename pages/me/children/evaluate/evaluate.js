// pages/me/children/evaluate/evaluate.js
let that;
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lightStar: 'http://res.o2o.com.cn:8082/img/44ee4fe217fb469bb52400bb6be652c3',
    grayStar: 'http://res.o2o.com.cn:8082/img/cd30ce27b05e499fbd17c6e839d7a8de',
    starList: [0, 0, 0, 0, 0],
    selectedStar: 0,
    content:'', //内容
    image: '',
    imageList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    
    that.setData({
      skin: app.globalData.skin,
      productId: options.productId,
      image: options.image
    });
    app.skin.setNavigationBarColor(that.data.skin);
  },

  // 星星点击
  starAction: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = [];
    for (var i = 0; i < that.data.starList.length; i++) {
      if (i <= index) {
        list.push(1);
      } else {
        list.push(0);
      }
    }
    that.setData({
      starList: list,
      selectedStar: index + 1
    })
  },
  // 输入框输入监听
  inputAction: function (e) {
    that.setData({
      content: e.detail.value
    })
  },
  //添加图片 
  addAction: function () {
    that.choosePhoto()
  },

  choosePhoto: function () {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        app.util.uploadFile(tempFilePaths[0], function (res) {
          var list = that.data.imageList
          if (list.length >= 3) {//最多五张
            app.util.toastFail('最多上传3张照片')
            return
          }
          list.push(res)
          that.setData({
             imageList: list
          })
        });
      }
    })
  },

  // 删除图片
  photoDelAction: function (e) {
    var list = that.data.imageList
    list.splice(e.currentTarget.dataset.index, 1)
    that.setData({
      imageList: list
    })
  },

  // 提交
  admitAction: function () {
    if (that.data.selectedStar <= 0){
      app.util.toastFail('请选择评价星级')
      return
    }
    if (that.data.content.length <= 0){
      app.util.toastFail('请输入评价内容')
      return
    }
    app.util.post("/ApiShop/Comment", {
       'orderProductId': that.data.productId, 
       'content': that.data.content, 
       'images': that.data.imageList.join(';'),
        'rate': that.data.selectedStar
      }, 
      function (res) {
      app.util.success('评价成功')
      // 延时执行
      setTimeout(function () {
        wx.navigateBack();
      }, 1000)
    });
  }
})