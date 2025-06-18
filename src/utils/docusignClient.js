import axios from 'axios';

export async function sendEnvelopeWithTemplate({ accessToken, templateId, fieldValues, signerName, signerEmail }) {
  const proxyURI = 'http://localhost:8080';

  try {
    const userInfo = await fetch('https://account-d.docusign.com/oauth/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => res.json());

    const accountId = userInfo.accounts[0].account_id;
    const baseURI = userInfo.accounts[0].base_uri;

    const textTabs = [];
    const dateTabs = [];

    Object.entries(fieldValues).forEach(([label, value]) => {
      if (label.toLowerCase().includes('date')) {
        dateTabs.push({ tabLabel: label, value });
      } else {
        textTabs.push({ tabLabel: label, value });
      }
    });

    const payload = {
      templateId,
      status: 'sent',
      templateRoles: [{
        roleName: "Signer",
        name: signerName,
        email: signerEmail,
        tabs: {
          textTabs,
          dateTabs,
        },
      }],
    };

    console.log("Payload being sent to proxy:", JSON.stringify(payload, null, 2));


    const response = await axios.post(
      `${proxyURI}/api/envelopes`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          account_id: accountId,
          baseURI,
        },
      }
    );

    return response.data.envelopeId;

  } catch (err) {
    console.error('Error sending envelope:', err.message);
    throw err;
  }
}

export async function listTemplates() {
  try {
    const accessToken = localStorage.getItem('docusign_access_token');
    const userInfo = await fetch('https://account-d.docusign.com/oauth/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => res.json());

    const accountId = userInfo.accounts[0].account_id;
    const baseURI = userInfo.accounts[0].base_uri;
    const proxyURI = 'http://localhost:8080'

    const templates = await axios.get(`${proxyURI}/api/templates?account_id=${accountId}&baseURI=${baseURI}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return templates.data;
    
  } catch (err) {
    console.log(err);
  }
}

export async function templateDetail(templateId) {
  try {
    const accessToken = localStorage.getItem('docusign_access_token');
    const userInfo = await fetch('https://account-d.docusign.com/oauth/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => res.json());

    const accountId = userInfo.accounts[0].account_id;
    const baseURI = userInfo.accounts[0].base_uri;
    const proxyURI = 'http://localhost:8080'

    const templates = await axios.get(`${proxyURI}/api/templates/${templateId}?account_id=${accountId}&baseURI=${baseURI}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return templates.data;
    
  } catch (err) {
    console.log(err);
  }
}
