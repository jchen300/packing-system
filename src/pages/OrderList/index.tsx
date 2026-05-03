import { printLabels } from '@/utils/print'; // 1. 引入工具
import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  ActionType,
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
import { useRef, useState } from 'react';

const { useBreakpoint } = Grid;

const OrderList: React.FC = () => {
  const screens = useBreakpoint();
  // --- 1. 所有的 Hook 必须写在组件内部 ---
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // --- 2. 核心请求逻辑：ProTable 自动挡 ---
  const fetchOrders = async (params: any) => {
    try {
      const res = await request('/api/orders', {
        method: 'GET',
        params: params, // 这里会自动带上搜索框里的 order_id
      });
      const list = res.data || [];
      setData(list); // 同步给手机端视图
      return {
        data: list,
        success: true,
      };
    } catch (error) {
      message.error('加载失败');
      return { data: [], success: false };
    }
  };

  // --- 3. 辅助功能 ---
  const handleDelete = async (id: string) => {
    await request(`/api/orders/${id}`, { method: 'DELETE' });
    message.success('已删除');
    actionRef.current?.reload(); // 自动触发 request 刷新
  };

  const showVideo = (url: string) => {
    if (!url || url === '-') {
      message.warning('暂无存证视频');
      return;
    }
    const fullUrl = `http://${window.location.hostname}:3000${url}`;
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
          style={{ width: '100%', marginTop: 20 }}
        />
      ),
      footer: null,
    });
  };

  const handleBatchPrint = () => {
    // 2. 找到选中的数据
    const selectedOrders = data.filter((item) =>
      selectedRowKeys.includes(item.order_id),
    );

    // 3. 直接调用，一行搞定
    printLabels(selectedOrders);
  };

  // --- 4. 表格列定义 ---
  const columns: ProColumns[] = [
    { title: '快递单号', dataIndex: 'order_id', copyable: true },
    { title: '客户姓名', dataIndex: 'customer_name' },
    { title: '手机号', dataIndex: 'phone' },
    { title: '打包备注', dataIndex: 'remark', ellipsis: true },
    {
      title: '视频状态',
      dataIndex: 'video_url',
      search: false,
      render: (url) =>
        url && url !== '-' ? (
          <Tag color="green">已关联</Tag>
        ) : (
          <Tag>未录制</Tag>
        ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => history.push(`/orders/edit/${record.order_id}`)}
        >
          编辑
        </a>,
        <a key="video" onClick={() => showVideo(record.video_url)}>
          视频
        </a>,
        <Popconfirm
          key="del"
          title="确定删除？"
          onConfirm={() => handleDelete(record.order_id)}
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

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
          >
            新建存证单
          </Button>,
        ],
      }}
    >
      {screens.md ? (
        <ProTable
          actionRef={actionRef}
          columns={columns}
          request={fetchOrders}
          rowKey="order_id"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{ pageSize: 10 }}
          search={{ labelWidth: 'auto' }}
          toolBarRender={() => [
            <Button
              key="print"
              disabled={selectedRowKeys.length === 0}
              onClick={handleBatchPrint}
            >
              批量打印 ({selectedRowKeys.length})
            </Button>,
          ]}
        />
      ) : (
        <div style={{ padding: '0 4px' }}>
          <Input
            placeholder="搜索单号或备注..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ marginBottom: 16, height: 45 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <List
            dataSource={data.filter(
              (item) =>
                item.order_id?.includes(searchText) ||
                item.remark?.includes(searchText),
            )}
            renderItem={(item) => (
              <Card
                style={{ marginBottom: 16, borderRadius: 12 }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    快递单号
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1890ff',
                    }}
                  >
                    {item.order_id}
                  </div>
                </div>
                <div
                  style={{
                    background: '#fff7e6',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: 15,
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#fa8c16' }}>备注</div>
                  <div style={{ fontSize: '15px' }}>{item.remark || '无'}</div>
                </div>
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Button
                    onClick={() =>
                      history.push(`/orders/edit/${item.order_id}`)
                    }
                  >
                    修改
                  </Button>
                  <Button
                    type="primary"
                    ghost
                    onClick={() => showVideo(item.video_url)}
                  >
                    视频预览
                  </Button>
                  <Popconfirm
                    title="确定删除？"
                    onConfirm={() => handleDelete(item.order_id)}
                  >
                    <Button danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </Card>
            )}
          />
        </div>
      )}
    </PageContainer>
  );
};

export default OrderList;
