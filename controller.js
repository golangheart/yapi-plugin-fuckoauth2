const axios = require('axios')
const find = require('lodash.find')
const yapi = require('yapi.js');
const baseController = require('controllers/base.js');

class oauth2Controller extends baseController {
  constructor(ctx) {
    super(ctx);
  }

  /**
   * oauth2回调
   * @param {*} ctx
   */
  async oauth2Callback(ctx) {
    // 获取code和state
    const oauthcode = ctx.request.query.code;
    if (!oauthcode) {
      return (ctx.body = yapi.commons.resReturn(null, 400, 'code不能为空'));
    }

    // 获取oauth2配置信息
    const opts = loadOpts();
    if (!opts) {
      return (ctx.body = yapi.commons.resReturn(null, 400, 'fuckoauth2未配置，请配置后重新启动服务'));
    }

    const { authServer, tokenPath, clientId, clientSecret, redirectUri, authArgs } = opts.options;

    try {
      const tokenResult = await axios.request({
        method: 'POST',
        baseURL: authServer,
        url: tokenPath,
        params: {
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: oauthcode,
          redirect_uri: encodeURIComponent(redirectUri)
        }
      });

      if (tokenResult.status != 200) {
        console.error('oauth2Callback.status.error', tokenResult)
        ctx.body = yapi.commons.resReturn(null, tokenResult.status, tokenResult.statusText);
        return
      }

      ctx.redirect('/api/user/login_by_token?token=' + tokenResult.data.access_token);
      return
    } catch (err) {
      console.error('oauth2Callback.error', err)

      if (err.response) {
        ctx.body = yapi.commons.resReturn(null, 400, err.response.message);
      } else {
        ctx.body = yapi.commons.resReturn(null, 400, err.message);
      }
    }
  }
}

/**
 * 加载oauth2配置文件
 */
function loadOpts() {
  return find(yapi.WEBCONFIG.plugins, (plugin) => {
    return plugin.name === 'fuckoauth2';
  })
}

module.exports = oauth2Controller;