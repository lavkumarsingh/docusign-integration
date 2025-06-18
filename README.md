# 📄 DocuSign Integration Architecture with PKCE & Proxy API Gateway

This project demonstrates a secure and modular integration between a frontend client and DocuSign using the PKCE (Proof Key for Code Exchange) flow for authentication, and a Node.js proxy server to handle all other DocuSign API operations.

---

## ⚙️ Architecture Overview

```
+---------------------+      PKCE Auth      +--------------------+
|                     | <-----------------> |                    |
|   Frontend Client   |                    |   DocuSign Auth     |
|   (React/HTML/CSS)  |                    |      Server         |
|                     |                    +--------------------+
|                     |
|                     |       API Calls     +--------------------+
|                     | <-----------------> |  Node.js Proxy API |
+---------------------+                    |     Gateway         |
                                          +--------------------+
                                                    |
                                                    | DocuSign REST API Calls
                                                    v
                                          +-----------------------------+
                                          |        DocuSign API         |
                                          +-----------------------------+
```

---

## 🔐 Authentication: PKCE Flow

* The frontend directly handles **OAuth 2.0 with PKCE** against DocuSign for secure authentication.
* No sensitive credentials are exposed to the client.
* Tokens obtained are stored in memory/session for making authorized API calls via proxy.

---

## 🔀 Proxy Server (Node.js)

To avoid exposing DocuSign API credentials or secrets, all DocuSign **resource APIs** (after auth) are routed through a proxy Node.js server. This allows:

* Hiding API keys or client secrets
* Custom validation and logging
* Rate limiting or analytics
* Avoiding CORS issues on frontend

---

## 🔌 DocuSign Endpoints Used

| Functionality          | Method | Endpoint                                                                                              |
| ---------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| 📄 **List Templates**  | `GET`  | `https://demo.docusign.net/restapi/v2.1/accounts/<accountId>/templates`                               |
| 🧾 **Tab Details**     | `GET`  | `https://demo.docusign.net/restapi/v2.1/accounts/<accountId>/templates/<templateId>/documents/1/tabs` |
| ✉️ **Envelope Create** | `POST` | `https://demo.docusign.net/restapi/v2.1/accounts/<accountId>/envelopes`                               |

> These API calls are **proxied** through the Node.js server to keep security intact and maintain separation of concerns.

---

## 📦 Folder Structure

```
.
├── client/                   # Frontend App (React or HTML)
│   └── handles PKCE Flow
├── server/                   # Node.js Proxy API
│   └── Routes for DocuSign APIs
├── README.md
```

---

## 🚀 How It Works

1. **User opens frontend app** and logs in via DocuSign using PKCE.
2. **Access token is stored** in frontend after successful auth.
3. Frontend **calls proxy API** (Node.js) for:

   * Listing templates
   * Fetching tab definitions from template
   * Creating envelopes with dynamic tab data
4. Node.js server **authenticates request**, appends authorization headers, and calls DocuSign endpoints.

---

## ✅ Security Advantages

* PKCE protects against token interception attacks.
* Proxy ensures API credentials and logic are never exposed to the browser.
* CORS, rate limiting, and auditing can be handled on the backend.

---

## 📄 Sample Proxy Route (Node.js)

```js
app.get('/api/templates', async (req, res) => {
  const { accountId } = req.query;
  const token = req.headers.authorization;

  const response = await axios.get(
    `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/templates`,
    { headers: { Authorization: token } }
  );

  res.json(response.data);
});
```

