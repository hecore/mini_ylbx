// pages/home/home.js

const util = require('../../utils/util');
const app = getApp();
Page({
  
  /**
   * 转向录入
   */
  turnToEntry: function () {
    wx.navigateTo({
      url: 'record/record',
    })
  },

  turnToSpeEntry: function () {
    wx.navigateTo({
      url: '../speentry/speentry',
    })
  },

  turnToAudit:function(){
    wx.navigateTo({
      url: '../audit/audit',
    })
  },

  turnToRecords:function(){
    wx.navigateTo({
      url: '../records/records',
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
    offline: false,
    remind: '加载中'
  },

  /**
   * 1.生命周期函数--监听页面加载  程序渲染入口
   */
  onLoad: function (options) {
    this.login(); //登录
  },
  login: function () {
    var _this = this;
    //如果有缓存，则提前加载缓存
    if (app.cache.version === app.version) {
      try {
        _this.response();
      } catch (e) {
        //报错则清除缓存
        app.cache = {};
        wx.clearStorage();
      }
    }
    //然后再尝试登录用户, 如果缓存更新将执行该回调函数
    app.getUser(function (status) {
      _this.response.call(_this, status);
    });
  },
  response: function (status) {
    var _this = this;
    if (status) {
      if (status != '离线缓存模式') {
        //错误
        _this.setData({
          'remind': status
        });
        return;
      } else {
        //离线缓存模式
        _this.setData({
          offline: true
        });
      }
    }
    _this.setData({
      user: app._user
    });
    //判断绑定状态
    if (!app._user.is_bind) {
      _this.setData({
        'remind': '未绑定'
      });
    } else {
      _this.setData({
        'remind': '加载中'
      });
      // 初始化页面数据
      _this.getCardData();
    }
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
    var _this = this;
    //离线模式重新登录
    if (_this.data.offline) {
      _this.login();
      return false;
    }
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
    if (app._user.is_bind) {
      //重新渲染
      this.getCardData();
    } else {
      wx.stopPullDownRefresh();
    }
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