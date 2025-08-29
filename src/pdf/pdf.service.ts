import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class PdfService {
  private config: any;

  constructor() {
    // Load config.json file
    const configPath = 'src/pdf/config.json';
    this.config = JSON.parse(readFileSync(configPath, 'utf-8'));
  }

  async generatePdf(): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let yPosition = page.getHeight() - 50;

    // Load and embed the logo
    const logoPath = join('src/images/', 'tathastu-black-logo.png'); // Adjust path as needed
    const logoImage = readFileSync(logoPath);
    const logo = await pdfDoc.embedPng(logoImage);

    // Calculate logo dimensions (maintaining aspect ratio)
    const logoWidth = 200; // Adjust as needed
    const logoHeight = (logo.height / logo.width) * logoWidth;

    // Draw logo
    page.drawImage(logo, {
      x: 50,
      y: yPosition - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });
    // Draw title
    page.drawText(this.config.title, {
      x: logoWidth - 50,
      y: yPosition,
      size: 16,
      font,
    });

    // Draw hospital details
    yPosition -= 20;
    page.drawText(this.config.hospitalDetails.address, {
      x: logoWidth - 50,
      y: yPosition,
      size: 10,
      font,
    });
    yPosition -= 20;
    page.drawText(`Mobile No: ${this.config.hospitalDetails.mobile}`, {
      x: logoWidth - 50,
      y: yPosition,
      size: 10,
      font,
    });

    // Draw patient details
    yPosition -= 50;
    const patient = this.config.patientDetails;
    page.drawText(`Date: ${patient.date}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font,
    });
    page.drawText(`Patient's Name: ${patient.name}`, {
      x: 50,
      y: yPosition - 15,
      size: 10,
      font,
    });
    page.drawText(`Bill No: ${patient.billNo}`, {
      x: 300,
      y: yPosition,
      size: 10,
      font,
    });
    page.drawText(`Ward: ${patient.ward}`, {
      x: 300,
      y: yPosition - 15,
      size: 10,
      font,
    });

    // Table configuration
    const tableTop = yPosition - 70;
    const tableLeft = 50;
    const columnWidths = [150, 80, 80, 100];
    const rowHeight = 20;
    const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    let currentY = tableTop;

    // Draw table header
    const headers = ['DESCRIPTION', 'CHARGES', 'QUANTITY', 'AMOUNT RS'];
    let currentX = tableLeft;

    // Draw table header border
    page.drawLine({
      start: { x: tableLeft, y: currentY + rowHeight },
      end: { x: tableLeft + tableWidth, y: currentY + rowHeight },
      color: rgb(0, 0, 0),
    });

    // Draw header cells
    headers.forEach((header, index) => {
      // Draw vertical lines
      page.drawLine({
        start: { x: currentX, y: currentY },
        end: { x: currentX, y: currentY + rowHeight },
        color: rgb(0, 0, 0),
      });

      page.drawText(header, {
        x: currentX + 5,
        y: currentY + 5,
        size: 10,
        font,
      });

      currentX += columnWidths[index];
    });

    // Draw last vertical line of header
    page.drawLine({
      start: { x: currentX, y: currentY },
      end: { x: currentX, y: currentY + rowHeight },
      color: rgb(0, 0, 0),
    });

    // Draw horizontal line below header
    page.drawLine({
      start: { x: tableLeft, y: currentY },
      end: { x: tableLeft + tableWidth, y: currentY },
      color: rgb(0, 0, 0),
    });

    // Draw charges rows
    currentY -= rowHeight;
    for (const charge of this.config.charges) {
      currentX = tableLeft;

      // Draw row data
      page.drawText(charge.description, {
        x: currentX + 5,
        y: currentY + 5,
        size: 10,
        font,
      });
      page.drawText(charge.charges.toString(), {
        x: currentX + columnWidths[0] + 5,
        y: currentY + 5,
        size: 10,
        font,
      });
      page.drawText(charge.quantity.toString(), {
        x: currentX + columnWidths[0] + columnWidths[1] + 5,
        y: currentY + 5,
        size: 10,
        font,
      });
      page.drawText(charge.amount.toString(), {
        x: currentX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
        y: currentY + 5,
        size: 10,
        font,
      });

      // Draw vertical lines for each row
      for (let i = 0; i <= columnWidths.length; i++) {
        const x =
          tableLeft +
          columnWidths.slice(0, i).reduce((sum, width) => sum + width, 0);
        page.drawLine({
          start: { x, y: currentY },
          end: { x, y: currentY + rowHeight },
          color: rgb(0, 0, 0),
        });
      }

      // Draw horizontal line below row
      page.drawLine({
        start: { x: tableLeft, y: currentY },
        end: { x: tableLeft + tableWidth, y: currentY },
        color: rgb(0, 0, 0),
      });

      currentY -= rowHeight;
    }

    // Draw total amount
    currentY -= 10;
    page.drawText(`Total Amount: ${this.config.totalAmount}`, {
      x: 330,
      y: currentY,
      size: 12,
      font,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
