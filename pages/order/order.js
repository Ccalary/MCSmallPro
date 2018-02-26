// pages/order/order.js
var that;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    app.util.get("/ApiShop/OrderInfo", {}, function (res) {
      that.setData({
        order: res,
        address:res.Address
      });
    });
  },
  chooseAddress: function () {
    wx.chooseAddress({
      success: function (address) {
        that.setData({
          address: {
            ContactName: address.userName,
            ContactMobile: address.telNumber,
            ProvinceName: address.provinceName,
            CityName: address.cityName,
            CountyName: address.countyName,
            DetailAddress: address.detailInfo
          }
        });
      },
      fail: function (res) {
        that.getAuth(function () { that.chooseAddress() })
      },
      complete: function (res) { },
    });
  },
  getAuth: function (callback) {
    wx.showModal({
      title: '是否打开设置页面重新授权',
      content: "需要获取您的通讯地址授权，请到小程序设置中打开授权",
      confirmText: '去设置',
      success: function (e) {
        if (e.confirm) {
          wx.openSetting({
            success: function (res) {
              callback && callback(res);
            },
            fail: function (res) {
            },
            complete: function (res) {
            }
          });
        } else {
          that.getAuth(callback);
        }
      }
    });
  },
  createOrder: function () {
    var address = that.data.address;
    if (!address) {
      app.util.toast("请选择收货地址");
      return;
    }
    app.util.post("/ApiShop/CreateOrder", {
      ContactName: address.ContactName,
      ContactMobile: address.ContactMobile,
      ProvinceName: address.ProvinceName,
      CityName: address.CityName,
      CountyName: address.CountyName,
      DetailAddress: address.DetailAddress
    }, function (res) {
      var pay = res.pay;
      var orderId = res.orderId;
      if (pay){
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
            if (res.indexOf("fail cancel")!=-1){
              wx.redirectTo({
                url: '/pages/me/children/myOrder/myOrder?selectIndex=0',
              });
            }else{
              app.util.error("支付失败，请稍后再试");
            }
           },
        });
      }else{
        wx.redirectTo({
          url: '/pages/me/children/myOrder/myOrder?selectIndex=0',
        });
      }
      app.util.hideLoading();
    });
  }
})