import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history, request, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Divider,
  Grid,
  message,
  Modal,
  Row,
  Tag,
  Upload,
} from 'antd';
import { useState } from 'react';

const { useBreakpoint } = Grid;

const OrderEdit: React.FC = () => {
  const params = useParams();
  const [form] = ProForm.useForm();
  const screens = useBreakpoint();
  const [videoFile, setVideoFile] = useState<any>(null);
  const [displayVideoUrl, setDisplayVideoUrl] = useState<string>('');

  // --- 核心逻辑 1：获取数据 ---
  const loadData = async () => {
    const res = await request(`/api/orders/${params.id}`);
    if (res.data?.video_url) {
      const currentHost = window.location.hostname;
      // 动态获取 IP 确保手机能看
      setDisplayVideoUrl(`http://${currentHost}:3000${res.data.video_url}`);
    }
    return res.data;
  };

  // --- 核心逻辑 2：提交保存 (包含视频上传) ---
  const onFinish = async (values: any) => {
    const hide = message.loading('正在同步数据...', 0);
    try {
      let finalVideoUrl = form.getFieldValue('video_url');

      // 如果有新视频文件，先调接口上传
      if (videoFile) {
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('orderId', params.id as string);
        const uploadRes = await request('/api/upload', {
          method: 'POST',
          data: formData,
        });
        if (uploadRes.success) {
          finalVideoUrl = uploadRes.url;
        }
      }

      // 更新订单数据库
      await request(`/api/orders/${params.id}`, {
        method: 'PUT',
        data: { ...values, video_url: finalVideoUrl },
      });

      hide();
      message.success('保存成功');
      history.push('/orders');
    } catch (error) {
      hide();
      message.error('保存失败，请检查后端连接');
    }
  };

  // --- 辅助函数 ---
  const showVideo = () => {
    Modal.info({
      title: '预览存证视频',
      width: 800,
      centered: true,
      maskClosable: true,
      content: (
        <video
          src={displayVideoUrl}
          controls
          autoPlay
          style={{ width: '100%', borderRadius: 8, marginTop: 20 }}
        />
      ),
      footer: null,
    });
  };

  const handleBeforeUpload = (file: any) => {
    setVideoFile(file);
    setDisplayVideoUrl(URL.createObjectURL(file)); // 实时预览
    message.info('新视频已准备就绪');
    return false;
  };

  // --- 视图 A：手机版 UI (单列大间距) ---
  const MobileView = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Card title="📦 快递单号" bodyStyle={{ padding: '24px' }}>
        <ProFormText
          name="order_id"
          disabled
          fieldProps={{
            size: 'large',
            style: { fontWeight: 'bold', color: '#1890ff' },
          }}
        />
      </Card>

      <Card title="🎥 视频存证" bodyStyle={{ padding: '24px' }}>
        <div
          style={{
            background: '#f5f5f5',
            padding: '20px',
            borderRadius: '12px',
          }}
        >
          {displayVideoUrl ? (
            <Button
              block
              size="large"
              type="primary"
              ghost
              icon={<PlayCircleOutlined />}
              onClick={showVideo}
              style={{ marginBottom: 20 }}
            >
              点击预览当前视频
            </Button>
          ) : (
            <div
              style={{ textAlign: 'center', color: '#999', marginBottom: 20 }}
            >
              暂无视频
            </div>
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
              icon={<VideoCameraOutlined />}
              style={{ height: 50 }}
            >
              更换/录制视频
            </Button>
          </Upload>
        </div>
      </Card>

      <Card title="👤 收件信息" bodyStyle={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ProFormText
            name="customer_name"
            label="姓名"
            fieldProps={{ size: 'large' }}
          />
          <ProFormText
            name="phone"
            label="电话"
            fieldProps={{ size: 'large' }}
          />
          <ProFormTextArea
            name="address"
            label="地址"
            fieldProps={{ autoSize: { minRows: 3 } }}
          />
          <ProFormTextArea
            name="remark"
            label="备注"
            fieldProps={{ autoSize: { minRows: 4 } }}
          />
        </div>
      </Card>
    </div>
  );

  // --- 视图 B：电脑版 UI (左右布局) ---
  const DesktopView = (
    <Row gutter={[32, 32]}>
      <Col span={8}>
        <Card
          title="核心状态"
          style={{ height: '100%' }}
          bodyStyle={{ padding: '24px' }}
        >
          <ProFormText name="order_id" label="快递单号" disabled />
          <Divider />
          <p>
            视频状态：
            {displayVideoUrl ? (
              <Tag color="green">已关联</Tag>
            ) : (
              <Tag>待上传</Tag>
            )}
          </p>
          {displayVideoUrl && (
            <Button type="link" onClick={showVideo} style={{ padding: 0 }}>
              点击播放预览
            </Button>
          )}
          <div style={{ marginTop: 24 }}>
            <Upload
              accept="video/*"
              beforeUpload={handleBeforeUpload}
              showUploadList={false}
            >
              <Button icon={<VideoCameraOutlined />}>更换视频</Button>
            </Upload>
          </div>
        </Card>
      </Col>
      <Col span={16}>
        <Card title="详细资料" bodyStyle={{ padding: '24px' }}>
          <Row gutter={24}>
            <Col span={12}>
              <ProFormText name="customer_name" label="客户姓名" />
            </Col>
            <Col span={12}>
              <ProFormText name="phone" label="联系电话" />
            </Col>
            <Col span={24}>
              <ProFormTextArea
                name="address"
                label="收货地址"
                fieldProps={{ autoSize: { minRows: 2 } }}
              />
            </Col>
            <Col span={24}>
              <ProFormTextArea
                name="remark"
                label="面料备注"
                fieldProps={{ autoSize: { minRows: 4 } }}
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
        title: '编辑存证信息',
        extra: [
          <Button
            key="back"
            onClick={() => history.back()}
            icon={<ArrowLeftOutlined />}
          >
            返回列表
          </Button>,
        ],
      }}
    >
      <ProForm
        form={form}
        request={loadData}
        onFinish={onFinish}
        submitter={{
          render: (_, dom) => (
            <div
              style={{
                marginTop: 48,
                display: 'flex',
                flexDirection: screens.md ? 'row' : 'column',
                gap: 16,
                paddingBottom: 40,
              }}
            >
              {dom[1]} {dom[0]}
            </div>
          ),
          searchConfig: { submitText: '提交保存', resetText: '重置还原' },
        }}
      >
        {/* 根据屏幕宽度 自动切换 UI */}
        {screens.md ? DesktopView : MobileView}
      </ProForm>
    </PageContainer>
  );
};

export default OrderEdit;
