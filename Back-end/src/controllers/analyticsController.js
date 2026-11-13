const Receipt = require('../models/Receipt');
const { calculateAccountingDate } = require('../utils/accountingDate');

/**
 * Helper tính khoảng thời gian hạch toán trong giờ VN (UTC+7)
 */
function getPeriodRanges(period = 'month', targetDate = new Date()) {
  const d = new Date(targetDate);
  const vnOffset = 7 * 60 * 60 * 1000;
  const vn = new Date(d.getTime() + vnOffset);

  const y = vn.getUTCFullYear();
  const m = vn.getUTCMonth();
  const date = vn.getUTCDate();

  let curStart, curEnd, prevStart, prevEnd;

  if (period === 'week') {
    // Tuần hiện tại: Thứ 2 -> Chủ nhật
    const dayOfWeek = vn.getUTCDay(); // 0 is Sun, 1 is Mon...
    const diffToMon = (dayOfWeek + 6) % 7;
    const mon = date - diffToMon;

    curStart = new Date(Date.UTC(y, m, mon, 0, 0, 0, 0) - vnOffset);
    curEnd = new Date(Date.UTC(y, m, mon + 6, 23, 59, 59, 999) - vnOffset);

    // Tuần trước
    prevStart = new Date(Date.UTC(y, m, mon - 7, 0, 0, 0, 0) - vnOffset);
    prevEnd = new Date(Date.UTC(y, m, mon - 1, 23, 59, 59, 999) - vnOffset);
  } else if (period === 'year') {
    // Năm hiện tại
    curStart = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0) - vnOffset);
    curEnd = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999) - vnOffset);

    // Năm trước
    prevStart = new Date(Date.UTC(y - 1, 0, 1, 0, 0, 0, 0) - vnOffset);
    prevEnd = new Date(Date.UTC(y - 1, 11, 31, 23, 59, 59, 999) - vnOffset);
  } else {
    // Tháng hiện tại (mặc định)
    curStart = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0) - vnOffset);
    curEnd = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999) - vnOffset);

    // Tháng trước
    prevStart = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0) - vnOffset);
    prevEnd = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999) - vnOffset);
  }

  return { curStart, curEnd, prevStart, prevEnd };
}

/**
 * GET /api/transactions/analytics
 * Thống kê biến động Thu - Chi đa kỳ & So sánh cùng kỳ (MoMo-Style Analytics)
 */
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user?.employerId || req.user?.userId || req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    }

    const period = req.query.period || 'month';
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const compare = req.query.compare !== 'false';
    const groupBy = req.query.groupBy || 'child';
    const shopId = req.query.shopId || req.user?.activeShopId;

    const { curStart, curEnd, prevStart, prevEnd } = getPeriodRanges(period, targetDate);

    const baseFilter = {
      userId,
      status: 'VALID',
    };
    if (shopId) baseFilter.shopId = shopId;

    // 1. Lấy dữ liệu kỳ hiện tại
    const currentReceipts = await Receipt.find({
      ...baseFilter,
      accountingDate: { $gte: curStart, $lte: curEnd },
    }).lean();

    // 2. Lấy dữ liệu kỳ trước (nếu compare=true)
    let previousReceipts = [];
    if (compare) {
      previousReceipts = await Receipt.find({
        ...baseFilter,
        accountingDate: { $gte: prevStart, $lte: prevEnd },
      }).lean();
    }

    // 3. Tính tổng kỳ hiện tại
    let curThu = 0, curChi = 0;
    currentReceipts.forEach((r) => {
      if (r.transactionType === 'THU') curThu += (r.totalAmount || 0);
      else curChi += (r.totalAmount || 0);
    });
    const curNet = curThu - curChi;

    // 4. Tính tổng kỳ trước
    let prevThu = 0, prevChi = 0;
    previousReceipts.forEach((r) => {
      if (r.transactionType === 'THU') prevThu += (r.totalAmount || 0);
      else prevChi += (r.totalAmount || 0);
    });
    const prevNet = prevThu - prevChi;

    // 5. Tính % tăng trưởng (Growth rate)
    const calcGrowth = (cur, prev) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Number((((cur - prev) / Math.abs(prev)) * 100).toFixed(1));
    };

    const growthPercent = {
      thuGrowth: calcGrowth(curThu, prevThu),
      chiGrowth: calcGrowth(curChi, prevChi),
      netGrowth: calcGrowth(curNet, prevNet),
    };

    // 6. Xây dựng Chart Series
    const vnOffset = 7 * 60 * 60 * 1000;
    const chartMap = {};

    currentReceipts.forEach((r) => {
      const d = new Date(new Date(r.accountingDate || r.transactionDate).getTime() + vnOffset);
      const label = period === 'year'
        ? `T${d.getUTCMonth() + 1}`
        : `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

      if (!chartMap[label]) chartMap[label] = { label, currentThu: 0, currentChi: 0, previousThu: 0, previousChi: 0 };
      if (r.transactionType === 'THU') chartMap[label].currentThu += (r.totalAmount || 0);
      else chartMap[label].currentChi += (r.totalAmount || 0);
    });

    const chartSeries = Object.values(chartMap).map((item) => ({
      ...item,
      net: item.currentThu - item.currentChi,
    }));

    // 7. Phân bổ theo Danh mục (Category Breakdown)
    const catMap = {};
    currentReceipts.forEach((r) => {
      const catKey = groupBy === 'parent'
        ? (r.parentCategoryName || r.category || 'Khác')
        : (r.categoryName || r.category || 'Khác');

      if (!catMap[catKey]) {
        catMap[catKey] = {
          name: catKey,
          transactionType: r.transactionType,
          amount: 0,
          count: 0,
        };
      }
      catMap[catKey].amount += (r.totalAmount || 0);
      catMap[catKey].count += 1;
    });

    const totalVolume = curThu + curChi;
    const categoryBreakdown = Object.values(catMap)
      .map((c) => ({
        ...c,
        percent: totalVolume > 0 ? Number(((c.amount / totalVolume) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return res.status(200).json({
      success: true,
      period,
      currentPeriod: {
        totalThu: curThu,
        totalChi: curChi,
        netProfit: curNet,
        receiptCount: currentReceipts.length,
      },
      previousPeriod: {
        totalThu: prevThu,
        totalChi: prevChi,
        netProfit: prevNet,
        receiptCount: previousReceipts.length,
      },
      growthPercent,
      chartSeries,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Lỗi get-analytics:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

