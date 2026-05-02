const Database = require('better-sqlite3');
const db = new Database('orders.db'); // 这会在根目录生成一个 orders.db 文件

// 创建表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY, 
    customer_name TEXT,
    address TEXT,
    phone TEXT,
    remark TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('✅ 数据库 (SQLite) 已就绪');

module.exports = db;
