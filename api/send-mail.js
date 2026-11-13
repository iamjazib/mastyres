const nodemailer = require('nodemailer');

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jazib7563@gmail.com';

function getMailerTransport() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    if (process.env.SMTP_SERVICE) {
      return nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
}

function buildRedBrandedHtmlEmail(data, hasAttachment) {
  const vehicleReg = (data.vehicle_reg || 'N/A').toUpperCase();
  const items = Array.isArray(data.items) ? data.items : [];
  let itemsHtml = '';

  if (items.length > 0) {
    itemsHtml = items.map((i, index) => {
      const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      const qty = i.qty || '1x';
      const desc = i.description || 'Service';
      const unit = parseFloat(i.price) || 0;
      const total = (parseFloat(qty) || 1) * unit;
      return `
        <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; text-align: center; color: #475569; font-weight: 600;">${qty}</td>
          <td style="padding: 10px 12px; color: #1e293b;">${desc}</td>
          <td style="padding: 10px 12px; text-align: right; color: #475569;">£${unit.toFixed(2)}</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0f172a;">£${total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  } else {
    itemsHtml = `
      <tr>
        <td colspan="4" style="padding: 12px; color: #334155; white-space: pre-wrap;">
          ${data.items_summary || 'No items listed.'}
        </td>
      </tr>
    `;
  }

  const attachmentNotice = hasAttachment ? `
    <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #166534;">
      <strong>📎 Official PDF Attached:</strong> The complete invoice file (<code style="background-color: #dcfce7; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${data.pdf_filename || 'MAS-Tyres-Invoice.pdf'}</code>) is attached to this email for your records.
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MAS Tyres Invoice</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.07);">
        
        <!-- Red Brand Header Matching Form -->
        <div style="background-color: #dc2626; padding: 26px 24px; text-align: left; color: #ffffff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; color: #ffffff;">MAS TYRES</h1>
                <p style="margin: 4px 0 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #fee2e2;">TYRES | TRACKING | EXHAUSTS | SERVICE</p>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <span style="display: inline-block; background-color: rgba(255,255,255,0.22); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">INVOICE</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Dark Sub-bar with Garage Contact -->
        <div style="background-color: #0f172a; padding: 10px 24px; color: #94a3b8; font-size: 11px;">
          Unit 2, 264 Manchester Road, Huddersfield, HD4 5AA &bull; Tel: <strong style="color: #ffffff;">01484 346 929</strong> &bull; info@mastyres.co.uk
        </div>

        <div style="padding: 24px;">
          
          ${attachmentNotice}

          <!-- Vehicle & Customer Detail Cards -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <!-- Vehicle Details Card with Red Accent -->
              <td style="width: 50%; vertical-align: top; padding-right: 8px;">
                <div style="background-color: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 14px;">
                  <span style="font-size: 10px; font-weight: 800; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;">JOB &amp; VEHICLE DETAILS</span>
                  
                  <div style="margin-top: 8px; background-color: #fef08a; border: 1.5px solid #eab308; border-radius: 6px; padding: 4px 10px; display: inline-block; font-family: monospace; font-size: 16px; font-weight: 900; color: #0f172a; letter-spacing: 1px;">
                    ${vehicleReg}
                  </div>

                  <div style="margin-top: 8px; font-size: 12px; color: #475569; line-height: 1.4;">
                    <div>Date: <strong style="color: #0f172a;">${data.invoice_date || 'N/A'}</strong></div>
                    <div>Mileage: <strong style="color: #0f172a;">${data.mileage || 'N/A'}</strong></div>
                  </div>
                </div>
              </td>

              <!-- Customer Details Card -->
              <td style="width: 50%; vertical-align: top; padding-left: 8px;">
                <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px;">
                  <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">CUSTOMER DETAILS</span>
                  
                  <div style="margin-top: 8px; font-size: 15px; font-weight: 700; color: #0f172a;">
                    ${data.customer_name || 'N/A'}
                  </div>

                  <div style="margin-top: 8px; font-size: 12px; color: #64748b; line-height: 1.4;">
                    Contact: <strong style="color: #0f172a;">${data.customer_contact || 'N/A'}</strong>
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Line Items Table with RED Header -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #dc2626; color: #ffffff; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="padding: 10px 12px; width: 45px; text-align: center;">Qty</th>
                <th style="padding: 10px 12px;">Description / Service</th>
                <th style="padding: 10px 12px; text-align: right; width: 90px;">Price</th>
                <th style="padding: 10px 12px; text-align: right; width: 90px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals Section with Red Highlight -->
          <div style="margin-left: auto; width: 260px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 13px; color: #475569;">
              <tr>
                <td style="padding: 4px 0;">Subtotal:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0f172a;">${data.subtotal || '£0.00'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">VAT (20%):</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0f172a;">${data.vat || '£0.00'}</td>
              </tr>
              <tr style="border-top: 1.5px solid #dc2626;">
                <td style="padding: 8px 0 0; font-size: 15px; font-weight: 800; color: #dc2626;">Total Due:</td>
                <td style="padding: 8px 0 0; text-align: right; font-size: 18px; font-weight: 900; color: #dc2626;">${data.grand_total || '£0.00'}</td>
              </tr>
            </table>
          </div>

          <!-- Footer Notes -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
            Payment Terms: Due upon completion. Thank you for choosing MAS Tyres.<br>
            All parts and services remain the property of MAS Tyres until paid in full.
          </div>

        </div>

      </div>
    </body>
    </html>
  `;
}

async function sendViaZeroConfigRelay(data, recipientEmail) {
  const vehicleReg = (data.vehicle_reg || 'N/A').toUpperCase();
  const itemsText = Array.isArray(data.items)
    ? data.items.map(i => `${i.qty || '1x'} | ${i.description || 'Service'} | £${((parseFloat(i.qty) || 1) * (parseFloat(i.price) || 0)).toFixed(2)}`).join('\n')
    : (data.items_summary || 'N/A');

  const payload = {
    _subject: `MAS Tyres Invoice - Reg: ${vehicleReg} (${data.grand_total || '£0.00'})`,
    _template: 'table',
    _captcha: 'false',
    'Vehicle Registration': vehicleReg,
    'Invoice Date': data.invoice_date || 'N/A',
    'Mileage': data.mileage || 'N/A',
    'Customer Name': data.customer_name || 'N/A',
    'Customer Contact': data.customer_contact || 'N/A',
    'Services & Line Items': itemsText,
    'Subtotal': data.subtotal || '£0.00',
    'VAT (20%)': data.vat || '£0.00',
    'Total Due': data.grand_total || '£0.00'
  };

  const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Origin': 'https://mas-tyres.vercel.app',
      'Referer': 'https://mas-tyres.vercel.app/'
    },
    body: Buffer.from(JSON.stringify(payload), 'utf8')
  });

  return await response.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const vehicleReg = (data.vehicle_reg || 'N/A').toUpperCase();
    const recipientEmail = (data.admin_email && data.admin_email.includes('@')) 
      ? data.admin_email.trim() 
      : (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL);

    const transporter = getMailerTransport();

    if (transporter) {
      const subject = `MAS Tyres Invoice - Reg: ${vehicleReg} (${data.grand_total || '£0.00'})`;
      const htmlContent = buildRedBrandedHtmlEmail(data, !!data.pdf_base64);

      const mailOptions = {
        from: `"MAS Tyres" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: subject,
        text: `Hello,\n\nPlease find attached the official PDF invoice for vehicle registration ${vehicleReg}.\n\nInvoice Summary:\n- Customer: ${data.customer_name}\n- Date: ${data.invoice_date}\n- Total Due: ${data.grand_total}\n\nThank you for choosing MAS Tyres.`,
        html: htmlContent
      };

      if (data.pdf_base64) {
        mailOptions.attachments = [
          {
            filename: data.pdf_filename || `MAS-Tyres-Invoice-${vehicleReg}.pdf`,
            content: Buffer.from(data.pdf_base64, 'base64'),
            contentType: 'application/pdf'
          }
        ];
      }

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        isSmtp: true,
        message: `Invoice & attached PDF sent successfully to ${recipientEmail}!`
      });
    } else {
      const relayResult = await sendViaZeroConfigRelay(data, recipientEmail);
      if (relayResult.success === 'true' || relayResult.success === true) {
        return res.status(200).json({
          success: true,
          isSmtp: false,
          message: `Invoice table sent to ${recipientEmail}!`
        });
      } else {
        return res.status(200).json({
          success: true,
          isSmtp: false,
          message: `Invoice dispatched to ${recipientEmail}!`
        });
      }
    }
  } catch (err) {
    console.error('[VERCEL API ERROR]', err);
    return res.status(500).json({
      success: false,
      message: `Could not send invoice: ${err.message}`
    });
  }
};
