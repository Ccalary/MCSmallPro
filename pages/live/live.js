// pages/live/live.js
var RongIMLib = require("../../utils/rong/RongIMLib.xiaochengxu-1.0.0.js");
var RongIMClient = RongIMLib.RongIMClient;
var Emoji = require("../../utils/rong/emoji.js");

var that;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    productVisible: false,
    messageChatVisible: false,
    messagesScrollTop: 100000,
    productQty: 1,
    selectedProductId: "",
    cartVisible: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;

    that.setData({
      skin: app.globalData.skin,
      skinPrimaryColor: app.skin.getSkinPrimaryColor(app.globalData.skin),
      skinThirdColor: app.skin.getSkinThirdColor(app.globalData.skin)
    });
    app.skin.setNavigationBarColor(that.data.skin);

    var id = options.id ="12226224c28148a49c3a78774e6199f8";
    app.util.get("/ApiShop/LiveInfo", { id: id }, function (res) {
      wx.setNavigationBarTitle({
        title: res.RoomTitle
      });

      that.setData({
        zhuboId: res.ZhuboId,
        zhuboAvatar: res.ZhuboAvatar,
        zhuboName: res.ZhuboName,
        onlineCount: res.OnlineCount,
        isAttention: res.IsAttention,
        canUserLivePlayer: res.CanUserLivePlayer,
        videoUrl: res.VideoUrl,
        videoPoster: res.VideoPoster,
        customer: res.Customer,
        recommendProduct: res.RecommendProduct,
        products: res.Products
      });

      that.initRong(res.RongAppId, that.data.zhuboId, that.data.customer.Token);
    });
    app.util.get("/ApiShop/GetShareInfo", { zhuboId: id }, function (res) {
      that.setData({
        shareTitle: res
      });
    });
  },
  onReady: function () {
    that.modalCart = that.selectComponent("#modalCart");
  },
  onShareAppMessage: function () {
    return {
      title: that.data.shareTitle,
      success: function (res) {
        app.util.toast("转发成功");
      },
      fail: function (res) {

      }
    }
  },
  onUnload: function () {
    try {
      RongIMClient.getInstance().disconnect();
    } catch (e) {
    }
  },
  initRong: function (rongAppId, zhuboId, token) {
    //公有云
    RongIMLib.RongIMClient.init(rongAppId);
    var instance = RongIMClient.getInstance();

    // 连接状态监听器
    RongIMClient.setConnectionStatusListener({
      onChanged: function (status) {
      }
    });

    RongIMClient.setOnReceiveMessageListener({
      // 接收到的消息
      onReceived: function (message) {
        try {
          var messages = that.data.messages || [];
          switch (message.objectName) {
            case "RC:TxtMsg":
              var extra = JSON.parse(message.content.extra);
              messages.push({
                id: message.messageUId,
                msgType: "text",
                name: extra.username,
                content: Emoji.unicodeToEmoji(message.content.content)
              });
              that.setData({
                messages: messages
              });
              that.setData({
                messagesScrollTop: that.data.messagesScrollTop
              });
              break;
            case "WK:RecommendProductMsg":
              var extra = JSON.parse(message.content.message.content.extra);
              that.setData({
                recommendProduct: extra
              });
              break;
          }
        } catch (e) {
          console.error(e);
        }
      }
    });

    //开始连接
    RongIMClient.connect(token, {
      onSuccess: function (userId) {
        console.log("连接成功，用户id：" + userId);
        RongIMClient.getInstance().joinChatRoom(zhuboId, 0, {
          onSuccess: function () {
            console.log("加入聊天室成功");
          },
          onError: function (error) {
            console.error("加入聊天室失败:" + error);
          }
        });
      },
      onTokenIncorrect: function () {
        console.error('token无效');
      },
      onError: function (errorCode) {
        console.error("connect error:" + errorCode);
      }
    });
  },
  popupInputBox: function () {
    that.setData({
      messageChatVisible: true
    });
  },
  hideInputBox: function () {
    that.setData({
      messageChatVisible: false
    });
  },
  inputMessage: function (e) {
    that.setData({
      inputMessage: e.detail.value
    })
  },
  sendMessage: function (e) {
    var msg = that.data.inputMessage || "";
    msg = msg.replace(/(^\s*)|(\s*$)/g, "");
    if (!msg) {
      app.util.toast("请输入内容");
      return;
    }
    if (msg.length > 30) {
      app.util.toast("最大可输入30个字符");
      return;
    }
    that.setData({
      inputMessage: "",
      messageChatVisible: false
    });

    var extra = {
      userid: that.data.customer.Id,
      username: that.data.customer.Name,
      userlevel: 1,
      guarded: false
    };
    var textMessage = new RongIMLib.TextMessage({ content: msg, extra: JSON.stringify(extra) });
    RongIMClient.getInstance().sendMessage(RongIMLib.ConversationType.CHATROOM, that.data.zhuboId, textMessage, {
      onSuccess: (message) => {
        var messages = that.data.messages || [];
        messages.push({
          id: message.messageUId,
          msgType: "text",
          name: extra.username,
          content: Emoji.unicodeToEmoji(msg)
        });
        that.setData({
          messages: messages,
        });
        that.setData({
          messagesScrollTop: that.data.messagesScrollTop
        });

      },
      onError: (error, message) => {
        console.error(error);
      }
    });
  },
  showProduct: function (e) {
    var productId = e.currentTarget.dataset.productId, zhuboProductId = e.currentTarget.dataset.zhuboProductId;
    app.util.get("/ApiShop/LiveProduct", { productId: productId, zhuboProductId: zhuboProductId }, function (res) {
      that.setData({
        product: res,
        productVisible: true,
        selectedProductId: productId
      });
    });
  },
  minusProductQty: function () {
    var qty = that.data.productQty;
    qty = Math.max(1, qty - 1);
    that.setData({
      productQty: qty
    });
  },
  addProductQty: function () {
    that.setData({
      productQty: that.data.productQty += 1
    });
  },
  closeProduct: function () {
    that.setData({
      productVisible: false
    });
  },
  addCart: function (e) {
    var productId = that.data.selectedProductId, qty = that.data.productQty;
    if (!productId) {
      app.util.toast("请选择商品");
      return;
    }
    app.util.post("/ApiShop/AddCart", { productId: productId, qty: qty, zhuboId: that.data.zhuboId }, function () {
      app.util.success("添加成功");
    });
  },
  showCart: function () {
    app.util.get("/ApiShop/GetCarts", {}, function (res) {
      that.setData({
        cart: res,
        cartVisible: true
      });

      that.modalCart.show();
    });
  },
  changeCartProductQty: function (e) {
    var cartId = e.currentTarget.dataset.cartId, qty = e.currentTarget.id == "minusCartProductQty" ? -1 : 1;
    app.util.post("/ApiShop/ChangeCartProductQty", { cartId: cartId, qty: qty }, function (res) {
      that.setData({
        cart: res,
        cartVisible: true
      });
      app.util.hideLoading();
    });
  },
  removeCartProduct: function (e) {
    var cartId = e.currentTarget.dataset.cartId;
    app.util.post("/ApiShop/RemoveCartProduct", { cartId: cartId }, function (res) {
      that.setData({
        cart: res,
        cartVisible: true
      });
      app.util.hideLoading();
    });
  },
  changeCartProductStatus: function (e) {
    var cartId = e.currentTarget.dataset.cartId;
    app.util.post("/ApiShop/ChangeCartProductStatus", { cartId: cartId }, function (res) {
      that.setData({
        cart: res,
        cartVisible: true
      });
      app.util.hideLoading();
    });
  },
  changeCartAllProductStatus: function (e) {
    app.util.post("/ApiShop/ChangeCartAllProductStatus", { selected: !that.data.cart.IsSelectedAll }, function (res) {
      that.setData({
        cart: res,
        cartVisible: true
      });
      app.util.hideLoading();
    });
  },
  buy: function (e) {
    var productId = that.data.selectedProductId, qty = that.data.productQty;
    if (!productId) {
      app.util.toast("请选择商品");
      return;
    }
    app.util.post("/ApiShop/AddCartToBuy", { productId: productId, qty: qty, zhuboId: that.data.zhuboId }, function () {
      wx.navigateTo({
        url: '/pages/order/order'
      });
      app.util.hideLoading();
    });
  },
  goBuy: function () {
    if (!that.data.cart || that.data.cart.TotalQty == 0) {
      app.util.toast("请选择商品");
      return;
    }
    wx.navigateTo({
      url: '/pages/order/order'
    });
  },
  attention: function () {
    app.util.post("/ApiShop/Attention", { zhuboId: that.data.zhuboId }, function () {
      that.setData({
        isAttention: true
      });
      app.util.success("关注成功");
    });
  },
  like: function () {
    app.util.post("/ApiShop/Like", { zhuboId: that.data.zhuboId }, function () {
      app.util.success("点赞成功");
    });
  },
  navigateToProuct: function (e) {
    var productId = e.currentTarget.dataset.productId;
    wx.navigateTo({
      url: '/pages/product/product?id=' + productId + "&zhuboId=" + that.data.zhuboId
    });
  }
});
