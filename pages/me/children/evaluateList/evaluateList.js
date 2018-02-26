// pages/me/children/evaluateList/evaluateList.js
let app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    page: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      skin: app.globalData.skin
    });
    app.skin.setNavigationBarColor(that.data.skin);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    that.requestData()
  },
  /**
* 页面相关事件处理函数--监听用户下拉动作
*/
  onPullDownRefresh: function () {
    that.setData({
      datas: [],
      page: 1,
    });
    that.requestData(function () {
      wx.stopPullDownRefresh();})
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    that.setData({
      page: that.data.page+1,
    });
  },
  // 请求数据接口
  requestData: function (callback) {
    app.util.get("/ApiShop/MyForCommentOrderList", {
      'pageIndex': that.data.page
    },
    function (res) {
        console.log(res)
        var temlist = res
        if (that.data.page == 1){
          that.setData({
            list: temlist
          })
        }else {
          that.setData({
            list: that.data.list.concat(temlist)
          })
        }
        callback && callback(res);
    });
  },
  // 产品详情
  productDetailAction: function (e) {
    var productId = e.currentTarget.dataset.productid
    var zhuboId = e.currentTarget.dataset.zhuboid
    wx.navigateTo({
      url: '../../../product/product?id=' + productId + '&zhuboId=' + zhuboId,
    })
  },
  // 评价
  evaluateAction: function (e) {
    var productId = e.currentTarget.dataset.productid
    var image = e.currentTarget.dataset.image
    wx.navigateTo({
      url: '../evaluate/evaluate?productId=' + productId + '&image=' + image,
    })
  } 
})