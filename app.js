//app.js
var that;
App({
  config: require('config.js'),
  util: require('utils/util.js'),
  skin: require('utils/skin.js'),
  onLaunch: function () {
    that = this;
    that.setSkin();
    that.login();
  },
  globalData: {
    isLogin: false
  },
  login: function (callback) {
    if (wx.getStorageSync(that.config.customerIdKey)) {
      that.globalData.isLogin = true;
      callback && callback();
      return;
    }

    wx.showLoading({
      title: "正在登录",
      mask: true,
    });
    wx.login({
      success: function (res) {
        var code = res.code;
        wx.getUserInfo({
          success: function (res) {
            console.log(res);
            that.util.post("/ApiAccount/LoginV2", {
              code: code,
              encryptedData: res.encryptedData,
              iv: res.iv
            }, function (res) {
              wx.setStorageSync(that.config.customerIdKey, res.CustomerId);
              that.globalData.isLogin = true;
              callback && callback();
              that.util.hideLoading();
            });
          },
          fail: function (e) {
            that.getauth({
              content: '需要获取您的用户信息授权，请到小程序设置中打开授权',
              cancel: true,
              success: function (e) {
                if (e) {
                  that.login(callback);
                }
              },
            });
          }
        });
      },
      fail: function (e) {
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  getauth: function (obj) {
    wx.showModal({
      title: '是否打开设置页面重新授权',
      content: obj.content,
      confirmText: '去设置',
      success: function (e) {
        if (e.confirm) {
          wx.openSetting({
            success: function (res) {
              if (obj.success) {
                obj.success(res);
              }
            },
            fail: function (res) {
              obj.fail && obj.fail(res);
            },
            complete: function (res) {
              obj.complete && obj.complete(res);
            }
          })
        } else {
          if (obj.cancel) {
            getApp().getauth(obj);
          }
        }
      }
    });
  },
  setSkin: function () {
    wx.getStorage({
      key: that.config.skinKey,
      success: function (res) {
        that.globalData.skin = res.data;
        that.skin.setTabBar(that.globalData.skin);
      }
    });
    that.util.get("/ApiShop/GetSkin", undefined, function (res) {
      that.globalData.skin = res;
      that.skin.setTabBar(that.globalData.skin);
      wx.setStorage({
        key: that.config.skinKey,
        data: that.globalData.skin,
      })
    });
  }
})