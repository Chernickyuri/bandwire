import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { formatCurrency, formatDate, calculateMonthlyPayment } from './helpers';

export async function generateAgreementPDF(patient, consultation) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const { width, height } = page.getSize();
  
  // Load fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let yPosition = height - 50;
  const lineHeight = 20;
  const sectionSpacing = 30;
  const margin = 50;
  
  // Helper function to add text with word wrap
  const addText = (text, x, y, size, font, color = rgb(0, 0, 0), maxWidth = null, targetPage = page) => {
    if (maxWidth) {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const textWidth = font.widthOfTextAtSize(testLine, size);
        
        if (textWidth > maxWidth && i > 0) {
          targetPage.drawText(line, { x, y: currentY, size, font, color });
          line = words[i] + ' ';
          currentY -= size + 2;
        } else {
          line = testLine;
        }
      }
      targetPage.drawText(line, { x, y: currentY, size, font, color });
      return currentY;
    } else {
      targetPage.drawText(text, { x, y, size, font, color });
      return y;
    }
  };
  
  // Header
  page.drawText('ORTHODONTIC TREATMENT AGREEMENT', {
    x: margin,
    y: yPosition,
    size: 18,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;
  
  page.drawText('Band & Wire Orthodontics', {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBoldFont,
    color: rgb(0, 0.4, 0.6),
  });
  yPosition -= 15;
  
  page.drawText('433 E Ogden Ave, Clarendon Hills, IL 60514', {
    x: margin,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 10;
  
  page.drawText('Phone: (630) 320-8888', {
    x: margin,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= sectionSpacing;
  
  // Draw line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0, 0.4, 0.6),
  });
  yPosition -= sectionSpacing;
  
  // Patient Information
  page.drawText('PATIENT INFORMATION', {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  const patientInfo = [
    ['Patient Name:', patient.name],
    ['Date of Birth:', patient.dob ? formatDate(patient.dob) : 'N/A'],
    ['Email:', patient.email],
    ['Phone:', patient.phone],
  ];
  
  if (patient.insurance) {
    patientInfo.push(['Insurance:', patient.insurance]);
    if (patient.insuranceId) {
      patientInfo.push(['Policy ID:', patient.insuranceId]);
    }
  }
  
  patientInfo.forEach(([label, value]) => {
    page.drawText(label, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(value, {
      x: margin + 120,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
  });
  
  yPosition -= sectionSpacing;
  
  // Treatment Plan
  page.drawText('TREATMENT PLAN', {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  page.drawText(consultation.treatmentName, {
    x: margin,
    y: yPosition,
    size: 11,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 15;
  
  const treatmentDesc = 'This treatment plan includes all necessary orthodontic services, adjustments, and follow-up visits as determined by our board-certified orthodontists.';
  yPosition = addText(treatmentDesc, margin, yPosition, 9, helveticaFont, rgb(0.3, 0.3, 0.3), width - 2 * margin, page) - 20;
  
  // Treatment Breakdown
  if (consultation.breakdown && consultation.breakdown.length > 0) {
    yPosition -= 15;
    page.drawText('Treatment Breakdown:', {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;

    const services = consultation.breakdown.filter(item => item.type === 'service');
    const materials = consultation.breakdown.filter(item => item.type === 'material');

    if (services.length > 0) {
      page.drawText('Services:', {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: helveticaBoldFont,
        color: rgb(0, 0.4, 0.8),
      });
      yPosition -= 12;

      services.forEach((item) => {
        if (yPosition < 100) {
          const newPage = pdfDoc.addPage([612, 792]);
          yPosition = newPage.getSize().height - 50;
        }
        const itemText = `${item.name} (Qty: ${item.quantity})`;
        yPosition = addText(itemText, margin + 20, yPosition, 8, helveticaFont, rgb(0.3, 0.3, 0.3), width - 2 * margin - 100, page) - 10;
        page.drawText(formatCurrency(item.total || 0), {
          x: width - margin - 80,
          y: yPosition + 10,
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 5;
      });
      yPosition -= 5;
    }

    if (materials.length > 0) {
      page.drawText('Materials:', {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: helveticaBoldFont,
        color: rgb(0, 0.6, 0.2),
      });
      yPosition -= 12;

      materials.forEach((item) => {
        if (yPosition < 100) {
          const newPage = pdfDoc.addPage([612, 792]);
          yPosition = newPage.getSize().height - 50;
        }
        const itemText = `${item.name} (Qty: ${item.quantity})`;
        yPosition = addText(itemText, margin + 20, yPosition, 8, helveticaFont, rgb(0.3, 0.3, 0.3), width - 2 * margin - 100, page) - 10;
        page.drawText(formatCurrency(item.total || 0), {
          x: width - margin - 80,
          y: yPosition + 10,
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 5;
      });
    }

    yPosition -= 10;
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPosition -= 10;
    page.drawText('Total Treatment Cost:', {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    const breakdownTotal = consultation.breakdown.reduce((sum, item) => sum + (item.total || 0), 0);
    page.drawText(formatCurrency(breakdownTotal), {
      x: width - margin - 80,
      y: yPosition,
      size: 9,
      font: helveticaBoldFont,
      color: rgb(0, 0.4, 0.6),
    });
    yPosition -= 15;
  }
  
  yPosition -= sectionSpacing;
  
  // Financial Agreement
  page.drawText('FINANCIAL AGREEMENT', {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  const monthlyPayment = calculateMonthlyPayment(
    consultation.totalCost,
    consultation.downPayment,
    consultation.installments
  );
  
  const financialInfo = [
    ['Total Treatment Fee:', formatCurrency(consultation.totalCost)],
    ['Agreement Date:', formatDate(new Date().toISOString())],
    ['Initial Down Payment:', formatCurrency(consultation.downPayment)],
    ['Monthly Payment Amount:', formatCurrency(monthlyPayment)],
    ['Number of Monthly Payments:', `${consultation.installments} months`],
    ['Remaining Balance:', formatCurrency(consultation.totalCost - consultation.downPayment)],
  ];
  
  financialInfo.forEach(([label, value]) => {
    page.drawText(label, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(value, {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
  });
  
  yPosition -= sectionSpacing;
  
  // Terms and Conditions
  page.drawText('TERMS AND CONDITIONS', {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  const terms = [
    '1. Payment Obligations: I understand that payment is due according to the schedule outlined above.',
    '2. Treatment Continuity: I understand that failure to make scheduled payments may result in suspension of treatment.',
    '3. Insurance: If applicable, I understand that insurance benefits are estimated and not guaranteed.',
    '4. Treatment Duration: The estimated treatment time is approximate and may vary based on patient compliance.',
    '5. Patient Responsibilities: I agree to follow all treatment instructions and maintain good oral hygiene.',
    '6. Refund Policy: In the event of early termination, refunds will be calculated based on services rendered.',
    '7. HIPAA Compliance: I acknowledge that Band & Wire Orthodontics maintains strict compliance with HIPAA regulations.',
  ];
  
  let currentPage = page;
  terms.forEach(term => {
    yPosition = addText(term, margin, yPosition, 8, helveticaFont, rgb(0.2, 0.2, 0.2), width - 2 * margin, currentPage) - 10;
    if (yPosition < 100) {
      currentPage = pdfDoc.addPage([612, 792]);
      yPosition = height - 50;
    }
  });
  
  yPosition -= sectionSpacing;
  
  // Acknowledgment
  const ackText = 'ACKNOWLEDGMENT: I have read and understand the terms and conditions of this agreement. I acknowledge that I have been given the opportunity to ask questions, and all my questions have been answered to my satisfaction.';
  yPosition = addText(ackText, margin, yPosition, 9, helveticaFont, rgb(0, 0, 0), width - 2 * margin, currentPage) - 20;
  
  yPosition -= sectionSpacing;
  
  // Signature Section
  currentPage.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5),
  });
  yPosition -= 20;
  
  currentPage.drawText('Patient/Parent/Guardian Signature:', {
    x: margin,
    y: yPosition,
    size: 10,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 40;
  
  currentPage.drawText('Date:', {
    x: width - margin - 100,
    y: yPosition + 20,
    size: 10,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  currentPage.drawText('Print Name:', {
    x: margin,
    y: yPosition,
    size: 10,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  currentPage.drawText('Band & Wire Orthodontics Authorized Representative:', {
    x: margin,
    y: yPosition,
    size: 10,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 15;
  
  currentPage.drawText('Dr. Ramzi Daibis or Dr. Tamara Oweis', {
    x: margin,
    y: yPosition,
    size: 9,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  // Footer
  yPosition = 30;
  currentPage.drawText('This agreement is subject to the laws of the State of Illinois.', {
    x: margin,
    y: yPosition,
    size: 8,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function downloadAgreementPDF(patient, consultation) {
  const pdfBytes = await generateAgreementPDF(patient, consultation);
  
  // Create a blob and download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Treatment_Agreement_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

