import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection36 } from './entities/inspection36.entity';
import { CreateInspection36Dto } from './dto/create-inspection36.dto';
import { emailTransporter } from 'src/packages/nodemailer/transporter';

@Injectable()
export class Inspection36Service {
  constructor(
    @InjectRepository(Inspection36)
    private readonly inspection36Repository: Repository<Inspection36>,
  ) {}

  async create(createDto: CreateInspection36Dto, user: any): Promise<Inspection36> {
    const newInspection = this.inspection36Repository.create({
      ...createDto,
      client_id: user.id,
      created_by: user.id,
      modified_by: user.id,
      created_on: Date.now(),
      modified_on: Date.now(),
    });
    const savedInspection = await this.inspection36Repository.save(newInspection);
    return savedInspection;
  }

  async findAll(user: any): Promise<Inspection36[]> {
    const roleName = user?.role?.name || user?.roleName || user?.role;
    
    const qb = this.inspection36Repository.createQueryBuilder('inspection')
      .leftJoinAndSelect('inspection.arrive', 'arrive')
      .leftJoinAndSelect('inspection.curb', 'curb')
      .leftJoinAndSelect('inspection.exterior', 'exterior')
      .leftJoinAndSelect('inspection.yard', 'yard')
      .leftJoinAndSelect('inspection.outbuildings', 'outbuildings')
      .leftJoinAndSelect('inspection.mainlevel', 'mainlevel')
      .leftJoinAndSelect('inspection.upperlevel', 'upperlevel')
      .leftJoinAndSelect('inspection.belowgrade', 'belowgrade')
      .leftJoinAndSelect('inspection.adu', 'adu')
      .leftJoinAndSelect('inspection.final', 'final')
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

  async findOne(id: string, user: any): Promise<Inspection36> {
    const roleName = user?.role?.name || user?.roleName || user?.role;
    
    const qb = this.inspection36Repository.createQueryBuilder('inspection')
      .leftJoinAndSelect('inspection.arrive', 'arrive')
      .leftJoinAndSelect('inspection.curb', 'curb')
      .leftJoinAndSelect('inspection.exterior', 'exterior')
      .leftJoinAndSelect('inspection.yard', 'yard')
      .leftJoinAndSelect('inspection.outbuildings', 'outbuildings')
      .leftJoinAndSelect('inspection.mainlevel', 'mainlevel')
      .leftJoinAndSelect('inspection.upperlevel', 'upperlevel')
      .leftJoinAndSelect('inspection.belowgrade', 'belowgrade')
      .leftJoinAndSelect('inspection.adu', 'adu')
      .leftJoinAndSelect('inspection.final', 'final')
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
        const exists = await this.inspection36Repository.findOne({ where: { id, deleted: false } });
        if (exists) {
          throw new ForbiddenException('You do not have access to this inspection.');
        }
      }
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    return inspection;
  }

  async update(id: string, updateDto: any, user: any): Promise<Inspection36> {
    const inspection = await this.findOne(id, user);

    Object.assign(inspection, updateDto);
    inspection.modified_by = user.id;
    inspection.modified_on = Date.now();

    return await this.inspection36Repository.save(inspection);
  }

  async remove(id: string, user: any): Promise<void> {
    const inspection = await this.findOne(id, user);
    inspection.deleted = true;
    inspection.modified_by = user.id;
    inspection.modified_on = Date.now();
    await this.inspection36Repository.save(inspection);
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
      subject: `Inspection 3.6 Data PDF Submitted`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
  <div style="background-color: #2563eb; padding: 20px; text-align: center;">
    <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Inspection 3.6 Data Submitted</h2>
  </div>
  <div style="padding: 30px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello Admin,</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">A new <strong>UAD 3.6</strong> field inspection report has been successfully generated and submitted.</p>
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
          filename: 'Inspection_3.6.pdf',
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
    page.drawText('UAD 3.6 Field Inspection Report', { x: M, y: PH - 32, size: 16, font: boldFont, color: rgb(1, 1, 1) });
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
      const isTwoCol = fields.length >= 2;
      const boxW = isTwoCol ? 258 : 540;
      
      fields.slice(0, 2).forEach((f, idx) => {
        const startX = idx === 1 ? 318 : M;
        const val = getVal(f.id);
        
        page.drawText(f.label, { x: startX, y: y, size: 9, font: boldFont, color: rgb(0.12, 0.16, 0.23) });
        
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
            size: 9.5,
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
        const pillW = Math.max(textW + 16, 40);

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

    // ─── STEP 1: PROPERTY ───
    drawSectionHeader("Step 1: Property");
    drawInputRow([{ label: "Property Address", id: "address" }, { label: "City", id: "city" }]);
    drawInputRow([{ label: "State/Zip", id: "stzip" }, { label: "Date of Inspection", id: "date" }]);
    drawInputRow([{ label: "File No", id: "fileno" }, { label: "Appraiser", id: "appraiser" }]);
    drawInputRow([{ label: "Borrower", id: "borrower" }, { label: "Time In", id: "timein" }]);
    drawInputRow([{ label: "Time Out", id: "timeout" }]);
    drawRadioGroup("Property Type", "proptype", ["SFD", "Townhouse", "Condo", "Co-op", "2-4 Unit", "Manufactured", "Has ADU"]);
    drawRadioGroup("Dwelling Style", "dwelling_style", ["Ranch", "Split Level", "Traditional", "Contemporary", "Colonial", "Cape Cod", "Bungalow", "Victorian", "Craftsman", "Other"]);
    drawRadioGroup("Attachment Type", "attachment_type", ["Detached", "Attached", "Semi-Detached"]);

    // ─── STEP 2: ARRIVE ───
    drawSectionHeader("Step 2: Arrive", "from your car");
    drawRadioGroup("Primary Access", "access", ["Public Street", "Private Street", "Pedestrian Only", "Waterway", "Other"]);
    drawRadioGroup("Street Type", "streettype", ["Local", "Cul-de-sac", "Alley", "Collector", "Rural", "Other"]);
    drawRadioGroup("Street Surface", "streetsurface", ["Asphalt", "Concrete", "Gravel", "Dirt", "Other"]);
    drawRadioGroup("Private street maintenance agreement?", "pvtmaint", ["Yes", "No"]);
    drawRadioGroup("Typical access for this market?", "typaccess", ["Yes", "No"]);

    // ─── STEP 3: STAND ───
    drawSectionHeader("Step 3: Stand", "looking at the property");
    drawRadioGroup("Primary View", "primview", ["Residential", "Mountain", "Water", "Park", "Golf", "City Street", "Commercial", "Industrial", "Other"]);
    drawRadioGroup("View Range", "viewrange", ["Full", "Partial", "Seasonal"]);
    drawRadioGroup("View Impact on Value", "viewimpact", ["Adverse", "Neutral", "Beneficial"]);
    drawInputRow([{ label: "Other Views", id: "otherview" }]);
    drawRadioGroup("Site Influences (circle all)", "influences", ["Body of Water", "Busy Road", "Airport", "Commercial", "Golf Course", "Green Space", "Industrial", "Power Lines", "Railroad", "Hillside", "None", "Other"]);
    drawRadioGroup("Front Door Height Above Grade", "frontdoor", ["At Grade", "< 1 ft", "1-2 ft", "2-3 ft", "3-4 ft", "4-5 ft", "5-6 ft", "6+ ft"]);

    // ─── STEP 4: WALK ───
    drawSectionHeader("Step 4: Walk", "clockwise around dwelling");
    drawRadioGroup("Exterior Walls", "extwalls", ["Brick", "Vinyl", "Wood", "Aluminum", "Stucco", "Cement Board", "Stone", "Log", "Other"]);
    drawRadioGroup("Foundation Type", "fndtype", ["Slab", "Crawl Space", "Basement", "Post & Pier", "Other"]);
    drawRadioGroup("Foundation Material", "fndmat", ["Poured Concrete", "Block", "Stone", "Brick", "Wood", "Other"]);
    drawRadioGroup("Roof Material", "roofmat", ["Asphalt", "Metal", "Tile", "Slate", "Wood", "Other"]);

    drawRadioGroup("Condition Status: Exterior Walls", "cond_walls", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);
    drawRadioGroup("Condition Status: Foundation", "cond_fnd", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);
    drawRadioGroup("Condition Status: Roof", "cond_roof", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);
    drawRadioGroup("Condition Status: Windows", "cond_win", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);

    drawRadioGroup("Foundation accessible to observe?", "fndaccess", ["Yes", "No"]);
    drawRadioGroup("Estimated Roof Age", "roofage", ["< 1 yr", "1-10 yr", "10-20 yr", ">20 yr"]);
    drawRadioGroup("Roof observable?", "roofobs", ["Yes", "No"]);
    drawRadioGroup("Any converted areas? (garage/patio/porch -> living area)", "converted", ["Yes", "No"]);
    drawRadioGroup("Converted finish vs rest of home", "convfinish", ["Inferior", "Similar", "Superior", "N/A"]);
    drawInputRow([{ label: "Non-continuous finished area SF", id: "noncontig" }]);
    drawRadioGroup("Attic access?", "attic", ["Yes", "No"]);
    drawRadioGroup("Attic", "atticdet", ["Accessible", "Not Accessible", "Observed", "Not Observed"]);
    drawRadioGroup("Disaster Mitigation Features", "mitigation", ["Flood vents", "Impact glass", "Fortified roof", "Fire storm walls", "Fire storm deck", "Enclosed soffits", "Storm shutters", "None", "Other"]);
    drawRadioGroup("Renewable energy visible?", "renewable", ["Yes", "No"]);
    drawRadioGroup("Renewable Energy Type", "renewtype", ["Solar Panels", "Wind Turbine", "Geothermal", "Other"]);
    drawRadioGroup("Renewable Energy Ownership", "renewown", ["Owned", "Leased", "PPA", "Other"]);
    drawRadioGroup("Any exterior defects?", "extdefects", ["Yes", "No"]);

    drawRadioGroup("Ext Defect 1 Feature", "extdef1_feat", ["Foundation", "Roof", "Walls", "Windows", "Mech", "Floor", "Other"]);
    drawInputRow([{ label: "Location", id: "extdef1_loc" }, { label: "Description", id: "extdef1_desc" }]);
    drawInputRow([{ label: "Structural? (Y/N)", id: "extdef1_struct" }, { label: "Action (Repair/Inspect/None)", id: "extdef1_action" }, { label: "Cost $", id: "extdef1_cost" }]);
    
    drawRadioGroup("Ext Defect 2 Feature", "extdef2_feat", ["Foundation", "Roof", "Walls", "Windows", "Mech", "Floor", "Other"]);
    drawInputRow([{ label: "Location", id: "extdef2_loc" }, { label: "Description", id: "extdef2_desc" }]);
    drawInputRow([{ label: "Structural? (Y/N)", id: "extdef2_struct" }, { label: "Action (Repair/Inspect/None)", id: "extdef2_action" }, { label: "Cost $", id: "extdef2_cost" }]);

    // ─── STEP 5: YARD ───
    drawSectionHeader("Step 5: Yard", "walk the property grounds");
    drawRadioGroup("Topography", "topo", ["Flat", "Sloping", "Rolling", "Rocky", "Other"]);
    drawRadioGroup("Drainage Issues?", "drainage", ["None", "Standing Water", "Erosion", "Improper Grading", "Other"]);
    drawRadioGroup("Electric Utility", "util_elec", ["Public", "Private"]);
    drawRadioGroup("Gas Utility", "util_gas", ["Public", "Private", "None"]);
    drawRadioGroup("Water Utility", "util_water", ["Public", "Private: Well", "Private: Cistern", "Private: Other"]);
    drawRadioGroup("Sewer Utility", "util_sewer", ["Public", "Private: Septic", "Private: Cesspool", "Private: Other"]);
    drawRadioGroup("Broadband internet available at property?", "broadband", ["Yes", "No"]);

    drawRadioGroup("Primarily residential?", "primres", ["Yes", "No"]);
    drawInputRow([{ label: "Residential %", id: "respct" }]);
    drawRadioGroup("Non-residential use", "nonres", ["None", "Agricultural", "Commercial", "Industrial", "Other"]);
    drawRadioGroup("Non-residential modifications?", "nonresmod", ["Yes", "No"]);

    drawRadioGroup("Restrictions", "restrict", ["None", "Age", "Historic", "Income", "Land Use", "Rental", "Sale Price", "Other"]);
    drawRadioGroup("Easements", "easement", ["None", "Conservation", "Drainage", "Ingress/egress", "Utility", "Other"]);
    drawRadioGroup("Encroachments", "encroach", ["None", "Building", "Fence", "Driveway", "Overhang", "Other"]);

    drawRadioGroup("Outdoor Amenities", "amen_out", ["Fence", "Irrigation", "Outdoor Fireplace", "Outdoor Kitchen", "Sports Court", "None"]);
    drawRadioGroup("Outdoor Living Amenities", "amen_living", ["Deck", "Patio", "Porch", "Portico", "Balcony", "Gazebo", "None"]);
    drawRadioGroup("Water Features", "amen_water", ["Inground Pool", "Inground Spa", "Outdoor Shower", "Sauna", "None"]);
    drawInputRow([{ label: "Amenity 1", id: "amen1_name" }, { label: "Count", id: "amen1_ct" }, { label: "Area SF", id: "amen1_sf" }, { label: "Material", id: "amen1_mat" }]);
    drawInputRow([{ label: "Amenity 2", id: "amen2_name" }, { label: "Count", id: "amen2_ct" }, { label: "Area SF", id: "amen2_sf" }, { label: "Material", id: "amen2_mat" }]);

    drawRadioGroup("Any site defects?", "sitedefects", ["Yes", "No"]);
    drawRadioGroup("Site Defect Feature", "sitedef1_feat", ["Foundation", "Roof", "Walls", "Windows", "Mech", "Floor", "Other"]);
    drawInputRow([{ label: "Location", id: "sitedef1_loc" }, { label: "Description", id: "sitedef1_desc" }]);
    drawInputRow([{ label: "Structural? (Y/N)", id: "sitedef1_struct" }, { label: "Action (Repair/Inspect/None)", id: "sitedef1_action" }, { label: "Cost $", id: "sitedef1_cost" }]);

    // ─── STEP 6: OUTBUILDINGS ───
    drawSectionHeader("Step 6: Outbuildings", "walk to each structure");
    drawRadioGroup("Vehicle Storage Type", "veh_type", ["Garage", "Carport", "Driveway", "Open Lot", "Parking Garage", "None", "Other"]);
    drawRadioGroup("Vehicle Attachment", "veh_attach", ["Attached", "Built-In", "Detached"]);
    drawInputRow([{ label: "# Spaces", id: "veh_spaces" }, { label: "Area SF", id: "veh_sf" }, { label: "Surface", id: "veh_surface" }]);

    drawInputRow([{ label: "#1 Type", id: "ob1_type" }, { label: "GBA SF", id: "ob1_gba" }, { label: "Finished SF", id: "ob1_fin" }]);
    drawInputRow([{ label: "Unfinished SF", id: "ob1_unfin" }, { label: "Rooms", id: "ob1_rooms" }, { label: "Utilities", id: "ob1_utils" }]);
    drawRadioGroup("#1 Heating?", "ob1_heat", ["Yes", "No"]);

    drawInputRow([{ label: "#2 Type", id: "ob2_type" }, { label: "GBA SF", id: "ob2_gba" }, { label: "Finished SF", id: "ob2_fin" }]);
    drawRadioGroup("#2 Heating?", "ob2_heat", ["Yes", "No"]);

    // ─── STEP 7: ENTER ───
    drawSectionHeader("Step 7: Enter", "front door — living area");
    drawRadioGroup("Occupancy", "occupancy", ["Owner", "Tenant", "Vacant"]);
    drawInputRow([{ label: "Levels in Unit", id: "levels" }, { label: "Bedrooms", id: "br" }, { label: "Full Baths", id: "fullba" }, { label: "Half Baths", id: "halfba" }]);
    drawRadioGroup("Interior Quality", "intqual", ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]);
    drawRadioGroup("Interior Condition", "intcond", ["C1", "C2", "C3", "C4", "C5", "C6"]);

    drawInputRow([{ label: "Kitchen 1 — Level", id: "k1_level" }]);
    drawRadioGroup("K1 Update", "k1_update", ["Fully Updated", "Partially Updated", "Not Updated"]);
    drawRadioGroup("K1 Time Frame", "k1_time", ["< 1 yr", "1-5 yr", "5-10 yr", "10+ yr"]);
    drawRadioGroup("K1 Condition", "k1_cond", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);

    drawInputRow([{ label: "Kitchen 2 — Level (if applicable)", id: "k2_level" }]);
    drawRadioGroup("K2 Update", "k2_update", ["Fully Updated", "Partially Updated", "Not Updated"]);

    drawRadioGroup("Flooring Types (select all)", "floor_types", ["Hardwood", "Carpet", "Ceramic", "Laminate", "Vinyl", "LVP", "Eng Wood", "Marble", "Concrete", "Other"]);
    drawRadioGroup("Flooring Update", "floor_update", ["Fully", "Significantly", "Moderately", "Not Updated"]);
    drawRadioGroup("Flooring Condition", "floor_cond", ["New/Like New", "Typical Wear", "Damaged-Functional", "No Finish"]);

    drawRadioGroup("Ceiling Height", "ceil_ht", ["< 7 ft", "7 ft", "8 ft", "9 ft", "10+ ft", "2+ Stories"]);
    drawRadioGroup("Ceiling Style", "ceil_style", ["Flat", "Cathedral", "Vaulted", "Tray", "Coffered", "Beams", "Other"]);
    drawRadioGroup("Walls/Ceiling Condition", "wallceil_cond", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);

    drawRadioGroup("Whole Home Features", "wholehome", ["Fireplace", "Elevator", "Fire Suppression", "EV Charging", "Multi-Zone HVAC", "Security", "Generator", "Smart Home", "None"]);
    drawRadioGroup("Accessibility Features", "accessibility", ["Grab Bars", "Ramps", "Wide Doorways", "Low Counters", "Lever Handles", "Roll-In Shower", "Elevator", "Other", "None"]);

    // ─── STEP 8: UPPER LEVEL ───
    drawSectionHeader("Step 8: Upper", "go upstairs");
    drawInputRow([{ label: "Bath 1 — Location/Level", id: "bath1_loc" }]);
    drawRadioGroup("Bath 1 Type", "bath1_type", ["Full", "3/4", "Half"]);
    drawRadioGroup("Bath 1 Update", "bath1_update", ["Fully", "Significantly", "Moderately", "Not Updated"]);
    drawRadioGroup("Bath 1 Condition", "bath1_cond", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);

    drawInputRow([{ label: "Bath 2 — Location/Level", id: "bath2_loc" }]);
    drawRadioGroup("Bath 2 Type", "bath2_type", ["Full", "3/4", "Half"]);
    drawRadioGroup("Bath 2 Update", "bath2_update", ["Fully", "Significantly", "Moderately", "Not Updated"]);
    drawRadioGroup("Bath 2 Condition", "bath2_cond", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);

    drawInputRow([{ label: "Bath 3 — Location/Level", id: "bath3_loc" }]);
    drawRadioGroup("Bath 3 Type", "bath3_type", ["Full", "3/4", "Half"]);
    drawRadioGroup("Bath 3 Update", "bath3_update", ["Fully", "Significantly", "Moderately", "Not Updated"]);
    drawRadioGroup("Bath 3 Condition", "bath3_cond", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);

    drawInputRow([{ label: "Bath 4 — Location/Level", id: "bath4_loc" }]);
    drawRadioGroup("Bath 4 Type", "bath4_type", ["Full", "3/4", "Half"]);
    drawRadioGroup("Bath 4 Update", "bath4_update", ["Fully", "Significantly", "Moderately", "Not Updated"]);
    drawRadioGroup("Bath 4 Condition", "bath4_cond", ["New/Like New", "Typical Wear", "Damaged-Functional", "Damaged-Nonfunctional"]);

    drawInputRow([{ label: "BR 1 Level", id: "br1_level" }, { label: "Ceiling Ht", id: "br1_ceil" }, { label: "Flooring", id: "br1_floor" }, { label: "Notes", id: "br1_notes" }]);
    drawInputRow([{ label: "BR 2 Level", id: "br2_level" }, { label: "Ceiling Ht", id: "br2_ceil" }, { label: "Flooring", id: "br2_floor" }, { label: "Notes", id: "br2_notes" }]);
    drawInputRow([{ label: "BR 3 Level", id: "br3_level" }, { label: "Ceiling Ht", id: "br3_ceil" }, { label: "Flooring", id: "br3_floor" }, { label: "Notes", id: "br3_notes" }]);
    drawInputRow([{ label: "BR 4 Level", id: "br4_level" }, { label: "Ceiling Ht", id: "br4_ceil" }, { label: "Flooring", id: "br4_floor" }, { label: "Notes", id: "br4_notes" }]);
    drawInputRow([{ label: "BR 5 Level", id: "br5_level" }, { label: "Ceiling Ht", id: "br5_ceil" }, { label: "Flooring", id: "br5_floor" }, { label: "Notes", id: "br5_notes" }]);
    drawInputRow([{ label: "BR 6 Level", id: "br6_level" }, { label: "Ceiling Ht", id: "br6_ceil" }, { label: "Flooring", id: "br6_floor" }, { label: "Notes", id: "br6_notes" }]);

    drawInputRow([{ label: "Upper Ceil Ht", id: "up1_ceilht" }, { label: "Flooring", id: "up1_floor" }, { label: "Finished SF", id: "up1_finsf" }]);
    drawInputRow([{ label: "Unfinished SF", id: "up1_unfinsf" }, { label: "Rooms on this level", id: "up1_rooms" }]);

    // ─── STEP 9: BELOW GRADE ───
    drawSectionHeader("Step 9: Below Grade");
    drawInputRow([{ label: "Finished SF", id: "bg_finsf" }, { label: "Non-Standard Finished SF", id: "bg_finnonstd" }, { label: "Unfinished SF", id: "bg_unfinsf" }]);
    drawInputRow([{ label: "Finish Quality", id: "bg_finish" }]);
    drawRadioGroup("Grade", "bg_grade", ["Walk-out", "Look-out", "Daylight", "Interior Only"]);
    drawRadioGroup("Access", "bg_access", ["Interior Stair", "Exterior Stair", "Walk-out", "Hatch"]);
    drawRadioGroup("Exterior Access", "bg_extaccess", ["Yes", "No"]);
    drawInputRow([{ label: "Ceiling Height", id: "bg_ceilht" }, { label: "Total Rooms", id: "bg_rooms" }]);

    drawRadioGroup("Heating System", "heat_sys", ["Forced Air", "Radiant", "Baseboard", "Heat Pump", "None"]);
    drawRadioGroup("Heating Fuel", "heat_fuel", ["Gas", "Electric", "Oil", "Propane", "Wood"]);
    drawRadioGroup("Cooling System", "cooling", ["Central", "Window Units", "Mini-Split", "Evaporative", "None"]);
    drawRadioGroup("Furnace in Below Grade", "furnace_bg", ["Yes", "No"]);
    drawInputRow([{ label: "Below Grade Defects", id: "bg_defects" }]);

    // ─── STEP 10: ADU ───
    drawSectionHeader("Step 10: ADU", "skip if no ADU");
    drawRadioGroup("ADU on the property?", "adu_present", ["Yes", "No"]);
    drawRadioGroup("Location", "adu_loc", ["In Dwelling", "In Outbuilding"]);
    drawRadioGroup("Access", "adu_access", ["Interior Only", "Exterior Only", "Both"]);
    drawRadioGroup("Legally rentable?", "adu_rentable", ["Yes", "No"]);
    drawRadioGroup("Typical for market?", "adu_typical", ["Yes", "No"]);
    drawRadioGroup("Separate postal address?", "adu_address", ["Yes", "No"]);

    drawInputRow([{ label: "Bedrooms", id: "adu_br" }, { label: "Full Baths", id: "adu_fullba" }, { label: "Half Baths", id: "adu_halfba" }]);
    drawInputRow([{ label: "Finished SF", id: "adu_finsf" }, { label: "Unfinished SF", id: "adu_unfinsf" }]);
    drawRadioGroup("ADU Kitchen Update", "adu_kitchen", ["Fully", "Partially", "Not Updated"]);
    drawRadioGroup("ADU Bath Update", "adu_bath", ["Fully", "Significantly", "Moderately", "Not Updated"]);

    // ─── STEP 11: FINAL ───
    drawSectionHeader("Step 11: Final", "you have seen everything");
    drawRadioGroup("Exterior Quality", "ext_qual", ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]);
    drawRadioGroup("Exterior Condition", "ext_cond", ["C1", "C2", "C3", "C4", "C5", "C6"]);
    drawRadioGroup("Overall Quality", "ovr_qual", ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]);
    drawRadioGroup("Overall Condition", "ovr_cond", ["C1", "C2", "C3", "C4", "C5", "C6"]);

    drawInputRow([{ label: "Fin AG (std) SF", id: "fin_ag_std" }, { label: "Fin AG (non-std) SF", id: "fin_ag_nonstd" }, { label: "Unfin AG SF", id: "unfin_ag" }]);
    drawInputRow([{ label: "GBA Finished All Units incl ADU (SF)", id: "gba_total" }]);
    drawRadioGroup("Measurement Standard", "measstd", ["ANSI", "American Measurement Standard", "Other"]);
    drawRadioGroup("Functional Issues", "func_issues", ["None", "Floor Plan", "Ceiling Height", "Overimprovement", "Underimprovement", "Non-Conformity", "Other"]);
    drawInputRow([{ label: "Sketch / measurement notes", id: "sketch_notes" }]);
    drawInputRow([{ label: "Notes for Backbone desktop team", id: "team_notes" }]);

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
      subject: `Inspection 3.6 - ${fullAddress} - ${clientName} (ID: ${clientId}) - Submitted`,
      html: `
<div style="font-family:'Segoe UI',sans-serif;color:#333;max-width:650px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
  <div style="background:#060b17;padding:24px;text-align:center;">
    <h2 style="color:#fff;margin:0;font-size:22px;">&#128196; UAD 3.6 Inspection Submitted</h2>
  </div>
  <div style="padding:30px;">
    <p style="font-size:16px;margin-bottom:20px;">Hello Admin,</p>
    <p style="font-size:16px;margin-bottom:20px;line-height:1.6;">A new <strong>UAD 3.6</strong> field inspection report has been submitted. The complete report formatted with input boxes and option pills is attached as a PDF.</p>
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
        filename: `Inspection_3.6_${clientName.replace(/\s+/g, '_')}.pdf`,
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
      subject: `Inspection 3.6 Form Data (JSON) Submitted - ${fullAddress}`,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
  <div style="background-color: #2563eb; padding: 20px; text-align: center;">
    <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Inspection 3.6 Form Data (JSON)</h2>
  </div>
  <div style="padding: 30px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello Admin,</p>
    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.5;">New field inspection form data for <strong>UAD 3.6</strong> has been sent to BackBone Data Solution in JSON format.</p>
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
          filename: 'Inspection_3.6_Data.json',
          content: Buffer.from(jsonString, 'utf-8'),
          contentType: 'application/json',
        },
      ],
    });

    return { message: 'Form data sent to BackBone Data Solution successfully!' };
  }
}
