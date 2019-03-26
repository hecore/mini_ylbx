//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var _this = this;
    //读取缓存
    try {
      var data = wx.getStorageInfoSync();//获取本地缓存全集
      if (data && data.keys.length) {
        data.keys.forEach(function (key) {//将本地缓存中存入对象内存key-value
          var value = wx.getStorageSync(key);
          if (value) {
            _this.cache[key] = value;
          }
        });
        if (_this.cache.version !== _this.globalData._version) {//切换版本清除缓存
          _this.cache = {};
          wx.clearStorage();
        } else {//==>存入微信用户对象+预处理出具
          _this._user.wx = _this.cache.userinfo.userInfo || {};
          _this.processData(_this.cache.userdata);
        }
      }
      //缓存不存在=>不做任何处理
    } catch (e) { console.warn('获取缓存失败'); }
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
  },


  //保存缓存
  saveCache: function (key, value) {
    if (!key || !value) { return; }
    var _this = this;
    _this.cache[key] = value;
    wx.setStorage({
      key: key,
      data: value
    });
  },
  //清除缓存
  removeCache: function (key) {
    if (!key) { return; }
    var _this = this;
    _this.cache[key] = '';
    wx.removeStorage({
      key: key
    });
  },

  //判断是否有登录信息，让分享时自动登录
  loginLoad: function (onLoad) {
    var _this = this;
    if (!_this._t) {  //无登录信息
      _this.getUser(function (e) {
        typeof onLoad == "function" && onLoad(e);
      });
    } else {  //有登录信息
      typeof onLoad == "function" && onLoad();
    }
  },

  // getUser函数=>登录授权，在home中调用
  getUser: function (response) {
    var _this = this;
    wx.showNavigationBarLoading();
    wx.login({ // 登录获取用户
      success: function (res) {
        if (res.code) {
          // 调用函数获取微信用户信息
          _this.getUserInfo(function (info) {
            _this.saveCache('userinfo', info);
            _this._user.wx = info.userInfo;
            if (!info.encryptedData || !info.iv) {
              _this.g_status = '无关联AppID';
              typeof response == "function" && response(_this.g_status);
              return;
            }
            //发送code与微信用户信息，获取员工数据
            wx.request({
              method: 'POST',
              url: _this.globalData._server + '/api/users/get_info.php',
              data: {
                code: res.code,
                key: info.encryptedData,
                iv: info.iv
              },
              success: function (res) {
                if (res.data && res.data.status >= 200 && res.data.status < 400) {
                  var status = false, data = res.data.data;
                  //判断缓存是否有更新
                  if (_this.cache.version !== _this.version || _this.cache.userdata !== data) {
                    _this.saveCache('version', _this.version);
                    _this.saveCache('userdata', data);
                    _this.processData(data);
                    status = true;
                  }
                  if (!_this._user.is_bind) {
                    wx.navigateTo({
                      url: '/pages/more/login'
                    });
                  }
                  //如果缓存有更新，则执行回调函数
                  if (status) {
                    typeof response == "function" && response();
                  }
                } else {
                  //清除缓存
                  if (_this.cache) {
                    _this.cache = {};
                    wx.clearStorage();
                  }
                  typeof response == "function" && response(res.data.message || '加载失败');
                }
              },
              fail: function (res) {
                var status = '';
                // 判断是否有缓存
                if (_this.cache.version === _this.version) {
                  status = '离线缓存模式';
                } else {
                  status = '网络错误';
                }
                _this.g_status = status;
                typeof response == "function" && response(status);
                console.warn(status);
              },
              complete: function () {
                wx.hideNavigationBarLoading();
              }
            });
          });
        }
      }
    });
  },
  /**
   * 关键的对象
   * _this {
   *  _user{
   *       is_bind,
   *       openid,
   *       manager,
   *       we
   *    },
   *  _time,
   *  _t,
   * }
   */
  processData: function (key) {
    var _this = this;
    var data = JSON.parse(_this.util.base64.decode(key));
    _this._user.is_bind = data.is_bind;
    _this._user.openid = data.user.openid;
    _this._user.manager = (data.user.type == '管理员');
    _this._user.we = data.user;
    _this._time = data.time;
    _this._t = data['\x74\x6f\x6b\x65\x6e'];
    console.log(_this);
    return data;
  },

  //微信获取用户信息
  getUserInfo: function (cb) {
    var _this = this;
    //获取微信用户信息
    wx.getUserInfo({
      success: function (res) {
        typeof cb == "function" && cb(res);
      },
      fail: function (res) {
        _this.showErrorModal('拒绝授权将导致无法关联学校帐号并影响使用，请重新打开医疗小程序再点击允许授权！', '授权失败');
        _this.g_status = '未授权';
      }
    });
  },


/**
 * 提供其他页面使用wx组件
 */
  //完善信息
  appendInfo: function (data) {
    var _this = this;
    _this.cache = {};
    wx.clearStorage();//清楚缓存
    _this._user.we.build = data.build || '';
    _this._user.we.room = data.room || '';
  },
 
  showErrorModal: function (content, title) {
    wx.showModal({
      title: title || '加载失败',
      content: content || '未知错误',
      showCancel: false
    });
  },
  showLoadToast: function (title, duration) {
    wx.showToast({
      title: title || '加载中',
      icon: 'loading',
      mask: true,
      duration: duration || 10000
    });
  },


  util: require('./utils/util'),
  /**
   * app相应对象
   */
  key: function (data) { return this.util.key(data) },
  enCodeBase64: function (data) { return this.util.base64.encode(data) },
  cache: {},
  _user: {
    //微信数据
    wx: {},
    //员工\管理员\财务处
    we: {}
  },
  _time: {}, //当前周数

  // 全局对象
  globalData: {
    _version: 'v1.0.0',
    _wechat: 'hecorewecha',
    _descrition: '枫柚master',
    _name: '医疗系统',
    _author: 'hecore',
    _server: 'https://te.hecore.com'
  }
})