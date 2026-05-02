import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { history, request } from '@umijs/max';
import {
  Button,
  Card,
  Grid,
  Input,
  List,
  message,
  Modal,
  Popconfirm,
  Space,
  Tag,
} from 'antd';
import { useEffect, useState } from 'react';

const { useBreakpoint } = Grid;

const OrderList: React.FC = () => {
  const screens = useBreakpoint();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // --- 核心逻辑：获取数据 ---
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await request('/api/orders');
      setData(res.data || []);
    } catch (e) {
      message.error('加载失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 辅助：预览视频 ---
  const showVideo = (url: string) => {
    if (!url) {
      message.warning('该单据暂无存证视频');
      return;
    }
    const currentHost = window.location.hostname;
    const fullUrl = `http://${currentHost}:3000${url}`;
    Modal.info({
      title: '查看视频',
      width: 600,
      centered: true,
      maskClosable: true,
      content: (
        <video
          src={fullUrl}
          controls
          autoPlay
          style={{ width: '100%', marginTop: 20, borderRadius: 8 }}
        />
      ),
      footer: null,
    });
  };

  // --- 辅助：删除 ---
  const handleDelete = async (id: string) => {
    await request(`/api/orders/${id}`, { method: 'DELETE' });
    message.success('已删除');
    loadData();
  };

  // --- 视图 1：电脑端表格 (PC View) ---
  const columns: ProColumns[] = [
    { title: '快递单号', dataIndex: 'order_id', copyable: true },
    { title: '客户姓名', dataIndex: 'customer_name' },
    { title: '手机号', dataIndex: 'phone' },
    {
      title: '视频状态',
      dataIndex: 'video_url',
      render: (url) =>
        url ? <Tag color="green">已关联</Tag> : <Tag>未录制</Tag>,
    },
    { title: '时间', dataIndex: 'createdAt', valueType: 'dateTime' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <a onClick={() => history.push(`/orders/edit/${record.order_id}`)}>
            编辑
          </a>
          <a onClick={() => showVideo(record.video_url)}>视频</a>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDelete(record.order_id)}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- 视图 2：手机端列表 (Mobile View) ---
  const MobileView = (
    <div style={{ padding: '0 4px' }}>
      {/* 手机端专用搜索框 */}
      <Input
        placeholder="输入单号或备注搜索..."
        prefix={<SearchOutlined />}
        allowClear
        style={{
          marginBottom: 16,
          borderRadius: 8,
          height: 45,
          fontSize: '16px',
        }}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <List
        loading={loading}
        dataSource={data.filter(
          (item) =>
            item.order_id?.includes(searchText) ||
            item.remark?.includes(searchText),
        )}
        renderItem={(item) => (
          <Card
            key={item.order_id}
            style={{
              marginBottom: 16,
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            bodyStyle={{ padding: '20px' }}
          >
            {/* 1. 第一行：大字号显示单号 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: 4 }}>
                快递单号
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1890ff',
                  letterSpacing: '0.5px',
                }}
              >
                {item.order_id}
              </div>
            </div>

            {/* 2. 第二行：显示备注（背景色区分） */}
            <div
              style={{
                background: '#fff7e6',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ffe7ba',
                marginBottom: 20,
              }}
            >
              <div
                style={{ fontSize: '12px', color: '#fa8c16', marginBottom: 4 }}
              >
                面料/打包备注
              </div>
              <div
                style={{ fontSize: '16px', color: '#595959', fontWeight: 500 }}
              >
                {item.remark || '无备注信息'}
              </div>
            </div>

            {/* 3. 第三行：操作按钮 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                style={{ flex: 1, height: '40px', borderRadius: '6px' }}
                icon={<EditOutlined />}
                onClick={() => history.push(`/orders/edit/${item.order_id}`)}
              >
                修改
              </Button>
              <Button
                style={{ flex: 1, height: '40px', borderRadius: '6px' }}
                type="primary"
                ghost
                icon={<VideoCameraOutlined />}
                onClick={() => showVideo(item.video_url)}
              >
                视频
              </Button>
              <Popconfirm
                title="确定撤销此单？"
                onConfirm={() => handleDelete(item.order_id)}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  style={{ height: '40px' }}
                />
              </Popconfirm>
            </div>
          </Card>
        )}
      />
    </div>
  );
  return (
    <PageContainer
      header={{
        title: '存证管理',
        extra: [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => history.push('/orders/add')}
            block={!screens.md}
          >
            新建存证单
          </Button>,
        ],
      }}
    >
      {/* 核心判断：如果有 md 尺寸（电脑），显示 ProTable；否则显示 MobileView */}
      {screens.md ? (
        <ProTable
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="order_id"
          search={false}
          options={{ reload: loadData }}
          pagination={{ pageSize: 10 }}
        />
      ) : (
        MobileView
      )}
    </PageContainer>
  );
};

export default OrderList;
