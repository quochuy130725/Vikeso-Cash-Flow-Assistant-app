const dns = require('dns');
const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      lookup: (hostname, options, callback) => dns.lookup(hostname, { family: 4 }, callback),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  return transporter;
};

const buildResetPasswordHTML = ({ name, code, minutes }) => `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#2C1654,#FF5C8D);padding:28px;text-align:center;color:#fff;">
            <h1 style="margin:0;font-size:22px;">VikeSo</h1>
            <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Đặt lại mật khẩu</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;color:#333;font-size:15px;line-height:1.6;">
            <p>Xin chào <b>${name || 'bạn'}</b>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản VikeSo của bạn. Vui lòng nhập mã xác nhận dưới đây vào ứng dụng:</p>
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;letter-spacing:10px;font-size:32px;font-weight:bold;color:#FF5C8D;background:#FFF0F5;padding:14px 24px;border-radius:12px;border:1px dashed #FF5C8D;">${code}</span>
            </div>
            <p>Mã có hiệu lực trong <b>${minutes} phút</b>. Không chia sẻ mã này với bất kỳ ai.</p>
            <p style="color:#888;font-size:13px;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — mật khẩu của bạn sẽ không thay đổi.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fafafa;padding:16px;text-align:center;color:#aaa;font-size:12px;">© VikeSo Cash Flow Assistant</td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

exports.sendResetPasswordEmail = async ({ to, name, code, minutes }) => {
  const subject = `[VikeSo] Mã đặt lại mật khẩu: ${code}`;
  const html = buildResetPasswordHTML({ name, code, minutes });
  const text = `Mã đặt lại mật khẩu VikeSo của bạn là ${code}. Mã có hiệu lực trong ${minutes} phút.`;

  // 1. Thử gửi qua Resend HTTP API (Port 443 — Render Free KHÔNG chặn)
  if (process.env.RESEND_API_KEY) {
    try {
      console.log('📤 Đang gửi mail qua Resend HTTP API...');
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'VikeSo <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          text,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log('✅ Gửi email qua Resend thành công:', data.id);
        return { provider: 'resend', id: data.id };
      }
      console.warn('⚠️ Resend thất bại:', data);
    } catch (err) {
      console.warn('⚠️ Lỗi Resend HTTP API:', err.message);
    }
  }

  // 2. Thử gửi qua Brevo HTTP API (Port 443 — Render Free KHÔNG chặn)
  if (process.env.BREVO_API_KEY) {
    try {
      console.log('📤 Đang gửi mail qua Brevo HTTP API...');
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'VikeSo', email: process.env.MAIL_USER || 'baocao.vikeso@gmail.com' },
          to: [{ email: to, name: name || 'Người dùng' }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log('✅ Gửi email qua Brevo thành công:', data.messageId);
        return { provider: 'brevo', messageId: data.messageId };
      }
      console.warn('⚠️ Brevo thất bại:', data);
    } catch (err) {
      console.warn('⚠️ Lỗi Brevo HTTP API:', err.message);
    }
  }

  // 3. Fallback qua Gmail SMTP (Chạy tốt ở Local hoặc Render gói trả phí)
  console.log('📤 Đang gửi mail qua Gmail SMTP...');
  const info = await getTransporter().sendMail({
    from: `"VikeSo" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
  console.log('✅ Gửi email qua Gmail SMTP thành công:', info.messageId);
  return { provider: 'smtp', messageId: info.messageId };
};

