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
  await getTransporter().sendMail({
    from: `"VikeSo" <${process.env.MAIL_USER}>`,
    to,
    subject: `[VikeSo] Mã đặt lại mật khẩu: ${code}`,
    text: `Mã đặt lại mật khẩu VikeSo của bạn là ${code}. Mã có hiệu lực trong ${minutes} phút.`,
    html: buildResetPasswordHTML({ name, code, minutes }),
  });
};
