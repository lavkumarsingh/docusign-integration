import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Typography,
  Card,
  Select,
  DatePicker,
  message,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  sendEnvelopeWithTemplate,
  listTemplates,
  tabDetails,
  templateDetail,
} from '../utils/docusignClient';
import { extractDocGenFormFields } from '../utils/parse';
import dayjs from 'dayjs';

function SigningPage() {
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateDetails, setTemplateDetails] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [sending, setSending] = useState(false);
  const accessToken = localStorage.getItem('docusign_access_token');

  const handleSubmit = async (values) => {
    setSending(true);
    try {
      const formatted = {
        ...values,
        ...Object.fromEntries(
          Object.entries(values)
            .filter(([key, val]) => dayjs.isDayjs(val))
            .map(([key, val]) => [key, val.format('DD-MM-YYYY')])
        ),
      };

      const signerName = formatted.signerName;
      const signerEmail = formatted.signerEmail;
      delete formatted.signerName;
      delete formatted.signerEmail;

      await sendEnvelopeWithTemplate({
        accessToken,
        templateId: selectedTemplate,
        signerName,
        signerEmail,
        fieldValues: formatted,
      });

      message.success('Envelope sent for signature successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error sending envelope:', error);
      message.error(error?.message || 'Failed to send the document for signature.');
    } finally {
      setSending(false);
    }
  };

  const getTemplateList = async () => {
    setLoadingTemplates(true);
    try {
      const list = await listTemplates();
      setTemplates(list?.envelopeTemplates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      message.error('Failed to load templates. Please try again.');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const getDynamicFields = async () => {
    if (!selectedTemplate) return;
    setLoadingFields(true);
    try {
      const details = await templateDetail(selectedTemplate);
      setTemplateDetails(details || []);
      
        console.log("Dynamic Field", details);
    } catch (error) {
      console.error('Error fetching template details:', error);
      message.error('Failed to load template details.');
    } finally {
      setLoadingFields(false);
    }
  };

    useEffect(() => {
        getTemplateList();
    }, []);

    useEffect(() => {
        console.log(selectedTemplate);
        getDynamicFields();
    }, [selectedTemplate])

    useEffect(() => {
        const data = extractDocGenFormFields(templateDetails)
        setDynamicFields(data);
    }, [templateDetails]);

  return (
    <Card
      title="Send Document for Signature"
      bordered={false}
      style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
    >
      <Typography style={{ fontWeight: 600, marginBottom: 10 }}>
        Select Template
      </Typography>

      <Select
        style={{ width: '100%', borderRadius: 4 }}
        placeholder="Select a template"
        onChange={(templateId) => setSelectedTemplate(templateId)}
        loading={loadingTemplates}
      >
        {templates.map((template) => (
          <Select.Option key={template.templateId} value={template.templateId}>
            {template.name}
          </Select.Option>
        ))}
      </Select>

      <Spin spinning={loadingFields}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          style={{ marginTop: 20 }}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Signer Name"
                        name="signerName"
                        rules={[{ required: true, message: 'Please input Signer Name' }]}
                    >
                        <Input placeholder="Signer Name" />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        label="Signer Email"
                        name="signerEmail"
                        rules={[
                        { required: true, message: 'Please input Signer Email' },
                        { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input placeholder="Signer Email" />
                    </Form.Item>
                </Col>

                {templateDetails.map((field) => (
                    <Col span={12}>
                        <Form.Item
                        key={field.value}
                        label={field.value}
                        name={field.value}
                        rules={[{ required: true, message: `Please input ${field.label}` }]}
                        >
                        {field.tabType === 'date' ? (
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        ) : (
                            <Input placeholder={field.label} />
                        )}
                        </Form.Item>
                    </Col>
                ))}
            </Row>
            {
                selectedTemplate && <Row>
                <Form.Item style={{width: "100%"}}>
                    <Button type="primary" style={{width: "100%", borderRadius: 4, backgroundColor: "black"}} htmlType="submit" block loading={sending}>
                    🚀 Send for Signature
                    </Button>
                </Form.Item>
            </Row>
            }
        </Form>
      </Spin>
    </Card>
  );
}

export default SigningPage;
