import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from 'src/user/entities/user.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';
import { ClientTatPricing } from './entity/client-tat-pricing.entity';
import { TatPackage } from './entity/tat-package.entity';
import { UpsertClientTatPricingDto } from './dto/upsert-client-tat-pricing.dto';
import { UpdateClientTatPricingDto } from './dto/update-client-tat-pricing.dto';

@Injectable()
export class TatPricingService {
  constructor(
    @InjectRepository(TatPackage)
    private readonly tatPackageRepo: Repository<TatPackage>,
    @InjectRepository(ClientTatPricing)
    private readonly clientTatPricingRepo: Repository<ClientTatPricing>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  private toNullableNumber(value: unknown): number | null {
    if (value === undefined || value === null || `${value}`.trim() === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseDate(value?: string | null) {
    const normalized = `${value ?? ''}`.trim();
    if (!normalized) {
      return null;
    }

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Invalid date value: ${value}`);
    }

    return parsed;
  }

  private isOverrideEffective(record: ClientTatPricing, reference = new Date()) {
    if (!record.is_active) {
      return false;
    }

    const fromTime = record.effective_from?.getTime();
    const toTime = record.effective_to?.getTime();
    const currentTime = reference.getTime();

    if (fromTime && currentTime < fromTime) {
      return false;
    }

    if (toTime && currentTime > toTime) {
      return false;
    }

    return true;
  }

  private async resolveClient(username?: string, clientId?: string | number) {
    const normalizedClientId = `${clientId ?? ''}`.trim();
    if (normalizedClientId && /^\d+$/.test(normalizedClientId)) {
      const user = await this.userRepo.findOne({
        where: { id: Number(normalizedClientId) },
      });

      if (user) {
        return user;
      }
    }

    const normalizedUsername = `${username ?? ''}`.trim();
    if (!normalizedUsername) {
      return null;
    }

    return this.userRepo.findOne({
      where: [
        { username: normalizedUsername },
        { email: normalizedUsername },
      ],
    });
  }

  private getClientLookupKeys(client?: Users | null, requestedUsername?: string) {
    return Array.from(
      new Set(
        [requestedUsername, client?.username, client?.email]
          .map((value) => `${value ?? ''}`.trim())
          .filter(Boolean),
      ),
    );
  }

  private async getOverrideMap(client?: Users | null, requestedUsername?: string) {
    const lookupKeys = this.getClientLookupKeys(client, requestedUsername);

    if (!lookupKeys.length) {
      return new Map<number, ClientTatPricing>();
    }

    const rows = await this.clientTatPricingRepo.find({
      where: lookupKeys.map((value) => ({ username: value })),
      order: {
        updated_at: 'DESC',
        id: 'DESC',
      },
    });

    const map = new Map<number, ClientTatPricing>();
    rows.forEach((row) => {
      if (!map.has(Number(row.package_id))) {
        map.set(Number(row.package_id), row);
      }
    });

    return map;
  }

  async getActiveTatPackages() {
    return this.tatPackageRepo.find({
      where: { is_active: true },
      order: {
        sort_order: 'ASC',
        tat_hours: 'DESC',
        id: 'ASC',
      },
    });
  }

  async getTatPackages(username?: string) {
    const client = await this.resolveClient(username);
    const packages = await this.getActiveTatPackages();
    const overrideMap = await this.getOverrideMap(client, username);

    return packages.map((item) => {
      const override = overrideMap.get(Number(item.id));
      const overridePrice = this.toNullableNumber(override?.custom_price);
      const isEffective = override ? this.isOverrideEffective(override) : false;
      const effectivePrice =
        isEffective && overridePrice !== null
          ? overridePrice
          : Number(item.default_price ?? 0);

      return {
        packageId: item.id,
        packageCode: item.package_code,
        displayLabel: item.display_name,
        tatHours: Number(item.tat_hours ?? 0),
        defaultPrice: Number(item.default_price ?? 0),
        effectivePrice,
        isOverridden: Boolean(isEffective && overridePrice !== null),
        overrideId: override?.id ?? null,
        overridePrice,
        overrideActive: Boolean(override?.is_active),
        effectiveFrom: override?.effective_from ?? null,
        effectiveTo: override?.effective_to ?? null,
      };
    });
  }

  async getAdminClientTatPricing(username: string) {
    const client = await this.resolveClient(username);

    if (!client) {
      throw new NotFoundException('Client was not found');
    }

    if (`${client.role ?? ''}`.trim().toLowerCase() !== 'client') {
      throw new BadRequestException('Selected user is not a client');
    }

    const packages = await this.getTatPackages(client.username || client.email || `${client.id}`);

    return {
      client: {
        id: client.id,
        username: client.username,
        email: client.email,
        name:
          `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim() ||
          client.companyname ||
          client.username ||
          client.email ||
          `Client #${client.id}`,
      },
      packages,
    };
  }

  async upsertClientTatPricing(dto: UpsertClientTatPricingDto) {
    const client = await this.resolveClient(dto.username, dto.clientId);

    if (!client) {
      throw new NotFoundException('Client was not found');
    }

    if (`${client.role ?? ''}`.trim().toLowerCase() !== 'client') {
      throw new BadRequestException('Custom TAT pricing can only be assigned to clients');
    }

    const tatPackage = await this.tatPackageRepo.findOne({
      where: { id: Number(dto.tatPackageId), is_active: true },
    });

    if (!tatPackage) {
      throw new NotFoundException('TAT package was not found');
    }

    const customPrice = this.toNullableNumber(dto.customPrice);
    const effectiveFrom = this.parseDate(dto.effectiveFrom);
    const effectiveTo = this.parseDate(dto.effectiveTo);

    if ((dto.isActive ?? true) && customPrice === null) {
      throw new BadRequestException('Custom price is required for an active override');
    }

    if (effectiveFrom && effectiveTo && effectiveFrom.getTime() > effectiveTo.getTime()) {
      throw new BadRequestException('Effective from date must be before effective to date');
    }

    const now = new Date();
    const existing = await this.clientTatPricingRepo.findOne({
      where: this.getClientLookupKeys(client, dto.username).map((value) => ({
        username: value,
        package_id: Number(tatPackage.id),
      })),
    });

    const nextIsActive = dto.isActive ?? true;

    if (existing) {
      existing.username = client.username || client.email || `${client.id}`;
      existing.custom_price = customPrice;
      existing.is_active = nextIsActive;
      existing.effective_from = effectiveFrom;
      existing.effective_to = effectiveTo;
      existing.updated_by = 'system';
      existing.updated_at = now;

      await this.clientTatPricingRepo.save(existing);
      return this.getAdminClientTatPricing(client.username || client.email || `${client.id}`);
    }

    const nextId = await getNextNumericId(this.clientTatPricingRepo);
    await this.clientTatPricingRepo.save(
      this.clientTatPricingRepo.create({
        id: nextId,
        username: client.username || client.email || `${client.id}`,
        package_id: Number(tatPackage.id),
        custom_price: customPrice,
        is_active: nextIsActive,
        effective_from: effectiveFrom,
        effective_to: effectiveTo,
        created_by: 'system',
        updated_by: 'system',
        created_at: now,
        updated_at: now,
      }),
    );

    return this.getAdminClientTatPricing(client.username || client.email || `${client.id}`);
  }

  async updateClientTatPricing(id: string, dto: UpdateClientTatPricingDto) {
    const record = await this.clientTatPricingRepo.findOne({
      where: { id: Number(id) },
    });

    if (!record) {
      throw new NotFoundException(`Client TAT pricing record ${id} was not found`);
    }

    if (dto.clientId !== undefined || dto.username !== undefined) {
      const client = await this.resolveClient(dto.username, dto.clientId);
      if (!client) {
        throw new NotFoundException('Client was not found');
      }
      record.username = client.username || client.email || `${client.id}`;
    }

    if (dto.tatPackageId !== undefined) {
      const tatPackage = await this.tatPackageRepo.findOne({
        where: { id: Number(dto.tatPackageId) },
      });
      if (!tatPackage) {
        throw new NotFoundException('TAT package was not found');
      }
      record.package_id = Number(tatPackage.id);
    }

    if (dto.customPrice !== undefined) {
      record.custom_price = this.toNullableNumber(dto.customPrice);
    }

    if (dto.isActive !== undefined) {
      record.is_active = dto.isActive;
    }

    if (dto.effectiveFrom !== undefined) {
      record.effective_from = this.parseDate(dto.effectiveFrom);
    }

    if (dto.effectiveTo !== undefined) {
      record.effective_to = this.parseDate(dto.effectiveTo);
    }

    if (
      record.effective_from &&
      record.effective_to &&
      record.effective_from.getTime() > record.effective_to.getTime()
    ) {
      throw new BadRequestException('Effective from date must be before effective to date');
    }

  record.updated_by = 'system';
    record.updated_at = new Date();
    await this.clientTatPricingRepo.save(record);
    return record;
  }

  async disableClientTatPricing(id: string) {
    const record = await this.clientTatPricingRepo.findOne({
      where: { id: Number(id) },
    });

    if (!record) {
      throw new NotFoundException(`Client TAT pricing record ${id} was not found`);
    }

    record.is_active = false;
  record.updated_by = 'system';
    record.updated_at = new Date();
    await this.clientTatPricingRepo.save(record);

    return { message: 'Client TAT pricing disabled successfully' };
  }

  async resolveSelection(
    clientRef: { username?: string; clientId?: string | number },
    selection: {
      tatPackageId?: string | number;
      packageCode?: string;
      tatHours?: string | number;
    },
  ) {
    const client = await this.resolveClient(clientRef.username, clientRef.clientId);
    const normalizedPackageId = `${selection.tatPackageId ?? ''}`.trim();
    const normalizedPackageCode = `${selection.packageCode ?? ''}`.trim();
    const normalizedTatHours = this.toNullableNumber(selection.tatHours);

    let tatPackage: TatPackage | null = null;

    if (normalizedPackageId && /^\d+$/.test(normalizedPackageId)) {
      tatPackage = await this.tatPackageRepo.findOne({
        where: { id: Number(normalizedPackageId), is_active: true },
      });
    }

    if (!tatPackage && normalizedPackageCode) {
      tatPackage = await this.tatPackageRepo.findOne({
        where: { package_code: normalizedPackageCode, is_active: true },
      });
    }

    if (!tatPackage && normalizedTatHours !== null) {
      tatPackage = await this.tatPackageRepo.findOne({
        where: { tat_hours: normalizedTatHours, is_active: true },
      });
    }

    if (!tatPackage) {
      throw new NotFoundException('Selected TAT package was not found');
    }

    const overrideMap = await this.getOverrideMap(client, clientRef.username);
    const override = overrideMap.get(Number(tatPackage.id));
    const overridePrice = this.toNullableNumber(override?.custom_price);
    const isOverridden = Boolean(override && this.isOverrideEffective(override) && overridePrice !== null);
    const effectivePrice = isOverridden
      ? Number(overridePrice)
      : Number(tatPackage.default_price ?? 0);

    return {
      client,
      tatPackage,
      effectivePrice,
      isOverridden,
      overrideId: override?.id ?? null,
    };
  }
}