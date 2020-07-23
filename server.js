const axios = require('axios');
const get = require('lodash.get')
const find = require('lodash.find')
const yapi = require('yapi.js');
const baseController = require('controllers/base.js');

function gets(obj, keys) {
  let value = ''

  if (Array.isArray(keys)) {
    keys.some((key) => {
      const v = get(obj, key)
      if (v) {
        value = v;
        return true
      }

      return false
    })
  } else {
    value = get(obj, keys)
  }
  return value
}

/**
 * 加载oauth2配置文件
 */
function loadOpts() {
  return find(yapi.WEBCONFIG.plugins, (plugin) => {
    return plugin.name === 'fuckoauth2';
  })
}

module.exports = function (options) {
  const { authServer, infoPath, tokenPath, clientId, clientSecret, userKey, emailKey, redirectUri } = options;

  this.bindHook('third_login', async (ctx) => {

    const code = ctx.request.body.code || ctx.request.query.code;
    
    const tokenResult = await axios.request({
      method: 'POST',
      baseURL: authServer,
      url: tokenPath,
      params: {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: encodeURIComponent(redirectUri)
      }
    });

    if (tokenResult.status != 200) {
      console.error('exchange token err', tokenResult)
      throw new Error(`${tokenResult.status} ${tokenResult.statusText}`)
      return
    }

    const token = tokenResult.data.access_token

    const info = await axios.request({
      method: 'GET',
      baseURL: authServer,
      url: infoPath,
      headers: {
        'Authorization': 'Bearer ' + token
    }
    });

    if (info.status != 200) {
      console.error('third_login.error', info)
      throw new Error(`${info.status} ${info.statusText}`)
    }

    return {
      username: gets(info.data, userKey),
      email: gets(info.data, emailKey)
    };
  });
}