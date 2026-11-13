/**
 * Kiểm thử Lưới lọc 2 chiều (Bidirectional Smart Deduplication) & Hạch toán 22h
 * Chạy: node Back-end/src/scripts/test_dedup_integration.js
 */

require('dotenv').config({ path: 'Back-end/.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Receipt = require('../models/Receipt');
const { processAndSaveReceipts } = require('../services/receiptService');
const { calculateAccountingDate } = require('../utils/accountingDate');

async function runDedupTest() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('⚠️ Không có MONGO_URI trong .env, bỏ qua test MongoDB integration.');
    return;
  }

  console.log('🔌 Kết nối MongoDB để kiểm thử Lưới lọc 2 chiều...');
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Đã kết nối MongoDB thành công.');

    // 1. Tạo Test Owner
    const testEmail = `test_dedup_${Date.now()}@vikeso.test`;
    const testUser = await User.create({
      email: testEmail,
      name: 'Test Deduplication User',
      role: 'OWNER',
      isEmailVerified: true,
      onboardingCompleted: true,
      subscriptionPlan: 'PRO',
    });

    console.log(`👤 Tạo user test: ${testUser._id}`);

    const baseDate = new Date('2026-10-30T10:00:00.000Z'); // 17:00 GMT+7 (< 22h)
    const targetAccDate = calculateAccountingDate(baseDate);

    // 2. Chiều 1 (Quét xuôi): Tạo 2 bill lẻ POS trước + 1 bill CHI + 1 sổ tay
    console.log('\n--- BƯỚC 1: Quét xuôi (Tạo bill lẻ POS, Chi, Sổ tay trước) ---');
    const step1Items = [
      {
        category: 'Hoa Don Le',
        transactionType: 'THU',
        totalAmount: 150000,
        reason: 'Khách mua cafe mang về',
        transactionDate: baseDate,
        aiRawData: { isPosBill: true },
      },
      {
        category: 'Hoa Don Le',
        transactionType: 'THU',
        totalAmount: 250000,
        reason: 'Bàn số 3 thanh toán',
        transactionDate: baseDate,
        aiRawData: { isPosBill: true },
      },
      {
        category: 'Hoa Don Le',
        transactionType: 'CHI',
        totalAmount: 80000,
        reason: 'Mua đá lạnh',
        transactionDate: baseDate,
        aiRawData: { isPosBill: true },
      },
      {
        category: 'So Tay',
        transactionType: 'THU',
        totalAmount: 500000,
        reason: 'Sổ tay thu nợ anh Ba',
        transactionDate: baseDate,
        aiRawData: { isPosBill: false },
      },
    ];

    const step1Docs = await processAndSaveReceipts({
      userId: testUser._id,
      items: step1Items,
      defaultEntrySource: 'AI_SCAN',
    });

    console.log(`  -> Đã lưu ${step1Docs.length} giao dịch.`);
    step1Docs.forEach(d => console.log(`     * [${d.category}] ${d.transactionType} ${d.totalAmount}đ: status = ${d.status}`));

    // Nộp phiếu POS Kết Ca
    console.log('\n--- Nộp phiếu POS Kết Ca (Z-Report) cuối ngày ---');
    const posReport = await processAndSaveReceipts({
      userId: testUser._id,
      items: [
        {
          category: 'POS Ket Ca',
          transactionType: 'THU',
          totalAmount: 400000, // tổng của 150k + 250k
          reason: 'Tổng kết ca ngày 30/10',
          transactionDate: baseDate,
          aiRawData: { isPosBill: true },
        },
      ],
      defaultEntrySource: 'POS_SETTLEMENT',
    });

    console.log(`  -> Đã lưu phiếu kết ca: ${posReport[0].status}`);

    // Kiểm tra trạng thái các bill sau khi nộp POS Kết Ca
    const updatedStep1 = await Receipt.find({ userId: testUser._id }).lean();
    console.log('\n--- KIỂM TRA KẾT QUẢ CHIỀU 1 ---');
    let posThuCount = 0;
    let posMergedCount = 0;
    let chiValidCount = 0;
    let soTayValidCount = 0;

    updatedStep1.forEach(d => {
      if (d.category === 'Hoa Don Le' && d.transactionType === 'THU') {
        posThuCount++;
        if (d.status === 'MERGED') posMergedCount++;
      }
      if (d.transactionType === 'CHI' && d.status === 'VALID') chiValidCount++;
      if (d.category === 'So Tay' && d.status === 'VALID') soTayValidCount++;
    });

    console.log(`  * Bill lẻ POS THU bị gạch bỏ (MERGED): ${posMergedCount}/${posThuCount}`);
    console.log(`  * Khoản CHI bảo toàn VALID: ${chiValidCount}/1`);
    console.log(`  * Sổ tay độc lập bảo toàn VALID: ${soTayValidCount}/1`);

    if (posMergedCount !== 2 || chiValidCount !== 1 || soTayValidCount !== 1) {
      throw new Error('❌ Lỗi kiểm tra Chiều 1!');
    }
    console.log('  ✅ CHIỀU 1 ĐẠT YÊU CẦU 100%!');

    // 3. Chiều 2 (Quét ngược): Nộp thêm 1 bill lẻ POS sau khi đã có POS Kết Ca
    console.log('\n--- BƯỚC 2: Quét ngược (Nộp bill lẻ POS sau khi đã có POS Kết Ca) ---');
    const lateBill = await processAndSaveReceipts({
      userId: testUser._id,
      items: [
        {
          category: 'Hoa Don Le',
          transactionType: 'THU',
          totalAmount: 120000,
          reason: 'Bill lẻ POS nộp bù sau ca',
          transactionDate: baseDate,
          aiRawData: { isPosBill: true },
        },
      ],
      defaultEntrySource: 'AI_SCAN',
    });

    console.log(`  * Trạng thái bill lẻ nộp sau: ${lateBill[0].status}`);
    if (lateBill[0].status !== 'MERGED') {
      throw new Error('❌ Chiều 2 thất bại: Bill lẻ POS nộp sau không bị MERGED!');
    }
    console.log('  ✅ CHIỀU 2 ĐẠT YÊU CẦU 100% (Bill lẻ tự gán MERGED ngay khi tạo)!');

    // Dọn dẹp dữ liệu test
    console.log('\n🧹 Dọn dẹp dữ liệu test...');
    await Receipt.deleteMany({ userId: testUser._id });
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Đã dọn dẹp xong.');

    console.log('\n🎉 TOÀN BỘ KIỂM THỬ LƯỚI LỌC 2 CHIỀU ĐÃ THÀNH CÔNG RỰC RỠ!');
  } catch (err) {
    console.error('❌ Lỗi kiểm thử:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runDedupTest();

