// pages/paycomplete/paycomplete.js
var that;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   *查看详情
   */
  lookOverDetailTab: function () {
    wx.redirectTo({
      url: '/pages/me/children/orderDetail/orderDetail?orderId=' + that.data.orderId,
    });
  },

  /**
   * 返回首页
   */
  backHomePageTab: function () {
    wx.switchTab({
      url: '/pages/list/list'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    wx.showNavigationBarLoading();

    var orderId = options.orderId;
    app.util.get("/ApiShop/PayResult", { orderId: orderId }, function (res) {
      that.setData({
        amt: res.Amt,
        payData: res.List,
        orderId: orderId
      });
      wx.hideNavigationBarLoading();
    });

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

  },

  /**
   * 生命周期函数--监听页面隐藏  
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
      
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})