import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { readFileSync } from 'fs';

@Injectable()
export class ExcelService {
  private config: any;

  constructor() {
    // Load config.json file
    const configPath = 'src/excel/config.json';
    this.config = JSON.parse(readFileSync(configPath, 'utf-8'));
  }

  /**
   * Exports the config data to an Excel file and sends it as a downloadable response
   * @param res Express response object
   */
  async exportExcel(res: any) {
    try {
      const data = this.config;

      // Check if data is available
      if (!data || data.length === 0) {
        res.status(400).json({ message: 'No data found' });
        return;
      }

      // Create a new workbook and worksheet
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Excel Export');

      // Define worksheet columns based on data keys
      worksheet.columns = Object.keys(data[0]).map((key) => ({
        header: key.toUpperCase(),
        key: key,
        width: 20,
      }));

      // Add data rows
      worksheet.addRows(data);

      // Write workbook to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set response headers for Excel file download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=excel-data.xlsx',
      );

      // Send the file buffer as the response
      res.send(Buffer.from(buffer));
      console.log('Excel file sent for download');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      res.status(500).json({ message: 'Error exporting to Excel' });
    }
  }
}
