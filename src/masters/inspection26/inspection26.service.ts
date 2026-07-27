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

    try {
      const fullAddress = [createDto.address, createDto.city, createDto.stzip].filter(Boolean).join(', ') || 'Unknown Address';
      const notifyTo = process.env.SMTP_ORDER_NOTIFY_TO;
      const clientEmail = user?.email || user?.username;
      
      const clientName = [user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username || 'Client';
      const clientId = user?.id || 'Unknown';

      const promises = [];

      // Send to Admin
      if (notifyTo) {
        promises.push(emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: notifyTo,
          subject: `Inspection 2.6 Submitted – ${fullAddress}`,
          html: `<p>Hello Admin,</p>
                 <p><b>Inspection 2.6</b> field notes have been submitted for the property at <b>${fullAddress}</b>.</p>
                 <p><b>Submitted by:</b> ${clientName} (ID: ${clientId})</p>`,
        }));
      }

      // Send to Client
      if (clientEmail) {
        promises.push(emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: clientEmail,
          subject: `Inspection 2.6 Submitted – ${fullAddress}`,
          html: `<p>Hello ${clientName},</p>
                 <p>Your <b>Inspection 2.6</b> field notes for the property at <b>${fullAddress}</b> have been successfully submitted.</p>
                 <p>Thank you!</p>`,
        }));
      }
      
      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Error sending inspection submit email:', err);
    }

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
}
