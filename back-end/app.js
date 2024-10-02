const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./authentication/auth');
const cors = require('cors'); // Import cors

const app = express();

dotenv.config();

// Cấu hình CORS cho phép từ tất cả các nguồn gốc
app.use(cors());

// Hoặc nếu bạn muốn chỉ cho phép một số nguồn gốc nhất định, ví dụ 'http://localhost:3000'
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
