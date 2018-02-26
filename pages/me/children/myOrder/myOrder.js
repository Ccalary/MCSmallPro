// pages/me/children/order/order.js
let that;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titles: ['全部', '待付款', '已付款','待收货'],
    tabList:[ [], [], [], []],
    // // 当前选中的标签
     currentTab:-1,
    // 页面高度
     screenHeight:0,
     loadingHidden: false
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
    //系统信息
    wx.getSystemInfo({
      success: function(res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        that.setData({
          screenHeight:clientHeight * rpxR - 90,
        })
      },
    });
    that.setData({
      currentTab: options.selectIndex
    });
    
  },
  onShow: function () {
    //请求数据
    that.requestData(that.data.currentTab);
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

  // tab点击
  switchTab: function (e) {
    var id = e.currentTarget.dataset.id;
    that.setData({
      currentTab:id
    });
  },

  // 滑动
  switchTabContent: function (e) {
    that.setData({
      currentTab:e.detail.current
    });
    //请求数据
    that.requestData(that.data.currentTab);
  },

  /**
   * 用户取消 -2
   * 系统取消 -1
   * 订单初始 0
   * 已付款 1
   * 已发货 2
   * 交易成功 3
   * 等待退款退货 4
   * 退货退款中 5
   * 交易关闭 6
   * 交易异常 7
   * 提现中 8
   * 已分配 9
   * 已确认 10
   *  
  */
  requestData: function (index){
    that.setData({
      loadingHidden: false
    })

    index = parseInt(index);
    let status = '';
    switch (index){
      case 0://全部
        status = ''
        break;
      case 1://待付款
        status = 0
        break;
      case 2://已付款
        status = 1
        break;
      case 3://待收货
        status = 2
        break;
      default:
        break;
    }
    app.util.get("/ApiShop/MyOrderList?pageIndex=1&status=" + status, {}, function (res) {
      var list = that.data.tabList;
      list[index] = res;
      that.setData({
         tabList:list,
         loadingHidden: true
      });
    });
  },
  //取消订单
  cancelOrderAction: function (e) {
    
    wx.showModal({
      content: '这么好的宝贝，确定不要了吗？',
      cancelColor: '#333333',
      confirmColor: '#ff5f8d',
      success: function (res) {
        if (res.confirm) {
          app.util.get("/ApiShop/CancelMyOrder", { orderId: e.target.dataset.orderid }, function (res) {
            wx.showToast({
              title: '取消成功',
            })
            //请求数据
            that.requestData(that.data.currentTab);
          });
        } 
      }
    })
  
  },
  // 付款
  payAction: function (e) {
    let orderId = e.currentTarget.dataset.orderid;
    app.util.post("/ApiShop/Pay", { orderId: orderId }, function (res) {
      var pay = res.pay;
      var orderId = res.orderId;
      if (pay) {
        wx.requestPayment({
          timeStamp: pay.TimeStamp,
          nonceStr: pay.NonceStr,
          package: pay.Package,
          signType: pay.SignType,
          paySign: pay.PaySign,
          success: function (res) {
            wx.redirectTo({
              url: '/pages/paycomplete/paycomplete?orderId=' + orderId
            });
          },
          fail: function (res) {
            app.util.error("支付失败，请稍后再试");
          },
        });
      }
      app.util.hideLoading();
    });
  },
  //订单详情
  orderDetailAction: function (e) {
    let orderId = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId,
    })
  },
  // 物流信息
  flowAction: function () {

  },
  // 确认收货
  confirmAction: function (e) {
    let orderId = e.currentTarget.dataset.orderid;
    app.util.post("/ApiShop/ConfirmMyOrder", { orderId: orderId }, function (res) {
      //请求数据
      that.requestData(that.data.currentTab);
      app.util.hideLoading();
    });
  },
  //评价
  evaluationAction: function () {
     wx.navigateTo({
       url: '../evaluate/evaluate',
     })
  }
})