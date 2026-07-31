import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection26 } from './entities/inspection26.entity';
import { CreateInspection26Dto } from './dto/create-inspection26.dto';
import { emailTransporter } from 'src/packages/nodemailer/transporter';

@Injectable()
export class Inspection26Service {
  constructor(
    @InjectRepository(Inspection26)
    private readonly inspection26Repository: Repository<Inspection26>,
  ) {}

  async create(createDto: CreateInspection26Dto, user: any): Promise<Inspection26> {
    const newInspection = this.inspection26Repository.create({
      ...createDto,
      client_id: user.id,
      created_by: user.id,
      modified_by: user.id,
      created_on: Date.now(),
      modified_on: Date.now(),
    });
    const savedInspection = await this.inspection26Repository.save(newInspection);
    return savedInspection;
  }

  async findAll(user: any): Promise<Inspection26[]> {
    const roleName = user?.role?.name || user?.roleName || user?.role;
    
    const qb = this.inspection26Repository.createQueryBuilder('inspection')
      .leftJoinAndSelect('inspection.site', 'site')
      .leftJoinAndSelect('inspection.exterior', 'exterior')
      .leftJoinAndSelect('inspection.interior', 'interior')
      .leftJoinAndSelect('inspection.basement', 'basement')
      .leftJoinAndSelect('inspection.measurements', 'measurements')
      .where('inspection.deleted = :deleted', { deleted: false });

    if (roleName === 'Client' || roleName === 'client') {
      // qb.leftJoin('orders', 'o', 'CAST(o.id AS VARCHAR) = inspection.fileno')
      //   .andWhere('(inspection.client_id = :userId OR inspection.created_by = :userId OR o.createdby = :username OR o.createdby = :email OR o.createdby = :userIdString)', {
      //     userId: user.id,
      //     username: user.username || '',
      //     email: user.email || '',
      //     userIdString: `${user.id}`
      //   });
      qb.andWhere('(inspection.client_id = :userId OR inspection.created_by = :userId)', {
        userId: user.id
      });
    }

    qb.orderBy('inspection.created_on', 'DESC');
    
    return await qb.getMany();
  }

  async findOne(id: string, user: any): Promise<Inspection26> {
    const roleName = user?.role?.name || user?.roleName || user?.role;
    
    const qb = this.inspection26Repository.createQueryBuilder('inspection')
      .leftJoinAndSelect('inspection.site', 'site')
      .leftJoinAndSelect('inspection.exterior', 'exterior')
      .leftJoinAndSelect('inspection.interior', 'interior')
      .leftJoinAndSelect('inspection.basement', 'basement')
      .leftJoinAndSelect('inspection.measurements', 'measurements')
      .where('inspection.id = :id', { id })
      .andWhere('inspection.deleted = :deleted', { deleted: false });

    if (roleName === 'Client' || roleName === 'client') {
      // qb.leftJoin('orders', 'o', 'CAST(o.id AS VARCHAR) = inspection.fileno')
      //   .andWhere('(inspection.client_id = :userId OR inspection.created_by = :userId OR o.createdby = :username OR o.createdby = :email OR o.createdby = :userIdString)', {
      //     userId: user.id,
      //     username: user.username || '',
      //     email: user.email || '',
      //     userIdString: `${user.id}`
      //   });
      qb.andWhere('(inspection.client_id = :userId OR inspection.created_by = :userId)', {
        userId: user.id
      });
    }

    const inspection = await qb.getOne();
    
    if (!inspection) {
      if (roleName === 'Client' || roleName === 'client') {
        const exists = await this.inspection26Repository.findOne({ where: { id, deleted: false } });
        if (exists) {
          throw new ForbiddenException('You do not have access to this inspection.');
        }
      }
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    return inspection;
  }

  async update(id: string, updateDto: any, user: any): Promise<Inspection26> {
    const inspection = await this.findOne(id, user);

    // Deep merge updateDto into inspection (assuming basic objects)
    // TypeORM handles cascade updates if you pass the nested object with IDs
    Object.assign(inspection, updateDto);
    inspection.modified_by = user.id;
    inspection.modified_on = Date.now();

    return await this.inspection26Repository.save(inspection);
  }

  async remove(id: string, user: any): Promise<void> {
    const inspection = await this.findOne(id, user);
    inspection.deleted = true;
    inspection.modified_by = user.id;
    inspection.modified_on = Date.now();
    await this.inspection26Repository.save(inspection);
  }

  async emailPdf(file: Express.Multer.File, user: any): Promise<{ message: string }> {
    const notifyTo = process.env.SMTP_ORDER_NOTIFY_TO;
    if (!notifyTo) {
      throw new Error('SMTP_ORDER_NOTIFY_TO is not configured');
    }

    const clientName = [user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username || 'Client';
    const clientId = user?.id || 'Unknown';

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: notifyTo,
      subject: `Inspection 2.6 Data PDF Submitted`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
  <div style="background-color: #2563eb; padding: 20px; text-align: center;">
    <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Inspection 2.6 Data Submitted</h2>
  </div>
  <div style="padding: 30px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello Admin,</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">A new <strong>UAD 2.6</strong> field inspection report has been submitted.</p>
    <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
      <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Submitted By:</strong> ${clientName}</p>
      <p style="margin: 0; font-size: 15px;"><strong>Client ID:</strong> ${clientId}</p>
    </div>
    <p style="font-size: 16px; margin-bottom: 30px; line-height: 1.5;">Please find the complete inspection details attached to this email as a PDF document.</p>
    <p style="font-size: 14px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
      Automated Message<br/>
      <strong>BackBone Data Solutions System</strong>
    </p>
  </div>
</div>
`,
      attachments: [
        {
          filename: 'Inspection_2.6.pdf',
          content: file.buffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return { message: 'PDF emailed successfully' };
  }

  async generatePdfBytes(data: any, user: any): Promise<Uint8Array> {
    

    const clientName = [user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username || 'Client';
    const clientId = user?.id || 'Unknown';

    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const PW = 612, PH = 792, M = 36;
    let page = pdfDoc.addPage([PW, PH]);
    let y = PH - M;

    const newPage = () => { page = pdfDoc.addPage([PW, PH]); y = PH - M; };
    const check = (need: number) => { if (y < M + need) newPage(); };

    const getVal = (id: string): string => {
      const v = data[id];
      if (v === null || v === undefined) return '';
      if (Array.isArray(v)) return v.join(', ');
      if (typeof v === 'boolean') return v ? 'Yes' : 'No';
      return String(v);
    };

    // Header Banner
    page.drawRectangle({ x: 0, y: PH - 50, width: PW, height: 50, color: rgb(0.06, 0.11, 0.23) });
    page.drawText('UAD 2.6 Field Inspection Report', { x: M, y: PH - 32, size: 16, font: boldFont, color: rgb(1, 1, 1) });
    y = PH - 65;
    page.drawText(`Submitted By: ${clientName}   |   Client ID: ${clientId}   |   Date: ${new Date().toLocaleDateString()}`, { x: M, y, size: 9, font, color: rgb(0.4, 0.45, 0.5) });
    y -= 20;

    const drawSectionHeader = (title: string, subtitle?: string) => {
      check(40);
      y -= 10;
      page.drawText(title, { x: M, y: y, size: 14, font: boldFont, color: rgb(0.06, 0.11, 0.23) });
      if (subtitle) {
        page.drawText(`(${subtitle})`, { x: M + font.widthOfTextAtSize(title, 14) + 10, y: y, size: 9, font, color: rgb(0.45, 0.5, 0.55) });
      }
      y -= 10;
      page.drawLine({ start: { x: M, y }, end: { x: PW - M, y }, thickness: 1, color: rgb(0.88, 0.91, 0.94) });
      y -= 15;
    };

    const drawInputRow = (fields: { label: string; id: string }[]) => {
      check(48);
      const count = Math.min(fields.length, 4);
      const gap = 8;
      const totalGap = gap * (count - 1);
      const boxW = (540 - totalGap) / count;
      
      fields.slice(0, count).forEach((f, idx) => {
        const startX = M + idx * (boxW + gap);
        const val = getVal(f.id);
        
        page.drawText(f.label, { x: startX, y: y, size: 8.5, font: boldFont, color: rgb(0.12, 0.16, 0.23) });
        
        const boxY = y - 12 - 24;
        page.drawRectangle({
          x: startX,
          y: boxY,
          width: boxW,
          height: 24,
          borderColor: rgb(0.88, 0.91, 0.94),
          borderWidth: 1,
          color: rgb(0.98, 0.99, 1.0)
        });
        
        if (val) {
          page.drawText(val, {
            x: startX + 8,
            y: boxY + 7,
            size: 9,
            font: font,
            color: rgb(0.06, 0.09, 0.16),
            maxWidth: boxW - 16
          });
        }
      });

      y -= 46;
    };

    const drawRadioGroup = (label: string, id: string, options: string[]) => {
      const selectedVal = data[id];
      const selectedList = Array.isArray(selectedVal) ? selectedVal : (selectedVal !== undefined && selectedVal !== null && selectedVal !== '' ? [String(selectedVal)] : []);
      
      check(45);
      page.drawText(label, { x: M, y: y, size: 9, font: boldFont, color: rgb(0.12, 0.16, 0.23) });
      y -= 14;

      let curX = M;
      const pillH = 20;
      
      options.forEach((opt) => {
        const isSelected = selectedList.includes(opt);
        const textW = (isSelected ? boldFont : font).widthOfTextAtSize(opt, 8.5);
        const pillW = Math.max(textW + 16, 36);

        if (curX + pillW > PW - M) {
          y -= pillH + 6;
          check(pillH + 10);
          curX = M;
        }

        const pillY = y - pillH;

        page.drawRectangle({
          x: curX,
          y: pillY,
          width: pillW,
          height: pillH,
          borderColor: isSelected ? rgb(0.31, 0.27, 0.9) : rgb(0.88, 0.91, 0.94),
          borderWidth: isSelected ? 1.5 : 1,
          color: isSelected ? rgb(0.95, 0.96, 1.0) : rgb(0.98, 0.99, 1.0)
        });

        page.drawText(opt, {
          x: curX + 8,
          y: pillY + 6,
          size: 8.5,
          font: isSelected ? boldFont : font,
          color: isSelected ? rgb(0.25, 0.2, 0.8) : rgb(0.4, 0.45, 0.5)
        });

        curX += pillW + 6;
      });

      y -= pillH + 12;
    };

    const drawPhotoCheckboxes = (options: string[]) => {
      check(35);
      page.drawText("Photos", { x: M, y: y, size: 9, font: boldFont, color: rgb(0.1, 0.5, 0.2) });
      y -= 14;

      let curX = M;
      const boxH = 18;
      
      options.forEach((opt) => {
        const fieldName = "p_" + opt.replace(/[^a-zA-Z0-9]/g, '_');
        const isChecked = !!data[fieldName];
        const textW = font.widthOfTextAtSize(opt, 8);
        const boxW = textW + 24;

        if (curX + boxW > PW - M) {
          y -= boxH + 4;
          check(boxH + 8);
          curX = M;
        }

        const itemY = y - boxH;

        page.drawRectangle({
          x: curX,
          y: itemY,
          width: boxW,
          height: boxH,
          borderColor: isChecked ? rgb(0.1, 0.5, 0.2) : rgb(0.88, 0.91, 0.94),
          borderWidth: 1,
          color: isChecked ? rgb(0.92, 0.98, 0.94) : rgb(0.98, 0.99, 1.0)
        });

        page.drawText(isChecked ? "[✓]" : "[  ]", {
          x: curX + 4,
          y: itemY + 4,
          size: 8,
          font: boldFont,
          color: isChecked ? rgb(0.1, 0.5, 0.2) : rgb(0.6, 0.65, 0.7)
        });

        page.drawText(opt, {
          x: curX + 20,
          y: itemY + 5,
          size: 8,
          font: font,
          color: isChecked ? rgb(0.05, 0.35, 0.15) : rgb(0.3, 0.35, 0.4)
        });

        curX += boxW + 6;
      });

      y -= boxH + 10;
    };

    // ─── STEP 0: PROPERTY INFO ───
    drawSectionHeader("Property");
    drawInputRow([{ label: "Property Address", id: "address" }, { label: "City", id: "city" }]);
    drawInputRow([{ label: "State/Zip", id: "stzip" }, { label: "Date of Inspection", id: "date" }, { label: "File No", id: "fileno" }]);
    drawInputRow([{ label: "Appraiser", id: "appraiser" }, { label: "Borrower", id: "borrower" }]);
    drawInputRow([{ label: "Time In", id: "timein" }, { label: "Time Out", id: "timeout" }]);
    drawRadioGroup("Report Type", "reporttype", ["URAR", "Condo", "Multifamily", "Manufactured", "Exterior Only"]);
    drawRadioGroup("Occupant", "occupant", ["Owner", "Tenant", "Vacant"]);
    drawRadioGroup("Dwelling Style", "dwelling_style", ["Ranch", "Colonial", "Split Level", "Split Foyer", "Cape Cod", "Contemporary", "Bi-Level", "Tri-Level", "Townhouse", "Condo", "Other"]);
    drawRadioGroup("Structure", "structure", ["Detached", "Attached", "Semi-Detached"]);
    drawInputRow([{ label: "Units", id: "units" }, { label: "Stories", id: "stories" }, { label: "Year Built", id: "yearbuilt" }]);
    drawInputRow([{ label: "Age", id: "age" }, { label: "Effective Age", id: "effage" }, { label: "Rem Econ Life", id: "rel" }]);
    drawRadioGroup("PUD?", "pud", ["Yes", "No"]);
    drawInputRow([{ label: "HOA $", id: "hoa" }, { label: "HOA Frequency", id: "hoafreq" }, { label: "Condo Project", id: "condoproj" }]);

    // ─── STEP 1: SITE & LOT ───
    drawSectionHeader("Site & Lot");
    drawRadioGroup("Street Surface", "streetsurface", ["Asphalt", "Concrete", "Gravel", "Chip Seal", "Other"]);
    drawRadioGroup("Street", "streetpub", ["Public", "Private"]);
    drawRadioGroup("Street Lights", "streetlights", ["Wood Pole", "Aluminum Pole", "Electric", "None"]);
    drawRadioGroup("Alley?", "alley", ["Yes", "No"]);
    drawRadioGroup("Driveway Surface", "driveway", ["Concrete", "Asphalt", "Gravel", "Dirt", "Other"]);
    drawRadioGroup("Electric", "electric", ["Yes", "No"]);
    drawRadioGroup("Gas", "gas", ["Natural", "Propane", "None"]);
    drawRadioGroup("Water", "water", ["Public", "Private Well", "Rural Well", "Other"]);
    drawRadioGroup("Sewer", "sewer", ["Public", "Septic", "Other"]);
    drawRadioGroup("Lot Size", "lotsize", ["Typical", "Smaller", "Larger"]);
    drawRadioGroup("Lot Shape", "lotshape", ["Rectangular", "Irregular", "Corner", "Flag", "Other"]);
    drawRadioGroup("Drainage", "drainage", ["Adequate", "Insufficient"]);
    drawRadioGroup("Location Impact", "locimpact", ["Neutral", "Beneficial", "Adverse"]);
    drawRadioGroup("Location (circle all)", "loctype", ["Residential", "Busy Street", "Interior", "Cul-de-sac", "Corner", "Golf Course", "Park", "Lake", "Dead End", "Other"]);
    drawRadioGroup("View Impact", "viewimpact", ["Neutral", "Beneficial", "Adverse"]);
    drawRadioGroup("View (circle all)", "viewtype", ["Residential", "Busy Street", "Treed", "Golf Course", "Park", "Woods", "School", "Lake", "Commercial", "Power Lines", "Other"]);
    drawInputRow([{ label: "View Notes", id: "viewnotes" }]);
    drawRadioGroup("Any site defects?", "sitedefects", ["Yes", "No"]);
    drawInputRow([{ label: "Defect Description", id: "sitedefect_desc" }]);
    drawPhotoCheckboxes(["Street Scene", "Front of Property"]);

    // ─── STEP 2: EXTERIOR ───
    drawSectionHeader("Exterior");
    drawRadioGroup("Ext Walls (Front)", "extfront", ["Wood", "Vinyl", "Brick", "Stucco", "Stone", "Cement Board", "Composite", "Other"]);
    drawRadioGroup("Ext Walls (Sides)", "extside", ["Same as Front", "Wood", "Vinyl", "Brick", "Stucco", "Stone", "Cement Board", "Other"]);
    drawRadioGroup("Roof Material", "roof", ["Asphalt Shingles", "Wood Shake", "Metal", "Tile", "Tar/Gravel", "Comp", "Other"]);
    drawRadioGroup("Gutters", "gutters", ["Aluminum", "Vinyl", "Galvanized", "Copper", "None"]);
    drawRadioGroup("Windows", "windows", ["Aluminum", "Vinyl", "Wood", "Other"]);
    drawRadioGroup("Storm Windows?", "stormwindows", ["Yes", "No"]);
    drawRadioGroup("Window Screens?", "screens", ["Yes", "No"]);
    drawRadioGroup("Fence", "fence", ["Metal", "Wood", "Wrought Iron", "Chain Link", "None", "Other"]);
    drawRadioGroup("Patio Material", "patio", ["Concrete", "Brick", "Stone", "Pavers", "None", "Other"]);
    drawRadioGroup("Deck", "decksize", ["Large", "Average", "Small", "None"]);
    drawRadioGroup("Deck Material", "deckmat", ["Wood", "Trex/Composite", "Vinyl", "None", "Other"]);
    drawRadioGroup("Covered Porch?", "coverporch", ["Yes", "No"]);
    drawRadioGroup("Porch Location", "porchloc", ["Front", "Rear", "Side", "Wrap"]);
    drawRadioGroup("Screened Porch?", "screenporch", ["Yes", "No"]);
    drawRadioGroup("Sunroom?", "sunroom", ["Yes", "No"]);
    drawRadioGroup("Gazebo?", "gazebo", ["Yes", "No"]);
    drawRadioGroup("Balcony?", "balcony", ["Yes", "No"]);
    drawRadioGroup("Sprinklers?", "sprinklers", ["Yes", "No"]);
    drawRadioGroup("Pool", "pool", ["None", "In-Ground", "Above-Ground", "Hot Tub"]);
    drawRadioGroup("Shed / Outbuilding?", "shed", ["Yes", "No"]);
    drawInputRow([{ label: "Shed Description", id: "sheddesc" }]);
    drawInputRow([{ label: "Garage # Cars", id: "garagecars" }, { label: "Garage Size", id: "garagesize" }]);
    drawRadioGroup("Garage Type", "garagetype", ["Attached", "Detached", "Built-In", "Carport", "None"]);
    drawRadioGroup("Garage Location", "garageloc", ["Front", "Side", "Rear", "Alley"]);
    drawRadioGroup("Other Parking", "parking", ["Driveway", "Open Lot", "Assigned", "None"]);
    drawRadioGroup("Quality of Construction", "extquality", ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]);
    drawRadioGroup("Condition", "extcond", ["C1", "C2", "C3", "C4", "C5", "C6"]);
    drawRadioGroup("Exterior Defects?", "extdefects", ["Yes", "No"]);
    drawInputRow([{ label: "Defect Description", id: "extdefect_desc" }]);

    // ─── STEP 3: INTERIOR ───
    drawSectionHeader("Interior");
    drawInputRow([{ label: "Total Rooms", id: "totalrooms" }, { label: "Bedrooms", id: "bedrooms" }]);
    drawInputRow([{ label: "Full Baths", id: "fullbaths" }, { label: "Half Baths", id: "halfbaths" }]);
    drawInputRow([{ label: "Laundry Location", id: "laundry" }]);
    drawRadioGroup("Flooring", "flooring", ["Hardwood", "Laminate", "Carpet", "Vinyl", "Tile", "LVP", "Engineered Wood", "Other"]);
    drawRadioGroup("Walls", "walls", ["Drywall", "Plaster", "Paneling", "Other"]);
    drawRadioGroup("Trim", "trim", ["Wood", "MDF", "Other"]);
    drawRadioGroup("Doors", "doors", ["Wood", "Paneled", "Hollow Core", "Other"]);
    drawRadioGroup("Bath Floor", "bathfloor", ["Vinyl", "Tile", "Carpet", "Hardwood", "LVP", "Other"]);
    drawRadioGroup("Bath Wainscot", "bathwainscot", ["Tile", "Fiberglass", "Cultured Marble", "Other"]);
    drawInputRow([{ label: "Bath Notes", id: "bathnotes" }]);
    drawRadioGroup("Appliances", "appliances", ["Range/Oven", "Disposal", "Dishwasher", "Fan/Hood", "Microwave", "Washer/Dryer", "Refrigerator"]);
    drawRadioGroup("Countertops", "counters", ["Laminate", "Tile", "Granite", "Quartz", "Corian", "Butcher Block", "Other"]);
    drawRadioGroup("Backsplash", "backsplash", ["Tile", "Laminate", "Stone", "None", "Other"]);
    drawInputRow([{ label: "Kitchen Notes", id: "kitchennotes" }]);
    drawRadioGroup("Fireplace?", "fireplace", ["Yes", "No"]);
    drawInputRow([{ label: "# Fireplaces", id: "fpcount" }, { label: "Type", id: "fptype" }]);
    drawRadioGroup("Wood Stove?", "woodstove", ["Yes", "No"]);
    drawRadioGroup("Alarm / Security?", "alarm", ["Yes", "No"]);
    drawRadioGroup("Intercom?", "intercom", ["Yes", "No"]);
    drawRadioGroup("Central Vacuum?", "centralvac", ["Yes", "No"]);
    drawRadioGroup("Heating", "heating", ["Forced Warm Air", "Heat Pump", "Radiant", "Baseboard", "Wall", "Other"]);
    drawRadioGroup("Fuel", "fuel", ["Gas", "Electric", "Oil", "Propane", "Wood", "Solar", "Other"]);
    drawRadioGroup("Cooling", "cooling", ["Central AC", "Window AC", "Mini Split", "None"]);
    drawRadioGroup("Attic?", "attic", ["Yes", "No"]);
    drawRadioGroup("Attic Features", "atticfeat", ["Fan", "Scuttle", "Floor", "Drop Stairs", "Finished", "Insulated"]);
    drawRadioGroup("Interior Quality", "intquality", ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]);
    drawRadioGroup("Interior Condition", "intcond", ["C1", "C2", "C3", "C4", "C5", "C6"]);
    drawRadioGroup("Interior Defects?", "intdefects", ["Yes", "No"]);
    drawInputRow([{ label: "Defect Description", id: "intdefect_desc" }]);

    // ─── STEP 4: BASEMENT ───
    drawSectionHeader("Basement / Below Grade");
    drawRadioGroup("Type", "basetype", ["Full Basement", "Partial Basement", "Crawl Space", "Slab", "Other"]);
    drawRadioGroup("Outside Entrance", "baseentrance", ["Walkout", "Daylight", "Bilco Door", "None"]);
    drawRadioGroup("Foundation Material", "foundation", ["Concrete", "Block", "Stone", "Brick", "Other"]);
    drawRadioGroup("Sump Pump?", "sumppump", ["Yes", "No"]);
    drawRadioGroup("Basement Finished?", "basefinished", ["Yes", "No"]);
    drawInputRow([{ label: "% Finished", id: "basepct" }, { label: "Finished SF", id: "basefinsf" }]);
    drawInputRow([{ label: "Unfinished SF", id: "baseunfinsf" }, { label: "Ceiling Height", id: "baseceilht" }]);
    drawInputRow([{ label: "Basement Rooms", id: "baserooms" }]);
    drawInputRow([{ label: "Basement Condition Notes", id: "basecond" }]);
    drawRadioGroup("Basement Defects?", "basedefects", ["Yes", "No"]);
    drawInputRow([{ label: "Defect Description", id: "basedefect_desc" }]);

    // ─── STEP 5: MEASUREMENTS & WRAP-UP ───
    drawSectionHeader("Measurements & Wrap-up");
    drawInputRow([{ label: "GLA Above Grade SF", id: "gla" }, { label: "Below Grade Fin SF", id: "bgfinsf" }]);
    drawInputRow([{ label: "Total Rooms", id: "totalrooms2" }]);
    drawInputRow([{ label: "Sketch Dimensions / Notes", id: "sketchnotes" }]);
    drawInputRow([{ label: "General Comments", id: "comments" }]);
    drawInputRow([{ label: "Notes for Backbone Desktop Team", id: "team_notes" }]);

    return pdfDoc.save();
  }

  async emailFormAsPdf(data: any, user: any): Promise<{ message: string }> {
    const notifyTo = process.env.SMTP_ORDER_NOTIFY_TO;
    if (!notifyTo) throw new Error('SMTP_ORDER_NOTIFY_TO is not configured');

    const clientName = [user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username || 'Client';
    const clientId = user?.id || 'Unknown';
    const fullAddress = [data?.address, data?.city, data?.stzip].filter(Boolean).join(', ') || 'Unknown Address';

    const pdfBytes = await this.generatePdfBytes(data, user);


    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: notifyTo,
      subject: `Inspection 2.6 - ${fullAddress} - ${clientName} (ID: ${clientId}) - Submitted`,
      html: `
<div style="font-family:'Segoe UI',sans-serif;color:#333;max-width:650px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
  <div style="background:#060b17;padding:24px;text-align:center;">
    <h2 style="color:#fff;margin:0;font-size:22px;">&#128196; UAD 2.6 Inspection Submitted</h2>
  </div>
  <div style="padding:30px;">
    <p style="font-size:16px;margin-bottom:20px;">Hello Admin,</p>
    <p style="font-size:16px;margin-bottom:20px;line-height:1.6;">A new <strong>UAD 2.6</strong> field inspection report has been submitted. The complete report formatted with input boxes and option pills is attached as a PDF.</p>
    <div style="background:#f8fafc;padding:20px;border-left:4px solid #060b17;border-radius:4px;margin-bottom:25px;">
      <p style="margin:0 0 8px;font-size:15px;"><strong>&#127968; Property Address:</strong> ${fullAddress}</p>
      <p style="margin:0 0 8px;font-size:15px;"><strong>&#128100; Submitted By:</strong> ${clientName}</p>
      <p style="margin:0 0 8px;font-size:15px;"><strong>&#127996; Client ID:</strong> ${clientId}</p>
      <p style="margin:0;font-size:15px;"><strong>&#128197; Date:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p style="font-size:14px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:20px;margin-top:20px;">
      Automated Message &bull; <strong>BackBone Data Solutions</strong>
    </p>
  </div>
</div>`,
      attachments: [{
        filename: `Inspection_2.6_${clientName.replace(/\s+/g, '_')}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: 'application/pdf',
      }],
    });

    return { message: 'Inspection submitted & PDF emailed successfully!' };
  }

  async emailJson(data: any, user: any): Promise<{ message: string }> {
    const notifyTo = process.env.SMTP_ORDER_NOTIFY_TO;
    if (!notifyTo) {
      throw new Error('SMTP_ORDER_NOTIFY_TO is not configured');
    }

    const clientName = [user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username || 'Client';
    const clientId = user?.id || 'Unknown';
    const fullAddress = [data?.address, data?.city, data?.stzip].filter(Boolean).join(', ') || 'Unknown Address';
    const jsonString = JSON.stringify(data, null, 2);

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: notifyTo,
      subject: `Inspection 2.6 Form Data Submitted - ${fullAddress}`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
  <div style="background-color: #2563eb; padding: 20px; text-align: center;">
    <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Inspection 2.6 Form Data </h2>
  </div>
  <div style="padding: 30px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello Admin,</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">New field inspection form data for <strong>UAD 2.6</strong> has been sent to BackBone Data Solution in JSON format.</p>
    <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin-bottom: 25px;">
      <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Property Address:</strong> ${fullAddress}</p>
      <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Submitted By:</strong> ${clientName}</p>
      <p style="margin: 0; font-size: 15px;"><strong>Client ID:</strong> ${clientId}</p>
    </div>
    <p style="font-size: 16px; margin-bottom: 10px;"><strong>JSON Data Preview:</strong></p>
    <pre style="background-color: #1e293b; color: #f8fafc; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 13px; max-height: 300px;">${jsonString}</pre>
    <p style="font-size: 14px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
      Automated Message<br/>
      <strong>BackBone Data Solutions System</strong>
    </p>
  </div>
</div>
`,
      attachments: [
        {
          filename: 'Inspection_2.6_Data.json',
          content: Buffer.from(jsonString, 'utf-8'),
          contentType: 'application/json',
        },
      ],
    });

    return { message: 'Form data sent to BackBone Data Solution successfully!' };
  }
}
