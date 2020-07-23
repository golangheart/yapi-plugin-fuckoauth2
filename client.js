import React, {Component} from 'react'

module.exports = function (options) {
  const handleLogin = () => {
    const { authServer, authPath, redirectUri, clientId, state = "foobar" } = options;

    const target = `${authServer}${authPath}?response_type=code&client_id=${clientId}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}}`;
    location.href = target
  }

  const SSOComponent = () => {
    return (<button onClick={handleLogin}>SSO登录</button>)
  }
  this.bindHook('third_login', SSOComponent);
};
