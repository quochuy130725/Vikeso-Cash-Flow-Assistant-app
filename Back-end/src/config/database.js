const mongoose = require('mongoose');

/**
 * Kết nối MongoDB Atlas.
 * Được gọi một lần duy nhất từ server.js khi khởi động.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔥 Kết nối MongoDB thành công rồi ông giáo ơi!');
  } catch (err) {
    console.error('🚨 Lỗi kết nối DB rồi bồ tèo:', err);
    process.exit(1); // Dừng server nếu không kết nối được DB
  }
};

module.exports = connectDB;
