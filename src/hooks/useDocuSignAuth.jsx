// // File: useDocuSignAuth.js
// import { useEffect, useState } from 'react';
// import { generateRandomString, sha256 } from '../utils/pkceUtils';

// const clientId = '91f7cb1e-3e1d-4a04-8a2e-ca36534bfecf'; // Integration Key
// const redirectUri = 'http://localhost:3000';
// const authEndpoint = 'https://account-d.docusign.com/oauth/auth';
// const tokenEndpoint = 'https://account-d.docusign.com/oauth/token';

// export default function useDocuSignAuth() {
//   const [accessToken, setAccessToken] = useState(null);

//   useEffect(() => {
//     const code = new URLSearchParams(window.location.search).get('code');
//     const storedCodeVerifier = localStorage.getItem('pkce_code_verifier');

//     if (code && storedCodeVerifier) {
//       fetch(tokenEndpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams({
//           grant_type: 'authorization_code',
//           code,
//           redirect_uri: redirectUri,
//           client_id: clientId,
//           code_verifier: storedCodeVerifier,
//         }),
//       })
//         .then(res => res.json())
//         .then(data => setAccessToken(data.access_token))
//         .catch(console.error);
//     }
//   }, []);

//   const login = async () => {
//     const codeVerifier = generateRandomString(64);
//     const codeChallenge = await sha256(codeVerifier);
//     localStorage.setItem('pkce_code_verifier', codeVerifier);

//     const authUrl = `${authEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=signature%20impersonation%20extended&code_challenge=${codeChallenge}&code_challenge_method=S256`;

//     window.location.href = authUrl;
//   };

//   return { accessToken, login };
// }


import { useEffect, useState } from 'react';
import { generateRandomString, sha256 } from '../utils/pkceUtils';
import { jwtDecode } from 'jwt-decode';

const clientId = '91f7cb1e-3e1d-4a04-8a2e-ca36534bfecf';
const redirectUri = 'http://localhost:3000';
const authEndpoint = 'https://account-d.docusign.com/oauth/auth';
const tokenEndpoint = 'https://account-d.docusign.com/oauth/token';

export default function useDocuSignAuth() {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('docusign_access_token');
    const code = new URLSearchParams(window.location.search).get('code');
    const storedCodeVerifier = localStorage.getItem('pkce_code_verifier');

    // 1. If token exists, check if it's valid
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken || "");
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp > now) {
          setAccessToken(storedToken);
          return;
        } else {
          // Token expired
          localStorage.removeItem('docusign_access_token');
        }
      } catch (e) {
        console.error('Invalid token in localStorage:', e);
        localStorage.removeItem('docusign_access_token');
      }
    }

    // 2. If redirected from DocuSign with code, fetch token
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
            setAccessToken(data.access_token);
            localStorage.setItem('docusign_access_token', data.access_token);
            window.history.replaceState({}, document.title, window.location.pathname); // Remove ?code=
          } else {
            console.error('Failed to get access token:', data);
          }
        })
        .catch(console.error);
    }
  }, []);

  const login = async () => {
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await sha256(codeVerifier);
    localStorage.setItem('pkce_code_verifier', codeVerifier);

    const authUrl = `${authEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=signature%20impersonation%20extended&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    window.location.href = authUrl;
  };

  return { accessToken, login, setAccessToken };
}
