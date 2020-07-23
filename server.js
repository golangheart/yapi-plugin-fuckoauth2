const axios = require('axios');
const get = require('lodash.get')
const controller = require('./controller');

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

module.exports = function (options) {
  const { authServer, infoPath, userKey, emailKey } = options;

  this.bindHook('third_login', async (ctx) => {
    const token = ctx.request.body.token || ctx.request.query.token;

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

  this.bindHook('add_router', function (router) {
    router({
      controller: controller,
      method: 'get',
      path: 'oauth2/callback',
      action: 'oauth2Callback'
    });
  });
}