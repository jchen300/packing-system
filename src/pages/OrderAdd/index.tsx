import {
  SaveOutlined,
  ScanOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history, request } from '@umijs/max';
import { Button, Card, Col, Divider, Grid, message, Row, Upload } from 'antd';
import { useState } from 'react';

const { useBreakpoint } = Grid;

const OrderAdd: React.FC = () => {
  const [form] = ProForm.useForm();
  const screens = useBreakpoint();
  const [videoFile, setVideoFile] = useState<any>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  // --- 核心逻辑：提交保存 ---
  const onFinish = async (values: any) => {
    if (!videoFile) {
      await request('/api/orders', {
        method: 'POST',
        data: { ...values, video_url: '' }, // 先创建订单，视频URL留空
      });
      message.success('新订单创建成功');
      history.push('/orders');
      return;
    }

    const hide = message.loading('正在创建订单并上传视频...', 0);
    try {
      // 1. 上传视频获取 URL
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('orderId', values.order_id);

      const uploadRes = await request('/api/upload', {
        method: 'POST',
        data: formData,
      });

      if (!uploadRes.success) throw new Error('视频上传失败');

      // 2. 提交表单数据到数据库
      await request('/api/orders', {
        method: 'POST',
        data: { ...values, video_url: uploadRes.url },
      });

      hide();
      message.success('新订单创建成功');
      history.push('/orders');
    } catch (error) {
      hide();
      message.error('创建失败，请检查网络或后端状态');
    }
  };

  // 处理视频选择
  const handleBeforeUpload = (file: any) => {
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    message.success('视频已锁定，准备上传');
    return false;
  };

  // --- 视图 A：手机版 UI (极致单列，防止溢出) ---
  const MobileView = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 第一步：单号扫描 */}
      <Card title="第一步：录入单号" bodyStyle={{ padding: '24px' }}>
        <ProFormText
          name="order_id"
          label="快递单号"
          placeholder="请扫码或手动输入"
          rules={[{ required: true, message: '单号必填' }]}
          fieldProps={{
            size: 'large',
            prefix: <ScanOutlined style={{ color: '#1890ff' }} />,
            style: { fontSize: '18px' },
          }}
        />
      </Card>

      {/* 第二步：视频拍摄 */}
      <Card title="第二 step：拍摄打包视频" bodyStyle={{ padding: '24px' }}>
        <div
          style={{
            background: '#fafafa',
            padding: '20px',
            borderRadius: '12px',
            border: '1px dashed #d9d9d9',
          }}
        >
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              style={{ width: '100%', marginBottom: 16, borderRadius: 8 }}
            />
          )}
          <Upload
            accept="video/*"
            maxCount={1}
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
          >
            <Button
              block
              size="large"
              type="primary"
              icon={<VideoCameraOutlined />}
              style={{ height: 60 }}
            >
              {videoPreview ? '重新拍摄视频' : '点此录制视频'}
            </Button>
          </Upload>
        </div>
      </Card>

      {/* 第三步：详细备注 */}
      <Card title="第三步：收件详情" bodyStyle={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ProFormText
            name="customer_name"
            label="收件人姓名"
            fieldProps={{ size: 'large' }}
          />
          <ProFormText
            name="phone"
            label="联系电话"
            fieldProps={{ size: 'large' }}
          />
          <ProFormTextArea
            name="address"
            label="详细地址"
            fieldProps={{ autoSize: { minRows: 3 } }}
          />
          <ProFormTextArea
            name="remark"
            label="面料备注"
            placeholder="如：3米香云纱花色A"
            fieldProps={{ autoSize: { minRows: 4 } }}
          />
        </div>
      </Card>
    </div>
  );

  // --- 视图 B：电脑版 UI (分栏美观) ---
  const DesktopView = (
    <Row gutter={[32, 32]}>
      <Col span={10}>
        <Card title="物流及存证" style={{ height: '100%' }}>
          <ProFormText
            name="order_id"
            label="快递单号"
            rules={[{ required: true }]}
            fieldProps={{ prefix: <ScanOutlined /> }}
          />
          <Divider>视频存证</Divider>
          <div style={{ textAlign: 'center' }}>
            {videoPreview ? (
              <video
                src={videoPreview}
                controls
                style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
              />
            ) : (
              <div
                style={{
                  height: 150,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                待上传视频
              </div>
            )}
            <Upload
              accept="video/*"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
            >
              <Button icon={<VideoCameraOutlined />}>选择打包录像</Button>
            </Upload>
          </div>
        </Card>
      </Col>
      <Col span={14}>
        <Card title="收件人信息" style={{ height: '100%' }}>
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText name="customer_name" label="姓名" />
            </Col>
            <Col span={12}>
              <ProFormText name="phone" label="电话" />
            </Col>
            <Col span={24}>
              <ProFormTextArea name="address" label="收货地址" />
            </Col>
            <Col span={24}>
              <ProFormTextArea
                name="remark"
                label="发货备注"
                fieldProps={{ autoSize: { minRows: 6 } }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );

  return (
    <PageContainer
      header={{
        title: '新建香云纱存证单',
        onBack: () => history.back(),
        extra: [
          <Button key="cancel" onClick={() => history.back()}>
            取消返回
          </Button>,
        ],
      }}
    >
      <ProForm
        form={form}
        onFinish={onFinish}
        submitter={{
          render: () => (
            <div
              style={{
                marginTop: 40,
                display: 'flex',
                flexDirection: screens.md ? 'row' : 'column',
                gap: 16,
                paddingBottom: 60,
              }}
            >
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={() => form.submit()}
                style={{ flex: 2, height: 50 }}
              >
                创建
              </Button>
              <Button
                size="large"
                onClick={() => history.back()}
                style={{ flex: 1, height: 50 }}
              >
                取消
              </Button>
            </div>
          ),
        }}
      >
        {/* 根据屏幕宽度 自动切换 UI */}
        {screens.md ? DesktopView : MobileView}
      </ProForm>
    </PageContainer>
  );
};

export default OrderAdd;
