import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Layout, Typography, Space, Card } from 'antd';
import useDocuSignAuth from './hooks/useDocuSignAuth';
import SigningPage from './components/SigningPage';

// Landing page simple
// Snakbar on sending the document

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const { accessToken, login, logout } = useDocuSignAuth();

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0f4ff, #e6f7ff)' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <Title level={3} style={{ color: 'white', lineHeight: '64px', margin: 0 }}>
          DocuSign Integration
        </Title>
      </Header>

      <Content style={{display: "flex", justifyContent: "center", alignItems: "center" }}>
        {!accessToken ? (
          <Card style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "400px"}}>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src="https://play-lh.googleusercontent.com/1fqmsQDxaBDhvgVq2ceqB4ij46YJ1P7pwIrAkIOBml9fbIMO8RZe1Q7bAwp4-VXetaw=w480-h960-rw" style={{width: "100px"}} alt="" />
              <Button style={{borderRadius: 4}} type="primary" size="large" onClick={login}>
                Login with DocuSign
              </Button>
            </div>
          </Card>
        ) : (
          <SigningPage />
        )}
      </Content>
    </Layout>
    // <Layout style={{height: "100vh"}}>
    //   {/* Header */}
    //   <header
    //     style={{
    //       display: 'flex',
    //       justifyContent: 'space-between',
    //       alignItems: 'center',
    //       position: 'fixed',
    //       backgroundColor: 'white',
    //       width: '100%',
    //       zIndex: 1000,
    //     }}
    //   >
    //     <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
    //       <img src={"https://images.ctfassets.net/3fcisxc3a6xz/docusign_logo_black_text_on_white_0.png/90872cd475f92acafc7c490c93976e40/ds-logo-on-white.png"} alt="Logo" style={{ height: 45, width: 120 }} />
    //     </div>

    //     <>
    //       <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10 }}>
    //         <Button
    //           onClick={
    //             localStorage.getItem("docusign_access_token") 
    //             ? logout
    //             : login
    //           }
    //           style={{
    //             backgroundColor: 'black',
    //             fontSize: '0.875rem',
    //             fontWeight: 600,
    //             color: 'white',
    //             padding: '10px 28px',
    //             borderRadius: '4px',
    //             cursor: 'pointer',
    //             transition: 'all 0.3s ease',
    //           }}
    //           onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1f2937')}
    //           onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'black')}
    //         >
    //           {
    //             localStorage.getItem("docusign_access_token") 
    //             ? "Logout"
    //             : "Login"
    //           }
    //         </Button>
    //       </div>
    //     </>
    //   </header>
    //   <Content style={{display: "flex", justifyContent: "center", alignItems: "center" }}>
    //     {!accessToken ? (
    //         <div style={{ width: '100%', minHeight: '100%', backgroundColor: 'white' }}>
    //           <div style={{ margin: '0 auto' }}>
    //             {/* Hero Section */}
    //             <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f7f9fc', height: "100vh" }}>
    //               <div
    //                 style={{
    //                   display: 'flex',
    //                   flexWrap: 'wrap',
    //                   maxWidth: 1200,
    //                   padding: 20,
    //                   gap: 40,
    //                   alignItems: 'center',
                      
    //                 }}
    //               >
    //                 <div style={{ flex: '1 1 500px', paddingRight: 16 }}>
    //                   <span>{"37,365"} resumes created today</span>
    //                   <h1
    //                     style={{
    //                       fontSize: '2.5rem',
    //                       fontWeight: 'bold',
    //                       marginBottom: '24px',
    //                       lineHeight: '1.3',
    //                     }}
    //                   >
    //                     Built-in DocuSign Integration {" "}
    //                     <span
    //                       style={{
    //                         background:
    //                           'radial-gradient(circle, #7182ff 0%, #3cff52 100%)',
    //                         backgroundClip: 'text',
    //                         WebkitBackgroundClip: 'text',
    //                         color: 'transparent',
    //                         backgroundSize: '200% 200%',
    //                         animation: 'text-shine 2s infinite linear',
    //                       }}
    //                     >
    //                       Simple Scalable Secure
    //                     </span>
    //                   </h1>
    //                   <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: 24 }}>
    //                     Empower your users to send and sign documents without leaving your platform—seamlessly integrated with DocuSign APIs.
    //                   </p>

    //                   {/* Stats */}
    //                   <div style={{ display: 'flex', marginTop: 40 }}>
    //                     <div style={{ marginRight: 40, paddingLeft: 8 }}>
    //                       <span
    //                         style={{
    //                           backgroundColor: '#dcfce7',
    //                           fontSize: '1.5rem',
    //                           fontWeight: 600,
    //                           color: '#22c55e',
    //                           padding: '2px 6px',
    //                         }}
    //                       >
    //                         72%
    //                       </span>
    //                       <br />
    //                       <span style={{ marginLeft: 8, color: '#9ca3af' }}>                  
    //                         faster document turnaround time
    //                       </span>
    //                     </div>
    //                     <div style={{ marginRight: 40, paddingLeft: 8 }}>
    //                       <span
    //                         style={{
    //                           backgroundColor: '#ffedd5',
    //                           fontSize: '1.5rem',
    //                           fontWeight: 600,
    //                           color: '#f97316',
    //                           padding: '2px 6px',
    //                         }}
    //                       >
    //                         80%
    //                       </span>
    //                       <br />
    //                       <span style={{ marginLeft: 8, color: '#9ca3af', fontWeight: 600 }}>
    //                         reduction in signature errors
    //                       </span>
    //                     </div>
    //                   </div>
    //                 </div>

    //                 {/* Hero Image */}
    //                 <div style={{ flex: '1 1 400px' }}>
    //                   <img
    //                     src={"https://static.vecteezy.com/system/resources/previews/002/179/700/non_2x/digital-smart-contract-for-electronic-sign-document-agreement-security-finance-legal-corporate-digital-phone-security-with-shield-and-padlock-security-protection-vector.jpg"}
    //                     alt="Hero"
    //                     style={{ width: '100%', borderRadius: '8px', maxHeight: 500 }}
    //                   />
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //     ) : (
    //       <SigningPage />
    //     )}
    //   </Content>
    // </Layout>
  );
}

export default App;
