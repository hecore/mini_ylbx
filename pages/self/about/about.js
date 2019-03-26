// pages/self/about/about.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLog: false,
    msg: {
      core: "本系统由北规院开发,模块仅供内部人员使用"
    },
    developer: {
      depart: "信息中心",
      tel: '17310406303',
      name: '何杰'
    },
    manager: {
      depart: "人事处",
      tel: '010-12345',
      name: '齐文静'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this 相对于wx.request
    var data=this.data;
    this.setData({
      version:app.globalData._version,
      title: app.globalData._name,
      year: new Date().getFullYear(),
      msg:data.msg,
      developer:data.developer,
      manager:data.manager
      // msg:msg,
      // developer:developer,
      // manager:manager
    });
  },

  toggleLog: function () {
    this.setData({
      showLog: !this.data.showLog
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