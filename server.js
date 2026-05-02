// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db'); // 引入你的数据库
const app = express();
app.use(express.json());

// 1. 自动创建 public/uploads 文件夹
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ 已创建上传目录:', uploadDir);
}

// 2. 静态资源映射 (关键：让浏览器能访问视频)
// 这样访问 http://localhost:3000/uploads/xxx.mp4 就能看到视频
app.use('/uploads', express.static(uploadDir));

// 3. 配置 Multer 如何存放文件
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 获取前端传来的单号，用于命名
    const orderId = req.body.orderId || 'unknown';
    const timestamp = Date.now();
    cb(null, `${orderId}_${timestamp}.mp4`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 限制 100MB
});

// 2. 暴露静态目录（这样前端才能通过 http://.../uploads/xxx.mp4 看到视频）
app.use('/uploads', express.static(uploadDir));

// 接口：上传视频
app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false });
  const videoUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: videoUrl });
});

// 獲取清單：支持分頁和簡單搜索
app.get('/api/orders', (req, res) => {
  try {
    // 獲取前端傳來的關鍵字（如果有）
    const { order_id, customer_name } = req.query;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (order_id) {
      sql += ' AND order_id LIKE ?';
      params.push(`%${order_id}%`);
    }
    if (customer_name) {
      sql += ' AND customer_name LIKE ?';
      params.push(`%${customer_name}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const rows = db.prepare(sql).all(...params);

    res.json({
      data: rows,
      success: true,
      total: rows.length,
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

//获得单个订单详情
app.get('/api/orders/:id', (req, res) => {
  try {
    const orderId = req.params.id;
    const row = db
      .prepare('SELECT * FROM orders WHERE order_id = ?')
      .get(orderId);

    if (row) {
      res.json({ success: true, data: row });
    } else {
      res.status(404).json({ success: false, message: '订单不存在' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// 更新订单
app.put('/api/orders/:id', (req, res) => {
  const order_id = req.params.id; // 从 URL 获取单号
  const { customer_name, phone, address, remark, video_url } = req.body;

  try {
    const stm = db.prepare(`
      UPDATE orders 
      SET customer_name = ?, phone = ?, address = ?, remark = ?, video_url = ?
      WHERE order_id = ?
    `);
    const result = stm.run(
      customer_name,
      phone,
      address,
      remark,
      video_url,
      order_id,
    );

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: '未找到该订单' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 新增訂單接口
app.post('/api/orders', (req, res) => {
  const { order_id, customer_name, phone, address, remark, video_url } =
    req.body;
  try {
    const stm = db.prepare(`
      INSERT INTO orders (order_id, customer_name, phone, address, remark, video_url) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stm.run(order_id, customer_name, phone, address, remark, video_url);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: '单号重复或数据库错误' });
  }
});

app.listen(3000, () => console.log('✅ 後端服務已啟動在 3000 端口'));
