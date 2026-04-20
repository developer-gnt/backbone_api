import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entity/package.entity';
import { Users } from 'src/user/entities/user.entity';
import { getNextNumericId } from 'src/utils/manual-id.util';
import { ClientPackagePricing } from './entity/client-package-pricing.entity';
import { CreateClientPackagePricingDto } from './dto/create-client-package-pricing.dto';
import { UpdateClientPackagePricingDto } from './dto/update-client-package-pricing.dto';

type PackageLookupOptions = {
  userId?: string;
  username?: string;
};

type PricingOverrideFilters = PackageLookupOptions & {
  activeOnly?: string;
};

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
    @InjectRepository(ClientPackagePricing)
    private readonly pricingRepo: Repository<ClientPackagePricing>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  private toNumber(value: unknown): number | null {
    if (value === undefined || value === null || `${value}`.trim() === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private async resolveUser(userId?: string | number, username?: string) {
    const normalizedUserId = `${userId ?? ''}`.trim();
    if (normalizedUserId && /^\d+$/.test(normalizedUserId)) {
      const user = await this.userRepo.findOne({
        where: { id: Number(normalizedUserId) },
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
      where: [{ username: normalizedUsername }, { email: normalizedUsername }],
    });
  }

  private mapPackageWithPricing(
    pack: Package,
    override?: ClientPackagePricing | null,
  ) {
    const basePrice = Number(pack.price ?? 0);
    const baseCredit = Number(pack.credit ?? pack.price ?? 0);
    const customPrice = this.toNumber(override?.custom_price);
    const customCredit = this.toNumber(override?.custom_credit) ?? customPrice;
    const isCustomPricing = Boolean(override?.is_active);

    return {
      ...pack,
      basePrice,
      baseCredit,
      price: customPrice ?? basePrice,
      credit: `${customCredit ?? baseCredit}`,
      customPrice,
      customCredit,
      isCustomPricing,
      pricingOverrideId: override?.id ?? null,
      pricingNotes: override?.notes ?? null,
    };
  }

  private isMissingPricingTableError(error: unknown) {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = (error as QueryFailedError & {
      driverError?: { code?: string; message?: string };
    }).driverError;

    return (
      driverError?.code === '42P01' ||
      `${driverError?.message ?? error.message ?? ''}`.includes(
        'client_package_pricing',
      )
    );
  }

  private async mapPricingOverrideRows(rows: ClientPackagePricing[]) {
    const userIds = Array.from(new Set(rows.map((item) => Number(item.user_id)).filter(Boolean)));
    const packageIds = Array.from(
      new Set(rows.map((item) => Number(item.package_id)).filter(Boolean)),
    );

    const [users, packages] = await Promise.all([
      userIds.length
        ? this.userRepo.find({ where: { id: In(userIds) } })
        : Promise.resolve([] as Users[]),
      packageIds.length
        ? this.packageRepo.find({ where: { id: In(packageIds) } })
        : Promise.resolve([] as Package[]),
    ]);

    const userMap = new Map(users.map((item) => [Number(item.id), item]));
    const packageMap = new Map(packages.map((item) => [Number(item.id), item]));

    return rows.map((item) => {
      const user = userMap.get(Number(item.user_id));
      const pack = packageMap.get(Number(item.package_id));

      return {
        id: item.id,
        userId: item.user_id,
        packageId: item.package_id,
        customPrice: this.toNumber(item.custom_price),
        customCredit: this.toNumber(item.custom_credit),
        isActive: item.is_active,
        notes: item.notes,
        createdDate: item.created_date,
        modifyDate: item.modify_date,
        clientName:
          `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim() ||
          user?.companyname ||
          user?.username ||
          user?.email ||
          `Client #${item.user_id}`,
        clientUsername: user?.username || user?.email || null,
        packageTitle: pack?.title || null,
        packageDuration: pack?.duration || null,
      };
    });
  }

  async create(dto: CreatePackageDto, user: Users): Promise<Package> {
    const nextId = await getNextNumericId(this.packageRepo);
    const pack = this.packageRepo.create({
      id: nextId,
      title: dto.title,
      duration: dto.duration,
      price: dto.price,
      credit: `${dto.credit}`,
    });
    return this.packageRepo.save(pack);
  }

  async findAll(options?: PackageLookupOptions): Promise<any[]> {
    const packages = await this.packageRepo.find({ order: { id: 'DESC' } });
    const pricingUser = await this.resolveUser(options?.userId, options?.username);

    if (!pricingUser) {
      return packages.map((pack) => this.mapPackageWithPricing(pack));
    }

    try {
      const overrides = await this.pricingRepo.find({
        where: {
          user_id: Number(pricingUser.id),
          is_active: true,
        },
      });

      const overrideMap = new Map(
        overrides.map((item) => [Number(item.package_id), item]),
      );

      return packages.map((pack) =>
        this.mapPackageWithPricing(pack, overrideMap.get(Number(pack.id))),
      );
    } catch (error) {
      if (this.isMissingPricingTableError(error)) {
        return packages.map((pack) => this.mapPackageWithPricing(pack));
      }

      throw error;
    }
  }

  async getPricingOverrides(filters?: PricingOverrideFilters) {
    const pricingUser = await this.resolveUser(filters?.userId, filters?.username);

    if ((filters?.userId || filters?.username) && !pricingUser) {
      return [];
    }

    const where: Partial<ClientPackagePricing> = {};

    if (pricingUser) {
      where.user_id = Number(pricingUser.id);
    }

    if (`${filters?.activeOnly ?? ''}`.toLowerCase() === 'true') {
      where.is_active = true;
    }

    try {
      const rows = await this.pricingRepo.find({
        where,
        order: { id: 'DESC' },
      });

      return this.mapPricingOverrideRows(rows);
    } catch (error) {
      if (this.isMissingPricingTableError(error)) {
        return [];
      }

      throw error;
    }
  }

  async upsertPricingOverride(dto: CreateClientPackagePricingDto) {
    const user = await this.resolveUser(dto.userId);

    if (!user) {
      throw new NotFoundException('Client was not found for custom pricing');
    }

    if ((user.role ?? '').toLowerCase() !== 'client') {
      throw new BadRequestException('Custom pricing can only be assigned to clients');
    }

    const pack = await this.findOne(`${dto.packageId}`);
    const customPrice = this.toNumber(dto.customPrice);
    const customCredit = this.toNumber(dto.customCredit);

    if (customPrice === null && customCredit === null) {
      throw new BadRequestException('Please provide a custom price or custom credit');
    }

    const now = new Date();
    const existing = await this.pricingRepo.findOne({
      where: {
        user_id: Number(user.id),
        package_id: Number(pack.id),
      },
    });

    if (existing) {
      existing.custom_price = customPrice;
      existing.custom_credit = customCredit ?? customPrice;
      existing.notes = dto.notes?.trim() || null;
      existing.is_active =
        dto.isActive === undefined
          ? true
          : dto.isActive === true || `${dto.isActive}`.toLowerCase() === 'true';
      existing.modify_date = now;
      await this.pricingRepo.save(existing);

      return (await this.mapPricingOverrideRows([existing]))[0];
    }

    const nextId = await getNextNumericId(this.pricingRepo);
    const saved = await this.pricingRepo.save(
      this.pricingRepo.create({
        id: nextId,
        user_id: Number(user.id),
        package_id: Number(pack.id),
        custom_price: customPrice,
        custom_credit: customCredit ?? customPrice,
        notes: dto.notes?.trim() || null,
        is_active:
          dto.isActive === undefined
            ? true
            : dto.isActive === true || `${dto.isActive}`.toLowerCase() === 'true',
        created_date: now,
        modify_date: now,
      }),
    );

    return (await this.mapPricingOverrideRows([saved]))[0];
  }

  async updatePricingOverride(id: string, dto: UpdateClientPackagePricingDto) {
    const record = await this.pricingRepo.findOneBy({ id: Number(id) });

    if (!record) {
      throw new NotFoundException(`Pricing override with id ${id} not found`);
    }

    if (dto.userId !== undefined) {
      const user = await this.resolveUser(dto.userId);

      if (!user) {
        throw new NotFoundException('Client was not found for custom pricing');
      }

      if ((user.role ?? '').toLowerCase() !== 'client') {
        throw new BadRequestException('Custom pricing can only be assigned to clients');
      }

      record.user_id = Number(user.id);
    }

    if (dto.packageId !== undefined) {
      const pack = await this.findOne(`${dto.packageId}`);
      record.package_id = Number(pack.id);
    }

    if (dto.customPrice !== undefined) {
      record.custom_price = this.toNumber(dto.customPrice);
    }

    if (dto.customCredit !== undefined) {
      record.custom_credit = this.toNumber(dto.customCredit);
    }

    if (dto.notes !== undefined) {
      record.notes = dto.notes?.trim() || null;
    }

    if (dto.isActive !== undefined) {
      record.is_active =
        dto.isActive === true || `${dto.isActive}`.toLowerCase() === 'true';
    }

    record.modify_date = new Date();
    await this.pricingRepo.save(record);

    return (await this.mapPricingOverrideRows([record]))[0];
  }

  async findOne(id: string): Promise<Package> {
    const pack = await this.packageRepo.findOneBy({ id: Number(id) });
    if (!pack) throw new NotFoundException(`Package with id ${id} not found`);
    return pack;
  }

  async update(
    id: string,
    dto: UpdatePackageDto,
    user: Users,
  ): Promise<Package> {
    await this.findOne(id);
    const payload: Partial<Package> = {};

    if ((dto as any).title !== undefined) {
      payload.title = (dto as any).title;
    }
    if ((dto as any).duration !== undefined) {
      payload.duration = (dto as any).duration;
    }
    if ((dto as any).price !== undefined) {
      payload.price = (dto as any).price;
    }
    if ((dto as any).credit !== undefined) {
      payload.credit = `${(dto as any).credit}`;
    }

    await this.packageRepo.update(Number(id), payload);
    return this.findOne(id);
  }

  async removePricingOverride(id: string) {
    const record = await this.pricingRepo.findOneBy({ id: Number(id) });

    if (!record) {
      throw new NotFoundException(`Pricing override with id ${id} not found`);
    }

    await this.pricingRepo.delete(Number(id));
    return { message: 'Custom pricing override removed successfully' };
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.packageRepo.delete(Number(id));
      return {
        message: 'Package deleted successfully',
      };
    } catch {
      throw new BadRequestException(
        'Unable to delete this package right now. It may still be referenced elsewhere.',
      );
    }
  }
}
