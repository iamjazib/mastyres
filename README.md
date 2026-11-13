# MAS Tyres — Invoice & Job Sheet Generator

A modern, responsive invoice generator built for MAS Tyres, featuring vector PDF generation, local invoice archiving, and automated email dispatch with PDF attachments.

---

## Features
- **1-Click Vector PDF Download:** Generates sharp, vector A4 invoice PDFs using `jsPDF` and `AutoTable`.
- **Automatic PDF Archiving:** Every dispatched invoice is automatically saved as a PDF inside the local `invoices/` directory (`invoices/MAS-Tyres-Invoice-[REG].pdf`).
- **Send to Shop Owner:** One-click background dispatch sending the invoice breakdown and attached PDF directly to the owner.
- **Configurable Recipient:** Easily view or change the recipient email address anytime via the header (`To: jazib7563@gmail.com ✎ edit`) or via `.env`.
- **Red Brand Styling:** Matches the MAS Tyres red brand identity (`#dc2626`) across the UI, PDF, and email templates.
- **Zero-Config Relay & Live SMTP:** Works out of the box with zero-configuration relay, and supports direct Gmail SMTP for primary inbox delivery with full binary attachments.

---

## Quick Start (Running Locally)

1. Start the web server:
   ```bash
   npm start
   ```
2. Open **http://localhost:3000** in your browser.

---

## Changing the Notification Email

You can update the recipient email in any of these ways:
1. **On the Web Page:** Click the **`To: jazib7563@gmail.com ✎ edit`** button in the header, enter the new address, and click **Save**.
2. **In `.env`:** Edit `ADMIN_EMAIL=your-email@example.com`.
3. **In `send-mail.php`:** Update line 25 (`$to = "your-email@example.com";`).

---

## Live Gmail Delivery & Direct PDF Attachments

To deliver directly to your **Primary Gmail Inbox** with the PDF invoice attached as a downloadable file (and never flagged as spam):

1. Enable **2-Step Verification** on your Google Account (`jazib7563@gmail.com`).
2. Generate an **App Password** at: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - App Name: `MAS Tyres`
   - Copy the 16-character code.
3. Open `.env` and set:
   ```ini
   ADMIN_EMAIL=jazib7563@gmail.com
   SMTP_SERVICE=gmail
   SMTP_USER=jazib7563@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```
4. Restart the server (`npm start`). Real emails with the attached PDF will now arrive instantly in your inbox.
