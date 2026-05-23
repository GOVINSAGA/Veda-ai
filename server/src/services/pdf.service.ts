import PDFDocument from 'pdfkit';
import { IGeneratedPaper } from '../models/Assignment';

export function generatePDF(paper: IGeneratedPaper): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      // School Header
      doc.fontSize(16).font('Helvetica-Bold').text(paper.school, { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(12).font('Helvetica').text(`Subject: ${paper.subject}`, { align: 'center' });
      doc.fontSize(12).text(`Class: ${paper.className}`, { align: 'center' });
      doc.moveDown(0.8);

      // Time and Marks row
      const y = doc.y;
      doc.fontSize(10).font('Helvetica-Bold').text(`Time Allowed: ${paper.timeAllowed}`, doc.page.margins.left, y);
      doc.text(`Maximum Marks: ${paper.maxMarks}`, doc.page.margins.left, y, {
        align: 'right',
        width: pageWidth,
      });
      doc.moveDown(0.8);

      // Instructions
      doc.fontSize(10).font('Helvetica-Bold').text('All questions are compulsory unless stated otherwise.');
      doc.moveDown(0.6);

      // Student Info
      doc.fontSize(10).font('Helvetica').text('Name: ___________________');
      doc.text('Roll Number: _______________');
      doc.text('Class: _____ Section: _________');
      doc.moveDown(1);

      // Sections
      for (const section of paper.sections) {
        // Section Title
        doc.fontSize(14).font('Helvetica-Bold').text(section.title, { align: 'center' });
        doc.moveDown(0.3);

        // Section type and instruction
        doc.fontSize(11).font('Helvetica-Bold').text(section.questionType);
        doc.fontSize(9).font('Helvetica-Oblique').text(section.instruction);
        doc.moveDown(0.5);

        // Questions
        for (const question of section.questions) {
          const diffLabel = `[${question.difficulty}]`;
          const marksLabel = `[${question.marks} Marks]`;
          const questionText = `${question.number}. ${diffLabel} ${question.text} ${marksLabel}`;

          doc.fontSize(10).font('Helvetica').text(questionText, {
            width: pageWidth,
            lineGap: 2,
          });
          doc.moveDown(0.4);
        }

        doc.moveDown(0.5);
      }

      // End of Question Paper
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica-Bold').text('End of Question Paper', { align: 'center' });
      doc.moveDown(1.5);

      // Answer Key
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('Answer Key:', { underline: true });
      doc.moveDown(0.5);

      let answerNumber = 1;
      for (const section of paper.sections) {
        for (const question of section.questions) {
          if (question.answer) {
            doc.fontSize(10).font('Helvetica').text(`${answerNumber}. ${question.answer}`, {
              width: pageWidth,
              lineGap: 2,
            });
            doc.moveDown(0.3);
          }
          answerNumber++;
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
