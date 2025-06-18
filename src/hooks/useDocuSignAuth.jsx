import { useEffect, useState } from 'react';
import { generateRandomString, sha256 } from '../utils/pkceUtils';
import { jwtDecode } from 'jwt-decode';

const clientId = process.env.REACT_APP_DOCUSIGN_CLIENT_ID;
const redirectUri = process.env.REACT_APP_DOCUSIGN_REDIRECT_URI;
const authEndpoint = process.env.REACT_APP_DOCUSIGN_AUTH_ENDPOINT;
const tokenEndpoint = process.env.REACT_APP_DOCUSIGN_TOKEN_ENDPOINT;
const revokeEndpoint = 'https://account.docusign.com/oauth/revoke';

export default function useDocuSignAuth() {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('docusign_access_token'));

  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp && decoded.exp > now;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('docusign_access_token');
    const code = new URLSearchParams(window.location.search).get('code');
    const storedCodeVerifier = localStorage.getItem('pkce_code_verifier');

    if (storedToken && isTokenValid(storedToken)) {
      setAccessToken(storedToken);
      return;
    } else {
      localStorage.removeItem('docusign_access_token');
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
            localStorage.setItem('docusign_access_token', data.access_token);
            setAccessToken(data.access_token);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.error('Token exchange failed:', data);
          }
        })
        .catch(err => console.error('Token fetch error:', err));
    }
  }, []);

  const login = async () => {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await sha256(codeVerifier);
    localStorage.setItem('pkce_code_verifier', codeVerifier);

    const authUrl = `${authEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=signature%20impersonation%20extended&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    window.location.href = authUrl;
  };

  const logout = async () => {
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
        console.log('Token successfully revoked');
      } catch (err) {
        console.error('Token revocation failed:', err);
      }
    }

    localStorage.removeItem('docusign_access_token');
    localStorage.removeItem('pkce_code_verifier');
    setAccessToken(null);
    window.location.reload(); // or route to homepage
  };

  return { accessToken, login, logout, setAccessToken };
}
