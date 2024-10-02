const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('./firebase-config');
const firebase = require('./firebase-config');

const router = express.Router();
const db = firebase.firestore(); // Initialize Firestore

// Đăng ký người dùng
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
  }

  try {
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user trong Firebase Authentication
    const userRecord = await admin.auth().createUser({
      username,
      email,
      password: hashedPassword,
    });

    // Tạo bảng để lưu user trong Firestore
    const userDoc = {
      uid: userRecord.uid,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    // Lưu user vào Firestore
    await db.collection('users').doc(userRecord.uid).set(userDoc);

    res.status(201).json({ message: 'Đăng ký thành công!', uid: userRecord.uid });
  } catch (error) {
    res.status(500).json({ message: 'Đăng ký thất bại', error: error.message });
  }
});

// Đăng nhập người dùng
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Dự kiến nhận email và mật khẩu

  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
  }

  try {
    // Đăng nhập bằng email và mật khẩu
    const userRecord = await admin.auth().getUserByEmail(email); 

    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' }); 
    }

    const userData = userDoc.data();

    // Giả sử bạn đang lưu trữ mật khẩu đã băm trong Firestore (bạn có thể chọn không lưu)
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Sai mật khẩu' });
    }

    // Tạo JWT tùy chỉnh nếu cần thiết
    const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Đăng nhập thành công', token });
  } catch (error) {
    res.status(401).json({ message: 'Đăng nhập thất bại', error: error.message });
  }
});


module.exports = router;
