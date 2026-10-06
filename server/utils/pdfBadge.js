const PDFDocument = require('pdfkit');

/**
 * Generate a PDF stream for a Visitor Pass Badge
 * @param {Object} pass - Populated Pass document
 * @param {Object} res - Express response stream
 */
const generatePassPDF = (pass, res) => {
  const doc = new PDFDocument({
    size: [300, 480], // ID Badge size (portrait)
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  // Pipe directly to response
  doc.pipe(res);

  const visitor = pass.visitor || {};
  const host = pass.host || {};
  const appointment = pass.appointment || {};

  // Header Banner
  doc.rect(0, 0, 300, 70).fill('#1e3a8a'); // Dark Navy Blue
  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('VISITOR PASS', 20, 20, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('TechCorp Solutions HQ', 20, 42, { align: 'center' });

  // Pass Code Badge
  doc.rect(20, 80, 260, 30).fill('#f1f5f9');
  doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(`PASS #: ${pass.passCode}`, 20, 88, { align: 'center' });

  // Visitor Name
  doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(visitor.fullName || 'Visitor', 20, 125, { align: 'center' });
  doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(visitor.company || 'Individual / Guest', 20, 142, { align: 'center' });

  // Details Grid
  doc.moveDown(1.5);
  const startY = 165;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155');

  doc.text('Host Employee:', 25, startY);
  doc.font('Helvetica').fillColor('#0f172a').text(host.name ? `${host.name} (${host.department || 'General'})` : 'Staff Member', 105, startY);

  doc.font('Helvetica-Bold').fillColor('#334155').text('Purpose:', 25, startY + 18);
  doc.font('Helvetica').fillColor('#0f172a').text(appointment.purpose || 'Official Visit', 105, startY + 18);

  doc.font('Helvetica-Bold').fillColor('#334155').text('Date & Time:', 25, startY + 36);
  const formattedDate = pass.validFrom ? new Date(pass.validFrom).toLocaleDateString() : new Date().toLocaleDateString();
  doc.font('Helvetica').fillColor('#0f172a').text(`${formattedDate} at ${appointment.visitTime || '10:00 AM'}`, 105, startY + 36);

  doc.font('Helvetica-Bold').fillColor('#334155').text('Gate/Entry:', 25, startY + 54);
  doc.font('Helvetica').fillColor('#0f172a').text(pass.gateNumber || 'Gate 1 (Main Entrance)', 105, startY + 54);

  // Divider
  doc.moveTo(20, 245).lineTo(280, 245).strokeColor('#cbd5e1').stroke();

  // QR Code
  if (pass.qrCode && pass.qrCode.startsWith('data:image/png;base64,')) {
    const base64Data = pass.qrCode.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(base64Data, 'base64');
    doc.image(qrBuffer, 90, 255, { width: 120, height: 120 });
  }

  // Footer Instructions
  doc.fontSize(8).font('Helvetica-Oblique').fillColor('#64748b').text('Please wear this badge at all times.', 20, 395, { align: 'center' });
  doc.text('Scan at Security on Entry and Exit.', 20, 410, { align: 'center' });

  // Security Verification status bar
  doc.rect(20, 435, 260, 25).fill(pass.status === 'Active' ? '#10b981' : '#f59e0b');
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(`STATUS: ${pass.status.toUpperCase()}`, 20, 442, { align: 'center' });

  doc.end();
};

module.exports = { generatePassPDF };
