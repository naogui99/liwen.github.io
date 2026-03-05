const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// MongoDB 连接字符串（本地测试用）
const mongoURI = 'mongodb://localhost:27017/risk_tool';

// 初始化 Express 应用
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 连接 MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB 已连接'))
  .catch(err => console.error('MongoDB 连接失败:', err));

// 用户记录模型
const recordSchema = new mongoose.Schema({
  name: String,
  id: String,
  inputs: Object,
  total: Number,
  level: String,
  timestamp: { type: Date, default: Date.now }
});

const Record = mongoose.model('Record', recordSchema);

// API 路由

// 1. 保存新记录
app.post('/api/history', async (req, res) => {
  try {
    const record = new Record(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. 获取分页历史记录
app.get('/api/history', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  try {
    const count = await Record.countDocuments({});
    const records = await Record.find({})
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      records,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. 删除单条记录
app.delete('/api/history/:id', async (req, res) => {
  try {
    const result = await Record.deleteOne({ _id: req.params.id });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. 清空所有记录
app.delete('/api/history', async (req, res) => {
  try {
    const result = await Record.deleteMany({});
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});