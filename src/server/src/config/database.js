import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MongoDB 连接失败: 未配置 MONGODB_URI');
      console.log('👉 请在 src/server/.env 中设置 MONGODB_URI');
      console.log('⚠️  服务器将继续运行，但数据库功能不可用');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB 连接失败: ${error.message}`);
    console.log('⚠️  服务器将继续运行，但数据库功能不可用');
    // 不退出进程，允许服务器继续运行用于演示
  }
};

export default connectDB;
