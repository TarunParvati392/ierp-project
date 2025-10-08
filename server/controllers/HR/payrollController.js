const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sendEmail = require('../../utils/sendEmail');

/**
 * Create a payslip PDF buffer for a single row and return it.
 * Adds centered header logo and background watermark logo.
 * @param {Object} row - object containing payroll fields
 * @param {Buffer|string} headerLogo - path or buffer for header logo
 * @param {Buffer|string} watermarkLogo - path or buffer for watermark
 */
function createPayslipPdfBuffer(row, headerLogo, watermarkLogo) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Optional watermark: draw watermark image with low opacity centered
      if (watermarkLogo) {
        try {
          const watermarkPath = typeof watermarkLogo === 'string' ? watermarkLogo : null;
          // place watermark centered and large
          const { width, height } = doc.page;
          doc.opacity(0.08);
          if (watermarkPath && fs.existsSync(watermarkPath)) {
            doc.image(watermarkPath, width / 2 - 200, height / 2 - 200, { width: 400 });
          }
          doc.opacity(1);
        } catch (e) {
          // ignore watermark errors
          doc.opacity(1);
        }
      }

      // Header: centered logo
      if (headerLogo) {
        try {
          const headerPath = typeof headerLogo === 'string' ? headerLogo : null;
          if (headerPath && fs.existsSync(headerPath)) {
            const pageWidth = doc.page.width;
            const imgWidth = 120;
            const x = (pageWidth - imgWidth) / 2;
            doc.image(headerPath, x, 40, { width: imgWidth });
            doc.moveDown(4);
          }
        } catch (e) {
          // ignore header image errors
        }
      }

      // Row data mapping (safe access)
      const get = (k) => row[k] ?? '';

      // Title
      doc.moveDown(2);
      doc.fontSize(16).font('Helvetica-Bold').text('PAY SLIP', { align: 'center' });
      doc.moveDown(1);
      
      doc.fontSize(12).font('Helvetica-Bold').text(`Payslip for the month of ${get('Pay Month') || ''}`, { align: 'left' });
      doc.fontSize(12).font('Helvetica').text(`Pay Date: ${get('Pay Date') || ''}`, { align: 'left' });
      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
      doc.moveDown(0.5);

      // Employee details section as plain text (no borders)
      doc.fontSize(10).font('Helvetica');
      const empRows = [
        [
          ['Emp No.', get('Emp No')],
          ['Employee Name', get('Name')]
        ],
        [
          ['Department', get('Department')],
          ['Designation', get('Designation')]
        ],
        [
          ['Gender', get('Gender')],
          ['Paid Days', get('Paid Days')]
        ],
        [
          ['PF UAN No', get('PF UAN No')],
          ['ESIC No', get('ESIC No')]
        ],
        [
          ['Bank Acc No', get('Bank Acc No')],
          ['Pan Number', get('Pan Number')]
        ]
      ];
      const empLabelWidth = 110;
      const empValueWidth = 110;
      const empTableWidth = (empLabelWidth + empValueWidth) * 2;
      const empTableX = (doc.page.width - empTableWidth) / 2;
      const empStartY = doc.y;
      for (let r = 0; r < empRows.length; r++) {
        for (let c = 0; c < 2; c++) {
          const label = empRows[r][c][0];
          const value = empRows[r][c][1];
          const x = empTableX + c * (empLabelWidth + empValueWidth);
          const y = empStartY + r * 18;
          doc.text(label + ':', x, y, { width: empLabelWidth - 8, align: 'left' });
          doc.text(value, x + empLabelWidth, y, { width: empValueWidth - 8, align: 'left' });
        }
      }
      let tableY = empStartY + empRows.length * 18 + 18;



      // Earnings and Deductions Table as per screenshot
      doc.font('Helvetica-Bold');
      const earnDedCellHeight = 22;
      const earnLabelW = 120, earnAmtW = 60, dedLabelW = 120, dedAmtW = 60;
      const earnDedTableWidth = earnLabelW + earnAmtW + dedLabelW + dedAmtW;
      const earnDedX = (doc.page.width - earnDedTableWidth) / 2;
      // Table headers with gray background
      doc.save();
      doc.rect(earnDedX, tableY, earnLabelW, earnDedCellHeight).fillAndStroke('#e0e0e0', 'black');
      doc.rect(earnDedX + earnLabelW, tableY, earnAmtW, earnDedCellHeight).fillAndStroke('#e0e0e0', 'black');
      doc.rect(earnDedX + earnLabelW + earnAmtW, tableY, dedLabelW, earnDedCellHeight).fillAndStroke('#e0e0e0', 'black');
      doc.rect(earnDedX + earnLabelW + earnAmtW + dedLabelW, tableY, dedAmtW, earnDedCellHeight).fillAndStroke('#e0e0e0', 'black');
      doc.fillColor('black').text('Earnings', earnDedX + 4, tableY + 6, { width: earnLabelW - 8, align: 'left' });
      doc.text('Amount', earnDedX + earnLabelW + 4, tableY + 6, { width: earnAmtW - 8, align: 'right' });
      doc.text('Deductions', earnDedX + earnLabelW + earnAmtW + 4, tableY + 6, { width: dedLabelW - 8, align: 'left' });
      doc.text('Amount', earnDedX + earnLabelW + earnAmtW + dedLabelW + 4, tableY + 6, { width: dedAmtW - 8, align: 'right' });
      doc.restore();
      doc.font('Helvetica');

      // Earnings and deductions rows (customize as per screenshot)
      const earnings = [
        ['BASIC', get('BASIC')],
        ['DA', get('DA')],
        ['HRA', get('HRA')],
        ['Other Allowances', get('IR/Allowance')],
        ['Arrears', get('Arrears')]
      ];
      const deductions = [
        ['Professional Tax', get('Professional Tax')],
        ['Loan', get('Loan')],
      ];
      const earnDedMaxRows = Math.max(earnings.length, deductions.length);
      let earnDedRowY = tableY + earnDedCellHeight;
      for (let i = 0; i < earnDedMaxRows; i++) {
        // Borders
        doc.rect(earnDedX, earnDedRowY, earnLabelW, earnDedCellHeight).stroke();
        doc.rect(earnDedX + earnLabelW, earnDedRowY, earnAmtW, earnDedCellHeight).stroke();
        doc.rect(earnDedX + earnLabelW + earnAmtW, earnDedRowY, dedLabelW, earnDedCellHeight).stroke();
        doc.rect(earnDedX + earnLabelW + earnAmtW + dedLabelW, earnDedRowY, dedAmtW, earnDedCellHeight).stroke();
        // Earnings text
        if (earnings[i]) {
          doc.text(earnings[i][0], earnDedX + 4, earnDedRowY + 6, { width: earnLabelW - 8, align: 'left' });
          doc.text(String(earnings[i][1] || ''), earnDedX + earnLabelW + 4, earnDedRowY + 6, { width: earnAmtW - 8, align: 'right' });
        }
        // Deductions text
        if (deductions[i]) {
          doc.text(deductions[i][0], earnDedX + earnLabelW + earnAmtW + 4, earnDedRowY + 6, { width: dedLabelW - 8, align: 'left' });
          doc.text(String(deductions[i][1] || ''), earnDedX + earnLabelW + earnAmtW + dedLabelW + 4, earnDedRowY + 6, { width: dedAmtW - 8, align: 'right' });
        }
        earnDedRowY += earnDedCellHeight;
      }
      // Totals row
      doc.font('Helvetica-Bold');
      doc.rect(earnDedX, earnDedRowY, earnLabelW, earnDedCellHeight).stroke();
      doc.rect(earnDedX + earnLabelW, earnDedRowY, earnAmtW, earnDedCellHeight).stroke();
      doc.rect(earnDedX + earnLabelW + earnAmtW, earnDedRowY, dedLabelW, earnDedCellHeight).stroke();
      doc.rect(earnDedX + earnLabelW + earnAmtW + dedLabelW, earnDedRowY, dedAmtW, earnDedCellHeight).stroke();
      doc.text('Total Earnings', earnDedX + 4, earnDedRowY + 6, { width: earnLabelW - 8, align: 'left' });
      doc.text(String(get('Gross Earning')), earnDedX + earnLabelW + 4, earnDedRowY + 6, { width: earnAmtW - 8, align: 'right' });
      doc.text('Total Deductions', earnDedX + earnLabelW + earnAmtW + 4, earnDedRowY + 6, { width: dedLabelW - 8, align: 'left' });
      doc.text(String(get('Gross Deduction')), earnDedX + earnLabelW + earnAmtW + dedLabelW + 4, earnDedRowY + 6, { width: dedAmtW - 8, align: 'right' });
      earnDedRowY += earnDedCellHeight;
      // Net Pay row (spanning last two columns)
      doc.rect(earnDedX + earnLabelW + earnAmtW, earnDedRowY, dedLabelW, earnDedCellHeight).stroke();
      doc.rect(earnDedX + earnLabelW + earnAmtW + dedLabelW, earnDedRowY, dedAmtW, earnDedCellHeight).stroke();
      doc.text('Net Pay', earnDedX + earnLabelW + earnAmtW + 4, earnDedRowY + 6, { width: dedLabelW - 8, align: 'left' });
      doc.text(String(get('Net Amount')), earnDedX + earnLabelW + earnAmtW + dedLabelW + 4, earnDedRowY + 6, { width: dedAmtW - 8, align: 'right' });
      doc.font('Helvetica');
  // Net Pay and Net Pay in Words below table, centered
  doc.fontSize(11).text('Net Pay in Words: ' + String(get('Net Pay in Words')), earnDedX, earnDedRowY + earnDedCellHeight + 30, { width: earnDedTableWidth, align: 'center' });
  doc.y = earnDedRowY + earnDedCellHeight * 2 + 20;

  // Computer generated note (footer)
  doc.moveDown(18);
  doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
  doc.moveDown(1);
  doc.fontSize(10).font('Helvetica').text('This is a computer generated payslip. Signature is not needed.', { align: 'center' });
  doc.moveDown(1);
  doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();

  doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * POST /api/payroll/send-mails
 * body: { rows: [ { ... } ], headerLogoPath?, watermarkLogoPath? }
 */
exports.sendPayrollMails = async (req, res) => {
  try {
    const { rows, headerLogoPath, watermarkLogoPath } = req.body;
    if (!rows || !Array.isArray(rows) || rows.length === 0) return res.status(400).json({ message: 'rows array required' });

    // Use provided paths or fallback to server/uploads logos
    const headerLogo = headerLogoPath || path.join(__dirname, '../../uploads/header.png');
    const watermarkLogo = watermarkLogoPath || path.join(__dirname, '../../uploads/watermark.png');

    const results = [];
    for (const row of rows) {
      const email = row['Email'] || row['email'];
      if (!email) {
        results.push({ row, status: 'skipped', reason: 'no email' });
        continue;
      }

      const pdfBuffer = await createPayslipPdfBuffer(row, headerLogo, watermarkLogo);

      // prepare attachment
      const attachments = [
        {
          filename: `payslip_${String(row['Emp No'] || row['EmpNo'] || 'emp')}.pdf`,
          content: pdfBuffer,
        },
      ];

      // send email (subject and simple html)
      const subject = `Pay slip for ${row['Name'] || ''}`;
      const html = `<p>Dear ${row['Name'] || ''},</p><p>Please find attached your payslip.</p>`;

      try {
        await sendEmail(email, subject, null, html, attachments);
        results.push({ row, status: 'sent' });
      } catch (mailErr) {
        console.error('mail err', mailErr);
        results.push({ row, status: 'failed', reason: mailErr.message || String(mailErr) });
      }
    }

    return res.json({ message: 'done', results });
  } catch (err) {
    console.error('sendPayrollMails error:', err);
    return res.status(500).json({ message: 'Failed to send payroll mails' });
  }
};
