import { useEffect, useState } from 'react';
import { generateRandomString, sha256 } from '../utils/pkceUtils';
import { jwtDecode } from 'jwt-decode';
import { message } from 'antd';

const clientId = process.env.REACT_APP_DOCUSIGN_CLIENT_ID;
const redirectUri = process.env.REACT_APP_DOCUSIGN_REDIRECT_URI;
const authEndpoint = process.env.REACT_APP_DOCUSIGN_AUTH_ENDPOINT;
const tokenEndpoint = process.env.REACT_APP_DOCUSIGN_TOKEN_ENDPOINT;
const revokeEndpoint = process.env.REACT_APP_DOCUSIGN_REVOKE_TOKEN_ENDPOINT;

export default function useDocuSignAuth() {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('docusign_access_token'));
  const [messageApi, contextHolder] = message.useMessage();


  const isTokenValid = () => {
    const expiry = localStorage.getItem('docusign_token_expiry');
    return expiry && Date.now() < expiry;
  };


  const logout = async (triggeredBy = 'user') => {
    const token = localStorage.getItem('docusign_access_token');

    if (token) {
      try {
        const credentials = btoa(`${clientId}:`);
        await fetch(revokeEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
          body: new URLSearchParams({ token }),
        });
        localStorage.setItem('docusign_token_expiry', `${null}`);
        console.log('Token successfully revoked');
      } catch (err) {
        console.error('Token revocation failed:', err);
      }
    }

    localStorage.removeItem('docusign_access_token');
    localStorage.removeItem('pkce_code_verifier');
    setAccessToken(null);

    if (triggeredBy === 'expired') {
      messageApi.error('Session expired. Please login again.');
    }

    window.location.reload(); // Or redirect to login
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('docusign_access_token');
    const code = new URLSearchParams(window.location.search).get('code');
    const storedCodeVerifier = localStorage.getItem('pkce_code_verifier');

    if (storedToken && isTokenValid(storedToken)) {
      setAccessToken(storedToken);
      return;
    }

    // Token expired or invalid
    if (storedToken && !isTokenValid(storedToken)) {
      logout('expired');
      return;
    }

    if (code && storedCodeVerifier) {
      fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          code_verifier: storedCodeVerifier,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            const expiryTimestamp = Date.now() + data.expires_in * 1000;

            console.log("expiryTimestamp", expiryTimestamp)
            localStorage.setItem('docusign_access_token', data.access_token);
            localStorage.setItem('docusign_token_expiry', `${expiryTimestamp}`);

            setAccessToken(data.access_token);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.error('Token exchange failed:', data);
            logout('expired'); // fail-safe if token is not received
          }
        })
        .catch(err => {
          console.error('Token fetch error:', err);
          logout('expired');
        });
    }
  }, []);

  const login = async () => {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await sha256(codeVerifier);
    localStorage.setItem('pkce_code_verifier', codeVerifier);

    const authUrl = `${authEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=signature%20impersonation%20extended&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    window.location.href = authUrl;
  };

  return { accessToken, login, logout, setAccessToken };
}
