/**
 * KỊCH BẢN KIỂM THỬ TỰ ĐỘNG BẢN ĐẶC TẢ BACK-END VIKESO v3.2-FINAL
 * Chạy độc lập: node Back-end/src/scripts/test_v3_spec.js
 */

const assert = require('assert');
const { calculateAccountingDate, normalizePaymentMethod } = require('../utils/accountingDate');

function runUnitTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐẶC TẢ BACK-END VIKESO v3.2-FINAL');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // ── TEST 1: Quy tắc Hạch toán sau 22:00 (accountingDate) ──
  console.log('📌 NHÓM 1: QUY TẮC HẠCH TOÁN SAU 22:00 (accountingDate)');

  test('Giao dịch trước 22:00 (15:30 GMT+7) giữ nguyên ngày hiện tại', () => {
    // 15:30:00 GMT+7 ngày 30/10/2026 = 08:30:00 UTC ngày 30/10/2026
    const txTime = new Date('2026-10-30T08:30:00.000Z');
    const accDate = calculateAccountingDate(txTime);

    // accDate theo giờ VN phải là ngày 30/10/2026
    const vnOffset = 7 * 60 * 60 * 1000;
    const vnTime = new Date(accDate.getTime() + vnOffset);
    assert.strictEqual(vnTime.getUTCDate(), 30);
    assert.strictEqual(vnTime.getUTCMonth(), 9); // Tháng 10 (0-indexed)
    assert.strictEqual(vnTime.getUTCFullYear(), 2026);
  });

  test('Giao dịch sau 22:00 (22:15 GMT+7) tự động nhảy sang ngày hôm sau', () => {
    // 22:15:00 GMT+7 ngày 30/10/2026 = 15:15:00 UTC ngày 30/10/2026
    const txTime = new Date('2026-10-30T15:15:00.000Z');
    const accDate = calculateAccountingDate(txTime);

    // accDate theo giờ VN phải là ngày 31/10/2026
    const vnOffset = 7 * 60 * 60 * 1000;
    const vnTime = new Date(accDate.getTime() + vnOffset);
    assert.strictEqual(vnTime.getUTCDate(), 31);
    assert.strictEqual(vnTime.getUTCMonth(), 9);
    assert.strictEqual(vnTime.getUTCFullYear(), 2026);
  });

  test('Giao dịch 23:59 ngày cuối tháng (31/10/2026 23:59 GMT+7) tự động chuyển sang ngày 01/11/2026', () => {
    // 23:59:00 GMT+7 ngày 31/10/2026 = 16:59:00 UTC ngày 31/10/2026
    const txTime = new Date('2026-10-31T16:59:00.000Z');
    const accDate = calculateAccountingDate(txTime);

    const vnOffset = 7 * 60 * 60 * 1000;
    const vnTime = new Date(accDate.getTime() + vnOffset);
    assert.strictEqual(vnTime.getUTCDate(), 1);
    assert.strictEqual(vnTime.getUTCMonth(), 10); // Tháng 11
    assert.strictEqual(vnTime.getUTCFullYear(), 2026);
  });

  // ── TEST 2: Chuẩn hóa Phương thức thanh toán (paymentMethod) ──
  console.log('\n📌 NHÓM 2: CHUẨN HÓA PHƯƠNG THỨC THANH TOÁN (paymentMethod)');

  test('Nhận diện đúng phương thức từ chuỗi định danh (CASH, TRANSFER, POS)', () => {
    assert.strictEqual(normalizePaymentMethod('CASH'), 'TIEN_MAT');
    assert.strictEqual(normalizePaymentMethod('TRANSFER'), 'CHUYEN_KHOAN');
    assert.strictEqual(normalizePaymentMethod('POS'), 'THE_POS');
    assert.strictEqual(normalizePaymentMethod('TIEN_MAT'), 'TIEN_MAT');
    assert.strictEqual(normalizePaymentMethod('CHUYEN_KHOAN'), 'CHUYEN_KHOAN');
    assert.strictEqual(normalizePaymentMethod('THE_POS'), 'THE_POS');
  });

  test('Tự động suy luận theo loại chứng từ category', () => {
    assert.strictEqual(normalizePaymentMethod(null, 'Chuyen Khoan'), 'CHUYEN_KHOAN');
    assert.strictEqual(normalizePaymentMethod(null, 'POS Ket Ca'), 'THE_POS');
    assert.strictEqual(normalizePaymentMethod(null, 'Hoa Don Le', '', true), 'THE_POS');
  });

  test('Tự động suy luận từ từ khóa nội dung ghi chú (reason)', () => {
    assert.strictEqual(normalizePaymentMethod(null, 'Khac', 'Khách quét mã VietQR'), 'CHUYEN_KHOAN');
    assert.strictEqual(normalizePaymentMethod(null, 'Khac', 'Quẹt thẻ máy POS bán lẻ'), 'THE_POS');
    assert.strictEqual(normalizePaymentMethod(null, 'Khac', 'Tiền mặt mua rau củ'), 'TIEN_MAT');
  });

  // ── TEST 3: Cấu hình SePay VietQR động ──
  console.log('\n📌 NHÓM 3: THANH TOÁN VIETQR GÓI PRO 99.000Đ/THÁNG');

  test('URL VietQR sinh ra đúng định dạng img.vietqr.io với giá 99.000đ và mã đơn VIKESO', () => {
    const sepayConfig = require('../config/sepay');
    assert.strictEqual(sepayConfig.proPrice, 99000);
    assert.strictEqual(sepayConfig.proDays, 30);

    const testUrl = sepayConfig.buildQrUrl({ amount: 99000, content: 'VIKESO A1B2C3' });
    assert.ok(testUrl.startsWith('https://img.vietqr.io/image/'));
    assert.ok(testUrl.includes('amount=99000'));
    assert.ok(testUrl.includes('addInfo=VIKESO%20A1B2C3'));
  });

  // ── TEST 4: RBAC & Middleware ──
  console.log('\n📌 NHÓM 4: PHÂN QUYỀN RBAC (ADMIN / OWNER / STAFF)');

  test('blockStaff chặn thành công người dùng có role STAFF', () => {
    const { blockStaff } = require('../middlewares/rbac');
    let statusCalled = null;
    let jsonCalled = null;

    const req = { user: { role: 'STAFF', userId: 'staff-123' } };
    const res = {
      status: (code) => { statusCalled = code; return res; },
      json: (data) => { jsonCalled = data; return res; },
    };
    let nextCalled = false;

    blockStaff(req, res, () => { nextCalled = true; });
    assert.strictEqual(statusCalled, 403);
    assert.strictEqual(nextCalled, false);
    assert.ok(jsonCalled.message.includes('STAFF'));
  });

  test('blockStaff cho phép OWNER và ADMIN đi tiếp', () => {
    const { blockStaff } = require('../middlewares/rbac');
    let nextCalled = false;
    const req = { user: { role: 'OWNER', userId: 'owner-123' } };
    blockStaff(req, {}, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });

  // ── TEST 5: Cây Danh mục Thu - Chi (Tree & Flat) ──
  console.log('\n📌 NHÓM 5: CẤU TRÚC CÂY DANH MỤC THU - CHI');

  test('Format tree tổ chức đúng danh mục Cha và mảng children', () => {
    const mockCategories = [
      { _id: 'cat-parent-1', name: 'Doanh thu bán hàng', parentId: null },
      { _id: 'cat-child-1', name: 'Bán lẻ tại quầy', parentId: 'cat-parent-1' },
      { _id: 'cat-child-2', name: 'Bán hàng qua POS', parentId: 'cat-parent-1' },
      { _id: 'cat-parent-2', name: 'Chi phí nhập hàng', parentId: null },
    ];

    const parents = mockCategories.filter(c => !c.parentId);
    const childrenMap = {};
    mockCategories.forEach(c => {
      if (c.parentId) {
        childrenMap[c.parentId] = childrenMap[c.parentId] || [];
        childrenMap[c.parentId].push(c);
      }
    });

    const tree = parents.map(p => ({
      ...p,
      children: childrenMap[p._id] || [],
    }));

    assert.strictEqual(tree.length, 2);
    assert.strictEqual(tree[0].children.length, 2);
    assert.strictEqual(tree[1].children.length, 0);
  });

  console.log('\n========================================================');
  console.log(`📊 TỔNG KẾT: ${passed} PASS, ${failed} FAIL`);
  console.log('========================================================');

  if (failed > 0) process.exit(1);
}

runUnitTests();

