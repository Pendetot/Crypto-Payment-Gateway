const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Configure email transporter based on environment
    if (process.env.NODE_ENV === 'sandbox' || process.env.SANDBOX_MODE === 'true') {
      // Use Ethereal Email for testing in sandbox mode
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
          pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
        }
      });
    } else {
      // Production email configuration
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendPaymentCreatedEmail(paymentData, userEmail) {
    const { paymentId, amount, originalAmount, orderId, expiresAt, walletAddress } = paymentData;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@cryptopayment.com',
      to: userEmail,
      subject: `Payment Created - Order ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Payment Created Successfully</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Payment Details</h3>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount:</strong> ${originalAmount} USDT</p>
            <p><strong>Total to Pay:</strong> ${amount} USDT</p>
            <p><strong>Wallet Address:</strong> ${walletAddress}</p>
            <p><strong>Expires At:</strong> ${new Date(expiresAt).toLocaleString()}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">Payment Instructions</h4>
            <ol style="color: #856404;">
              <li>Send exactly <strong>${amount} USDT</strong> to the wallet address above</li>
              <li>Use BSC (Binance Smart Chain) network</li>
              <li>Complete payment before expiration time</li>
              <li>You will receive confirmation once payment is verified</li>
            </ol>
          </div>

          ${process.env.NODE_ENV === 'sandbox' ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;"><strong>🧪 SANDBOX MODE:</strong> This is a test payment. No real money is involved.</p>
          </div>
          ` : ''}

          <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Payment created email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending payment created email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPaymentSuccessEmail(paymentData, userEmail) {
    const { paymentId, amount, originalAmount, orderId, txHash, verifiedAt } = paymentData;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@cryptopayment.com',
      to: userEmail,
      subject: `Payment Confirmed - Order ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">✅ Payment Confirmed Successfully!</h2>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">Payment Confirmation</h3>
            <p style="color: #155724;">Your payment has been successfully verified and confirmed.</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Transaction Details</h3>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount Paid:</strong> ${amount} USDT</p>
            <p><strong>Original Amount:</strong> ${originalAmount} USDT</p>
            <p><strong>Transaction Hash:</strong> ${txHash}</p>
            <p><strong>Verified At:</strong> ${new Date(verifiedAt).toLocaleString()}</p>
          </div>

          ${process.env.NODE_ENV === 'sandbox' ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;"><strong>🧪 SANDBOX MODE:</strong> This is a test payment confirmation.</p>
          </div>
          ` : ''}

          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
            <h4 style="color: #004085; margin-top: 0;">What's Next?</h4>
            <p style="color: #004085;">Your order is now being processed. You will receive updates on the order status via email.</p>
          </div>

          <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
            Thank you for your payment! If you have any questions, please contact our support team.
          </p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Payment success email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending payment success email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPaymentExpiredEmail(paymentData, userEmail) {
    const { paymentId, amount, originalAmount, orderId, expiresAt } = paymentData;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@cryptopayment.com',
      to: userEmail,
      subject: `Payment Expired - Order ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">⏰ Payment Expired</h2>
          
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #721c24; margin-top: 0;">Payment Timeout</h3>
            <p style="color: #721c24;">Unfortunately, your payment window has expired and the payment was not completed in time.</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Expired Payment Details</h3>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount:</strong> ${originalAmount} USDT</p>
            <p><strong>Total Required:</strong> ${amount} USDT</p>
            <p><strong>Expired At:</strong> ${new Date(expiresAt).toLocaleString()}</p>
          </div>

          ${process.env.NODE_ENV === 'sandbox' ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;"><strong>🧪 SANDBOX MODE:</strong> This is a test payment expiration notification.</p>
          </div>
          ` : ''}

          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
            <h4 style="color: #004085; margin-top: 0;">What Can You Do?</h4>
            <ul style="color: #004085;">
              <li>Create a new payment for your order</li>
              <li>Contact our support team if you need assistance</li>
              <li>If you already sent payment, please contact support with your transaction details</li>
            </ul>
          </div>

          <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
            We apologize for any inconvenience. If you have any questions, please contact our support team.
          </p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Payment expired email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending payment expired email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTestEmail(userEmail) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@cryptopayment.com',
      to: userEmail,
      subject: 'Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Email Service Test</h2>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending test email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
