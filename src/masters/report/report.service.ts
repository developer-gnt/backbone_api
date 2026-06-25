import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Users } from 'src/user/entities/user.entity';
import { CompletedDownload } from '../order/entity/completed-download.entity';
import { Download } from '../order/entity/download.entity';
import { Order } from '../order/entity/order.entity';
import { Transaction } from '../transaction/entity/transaction.entity';
import { Attendance } from './entities/attendance.entity';
import { WebsiteAccessLog } from './entities/website-access-log.entity';

@Injectable()
export class ReportService {
  private readonly allowedClientPageSizes = [50, 100, 250, 500];
  private readonly allowedOrderPageSizes = [100, 200, 300, 500];

  constructor(
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Download)
    private readonly downloadRepo: Repository<Download>,
    @InjectRepository(CompletedDownload)
    private readonly completedDownloadRepo: Repository<CompletedDownload>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(WebsiteAccessLog)
    private readonly websiteAccessRepo: Repository<WebsiteAccessLog>,
  ) { }

  async getEmployeeReport(role?: string) {
    const selectedRoles = role && role !== 'All'
      ? [role]
      : ['Supervisor', 'Team Member'];

    const employees = await this.userRepo.find({
      where: {
        role: In(selectedRoles),
        status: In(['Active', 'New', 'Pending', 'Terminated', 'Ex Employee']),
      },
      order: { id: 'DESC' },
    });

    const orders = await this.orderRepo.find();
    const users = await this.userRepo.find();
    const userMap = new Map(users.map((user) => [String(user.id), user]));

    return employees.map((employee) => {
      const isSupervisor = employee.role === 'Supervisor';
      const relatedOrders = orders.filter((order) => {
        const assignedValue = isSupervisor
          ? order.assigned_supervisor
          : order.assigned_team_member;

        return (
          assignedValue === employee.username ||
          assignedValue === `${employee.id}`
        );
      });

      const completedOrders = relatedOrders.filter(
        (order) => order.status === 'Completed',
      ).length;
      const cancelledOrders = relatedOrders.filter(
        (order) => order.status === 'Cancel',
      ).length;

      const supervisor = employee.emp_supervisor
        ? userMap.get(String(employee.emp_supervisor))
        : null;

      return {
        id: employee.id,
        firstname: employee.firstname,
        lastname: employee.lastname,
        registration_date: employee.date,
        role: employee.role,
        status: employee.status,
        supervisor_name: supervisor
          ? `${supervisor.firstname ?? ''} ${supervisor.lastname ?? ''}`.trim()
          : '',
        orders_assigned: relatedOrders.length,
        orders_completed: completedOrders,
        orders_cancelled: cancelledOrders,
      };
    });
  }

  async getClientReport(filters?: {
    name?: string;
    email?: string;
    username?: string;
    pageSize?: string;
  }) {
    const pageSize = Number(filters?.pageSize);
    const safePageSize = this.allowedClientPageSizes.includes(pageSize)
      ? pageSize
      : 50;

    const clients = await this.userRepo.find({
      where: { role: 'Client' },
      order: { id: 'DESC' },
      take: safePageSize,
    });
    const orders = await this.orderRepo.find();

    const filteredClients = clients.filter((client) => {
      const fullName = `${client.firstname ?? ''} ${client.lastname ?? ''}`
        .trim()
        .toLowerCase();
      const email = (client.email ?? '').trim().toLowerCase();
      const username = (client.username ?? '').trim().toLowerCase();

      const matchesName = filters?.name
        ? fullName.includes(filters.name.trim().toLowerCase())
        : true;
      const matchesEmail = filters?.email
        ? email === filters.email.trim().toLowerCase()
        : true;
      const matchesUsername = filters?.username
        ? username.includes(filters.username.trim().toLowerCase())
        : true;

      return matchesName && matchesEmail && matchesUsername;
    });

    return filteredClients.map((client) => {
      const totalOrders = orders.filter(
        (order) =>
          order.createdby === client.username ||
          order.createdby === `${client.id}`,
      ).length;

      return {
        id: client.id,
        orders: totalOrders,
        email: client.email,
        username: client.username,
        wallete_balance: Number(client.wallete_balance ?? 0),
        status: client.status,
        companyname: client.companyname,
        firstname: client.firstname,
        lastname: client.lastname,
        mobileno: client.mobileno,
        referedby: client.referedby,
        address: client.address,
        city: client.city,
        state: client.state,
        zipcode: client.zipcode,
        registration_date: client.date,
      };
    });
  }

  async getOrderReport(
    filters?: {
      id?: string;
      subaddress?: string;
      name?: string;
      createdby?: string;
      status?: string;
      unassignedOnly?: string;
      assignedSupervisor?: string;
      assignedTeamMember?: string;
      pageSize?: string;
    },
    currentUser?: Users,
  ) {
    const pageSize = Number(filters?.pageSize);
    const safePageSize = this.allowedOrderPageSizes.includes(pageSize)
      ? pageSize
      : 300;

    const query = this.orderRepo
      .createQueryBuilder('order')
      .orderBy('order.id', 'DESC');

    if (filters?.id?.trim()) {
      query.andWhere(`CAST(order.id AS TEXT) LIKE :id`, {
        id: `%${filters.id.trim()}%`,
      });
    }

    if (filters?.subaddress?.trim()) {
      query.andWhere(`LOWER(COALESCE(order.subject_address, '')) LIKE :subaddress`, {
        subaddress: `%${filters.subaddress.trim().toLowerCase()}%`,
      });
    }

    if (filters?.name?.trim()) {
      const lookup = `%${filters.name.trim().toLowerCase()}%`;
      const matchingClients = await this.userRepo
        .createQueryBuilder('user')
        .where(`LOWER(COALESCE(user.firstname, '') || ' ' || COALESCE(user.lastname, '')) LIKE :lookup`, {
          lookup,
        })
        .orWhere(`LOWER(COALESCE(user.companyname, '')) LIKE :lookup`, {
          lookup,
        })
        .orWhere(`LOWER(COALESCE(user.username, '')) LIKE :lookup`, {
          lookup,
        })
        .getMany();

      const usernames = matchingClients
        .map((client) => client.username)
        .filter((username): username is string => Boolean(username));

      if (!usernames.length) {
        return { data: [], totalCount: 0 };
      }

      query.andWhere('order.createdby IN (:...usernames)', { usernames });
    }

    const requestedCreators = (filters?.createdby ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    const creatorValues = (currentUser?.role ?? '').toLowerCase() === 'client'
      ? [currentUser?.username, currentUser?.email, `${currentUser?.id ?? ''}`]
        .map((value) => `${value ?? ''}`.trim().toLowerCase())
        .filter(Boolean)
      : requestedCreators;

    if (creatorValues.length === 1) {
      query.andWhere(`LOWER(COALESCE(order.createdby, '')) = :createdby`, {
        createdby: creatorValues[0],
      });
    } else if (creatorValues.length > 1) {
      query.andWhere(`LOWER(COALESCE(order.createdby, '')) IN (:...createdbyValues)`, {
        createdbyValues: creatorValues,
      });
    }

    const statusValues = (filters?.status ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (statusValues.length === 1) {
      query.andWhere(`LOWER(COALESCE(order.status, '')) = :status`, {
        status: statusValues[0],
      });
    } else if (statusValues.length > 1) {
      query.andWhere(`LOWER(COALESCE(order.status, '')) IN (:...statuses)`, {
        statuses: statusValues,
      });
    }

    if (filters?.unassignedOnly === 'true') {
      query
        .andWhere(`COALESCE(TRIM(order.assigned_supervisor), '') = ''`)
        .andWhere(`COALESCE(TRIM(order.assigned_team_member), '') = ''`);
    }

    const assignedSupervisorValues = (filters?.assignedSupervisor ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (assignedSupervisorValues.length === 1) {
      query.andWhere(`LOWER(COALESCE(order.assigned_supervisor, '')) = :assignedSupervisor`, {
        assignedSupervisor: assignedSupervisorValues[0],
      });
    } else if (assignedSupervisorValues.length > 1) {
      query.andWhere(`LOWER(COALESCE(order.assigned_supervisor, '')) IN (:...assignedSupervisorValues)`, {
        assignedSupervisorValues,
      });
    }

    const assignedTeamMemberValues = (filters?.assignedTeamMember ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (assignedTeamMemberValues.length === 1) {
      query.andWhere(`LOWER(COALESCE(order.assigned_team_member, '')) = :assignedTeamMember`, {
        assignedTeamMember: assignedTeamMemberValues[0],
      });
    } else if (assignedTeamMemberValues.length > 1) {
      query.andWhere(`LOWER(COALESCE(order.assigned_team_member, '')) IN (:...assignedTeamMemberValues)`, {
        assignedTeamMemberValues,
      });
    }

    const totalCount = await query.getCount();
    const orders = await query.take(safePageSize).getMany();
    const users = await this.userRepo.find();

    return {
      totalCount,
      data: orders.map((order) => {
        const client = this.resolveUser(users, order.createdby);

        return {
          id: order.id,
          package: order.package,
          tat: this.formatTatLabel(order.package),
          amount: Number(order.amount ?? 0),
          created_date: order.created_date,
          status: order.status,
          createdby: order.createdby,
          client_name: client
            ? `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim()
            : '',
          email: client?.email ?? '',
          subject_address: order.subject_address,
          reply: order.reply || '',
          remark: order.remark || '',
          emp_remark: order.emp_remark || order.remark || order.description || '',
          remaining_tat: this.calculateRemainingTat(order),
          feedback_rating: order.feedback_rating,
          modify_date: order.modify_date,
          feedback: order.feedback,
          assigner_name: order.assigner_name,
          assigned_supervisor: order.assigned_supervisor,
          assigned_team_member: order.assigned_team_member,
        };
      }),
    };
  }

  async getOrderReportDetails(id: string, currentUser?: Users) {
    const order = await this.orderRepo.findOne({ where: { id: Number(id) } });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    if ((currentUser?.role ?? '').toLowerCase() === 'client') {
      const allowedCreators = [currentUser?.username, currentUser?.email, `${currentUser?.id ?? ''}`]
        .map((value) => `${value ?? ''}`.trim().toLowerCase())
        .filter(Boolean);

      if (!allowedCreators.includes(`${order.createdby ?? ''}`.trim().toLowerCase())) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }
    }

    const users = await this.userRepo.find();
    const supervisor = this.resolveUser(users, order.assigned_supervisor);
    const teamMember = this.resolveUser(users, order.assigned_team_member);
    const client = this.resolveUser(users, order.createdby);

    const downloads = await this.downloadRepo.find({
      where: { order_id: String(order.id) },
      order: { id: 'DESC' },
    });

    const completedDownloads = await this.completedDownloadRepo.find({
      where: { order_id: String(order.id) },
      order: { id: 'DESC' },
    });

    return {
      order: {
        id: order.id,
        package: order.package,
        tat: this.formatTatLabel(order.package),
        created_date: order.created_date,
        status: order.status,
        createdby: order.createdby,
        client_name: client
          ? `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim()
          : '',
        email: client?.email ?? '',
        supervisor_name: supervisor
          ? `${supervisor.firstname ?? ''} ${supervisor.lastname ?? ''}`.trim()
          : '',
        team_member_name:
          order.assigner_name ||
          (teamMember
            ? `${teamMember.firstname ?? ''} ${teamMember.lastname ?? ''}`.trim()
            : ''),
        order_type: order.order_type,
        reoform: order.reoform,
        non_uad: order.non_uad,
        financing: order.financing,
        borrower_name: order.borrower_name,
        subject_address: order.subject_address,
        subject_state: order.subject_state,
        subject_city: order.subject_city,
        subject_zipcode: order.subject_zipcode,
        standard_instruction: order.standard_instruction,
        description: order.description,
        reply: order.reply,
        remark: order.remark,
        sketch: order.sketch,
      },
      downloads: downloads.map((item) => ({
        id: item.id,
        type: item.type,
        filename: item.filename,
        filepath: item.filepath,
      })),
      completedDownloads: completedDownloads.map((item) => ({
        id: item.id,
        type: item.type,
        filename: item.filename,
        filepath: item.filepath,
      })),
    };
  }

  async getTransactions(
    filters?: {
      status?: string;
      username?: string;
      type?: string;
    },
    currentUser?: Users,
  ) {
    const transactions = await this.transactionRepo.find({
      where: filters?.status ? { status: filters.status } : {},
      order: { id: 'DESC' },
    });
    const users = await this.userRepo.find();
    const orders = await this.orderRepo.find();
    const orderMap = new Map(orders.map((order) => [`${order.id}`, order]));

    const allowedUsernames = (currentUser?.role ?? '').toLowerCase() === 'client'
      ? [currentUser?.username, currentUser?.email]
        .map((value) => `${value ?? ''}`.trim().toLowerCase())
        .filter(Boolean)
      : [];

    const normalizedUsername = filters?.username?.trim().toLowerCase();
    const normalizedType = filters?.type?.trim().toLowerCase() || 'all';

    return transactions
      .filter((transaction) => {
        const transactionUser = (transaction.createdby ?? '').trim().toLowerCase();

        if (allowedUsernames.length && !allowedUsernames.includes(transactionUser)) {
          return false;
        }

        if (normalizedUsername && transactionUser !== normalizedUsername) {
          return false;
        }

        const transactionId = (transaction.transaction_id ?? '').trim().toLowerCase();

        if (normalizedType === 'credit') {
          return transactionId === '' || transactionId === '0';
        }

        if (normalizedType === 'bonus') {
          return transactionId === 'bonus';
        }

        return true;
      })
      .map((transaction) => {
        const createdBy = `${transaction.createdby ?? ''}`.trim().toLowerCase();
        const registration = users.find((user) =>
          [user.username, user.email, `${user.id}`]
            .map((value) => `${value ?? ''}`.trim().toLowerCase())
            .includes(createdBy),
        );
        const relatedOrder = transaction.orderid
          ? orderMap.get(`${transaction.orderid}`)
          : null;
        const mode = (transaction.mode ?? 'Credit').trim();

        return {
          ...transaction,
          firstname: registration?.firstname,
          lastname: registration?.lastname,
          email: registration?.email,
          wallete_balance: registration?.wallete_balance,
          client_name: `${registration?.firstname ?? ''} ${registration?.lastname ?? ''}`.trim(),
          order_id: transaction.orderid,
          subject_address: relatedOrder?.subject_address ?? '',
          transaction_type:
            mode.toLowerCase() === 'debit'
              ? 'Debit'
              : !transaction.transaction_id || transaction.transaction_id === '0'
                ? 'Credit'
                : transaction.transaction_id,
        };
      });
  }

  async getAttendance(filters?: {
    username?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const query = this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin(
        Users,
        'user',
        'user.username = attendance.username OR user.email = attendance.username',
      )
      .orderBy('attendance.todaysdate', 'DESC')
      .addOrderBy('attendance.logintime', 'DESC');

    if (filters?.username?.trim()) {
      const identifier = `%${filters.username.trim().toLowerCase()}%`;
      query.andWhere(
        `(LOWER(COALESCE(attendance.username, '')) LIKE :identifier
          OR LOWER(COALESCE(user.email, '')) LIKE :identifier
          OR LOWER(COALESCE(user.username, '')) LIKE :identifier)`,
        { identifier },
      );
    }

    if (filters?.fromDate?.trim()) {
      query.andWhere('attendance.todaysdate >= :fromDate', {
        fromDate: filters.fromDate.trim(),
      });
    }

    if (filters?.toDate?.trim()) {
      query.andWhere('attendance.todaysdate <= :toDate', {
        toDate: filters.toDate.trim(),
      });
    }

    const rows = await query.getMany();

    return rows.map((row) => ({
      ...row,
      WorkingHour:
        row.logintime && row.logouttime
          ? this.calculateWorkingHours(row.logintime, row.logouttime)
          : 'N/A',
    }));
  }

  async getWebsiteAccess() {
    return this.websiteAccessRepo
      .createQueryBuilder('WebsiteAccessLog')
      .orderBy('"WebsiteAccessLog"."Id"', 'DESC')
      .getMany();
  }

  async getDashboardSummary() {
    const [clients, staff, orders, transactions, websiteAccessLogs, attendanceRows] =
      await Promise.all([
        this.userRepo.find({
          where: { role: 'Client' },
          order: { id: 'DESC' },
        }),
        this.userRepo.find({
          where: { role: In(['Admin', 'Supervisor', 'Team Member']) },
          order: { id: 'DESC' },
        }),
        this.orderRepo.find({ order: { id: 'DESC' } }),
        this.transactionRepo.find({ order: { id: 'DESC' } }),
        this.websiteAccessRepo
          .createQueryBuilder('WebsiteAccessLog')
          .orderBy('"WebsiteAccessLog"."Id"', 'DESC').getMany(),
        this.attendanceRepo.find({ order: { todaysdate: 'DESC' } }),
      ]);

    const visibleClients = clients.filter(
      (client) => (client.status ?? '').trim().toLowerCase() !== 'deleted',
    );
    const visibleStaff = staff.filter(
      (member) => (member.status ?? '').trim().toLowerCase() !== 'deleted',
    );
    const users = [...visibleClients, ...visibleStaff];

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const approvedTransactions = transactions.filter((transaction) => {
      const status = (transaction.status ?? '').trim().toLowerCase();
      return !status || ['approved', 'success', 'completed'].includes(status);
    });

    const currentMonthClients = visibleClients.filter((client) =>
      this.isWithinRange(this.asDate(client.date), currentMonthStart, nextMonthStart),
    ).length;
    const previousMonthClients = visibleClients.filter((client) =>
      this.isWithinRange(this.asDate(client.date), previousMonthStart, currentMonthStart),
    ).length;

    const currentMonthStaff = visibleStaff.filter((member) =>
      this.isWithinRange(this.asDate(member.date), currentMonthStart, nextMonthStart),
    ).length;
    const previousMonthStaff = visibleStaff.filter((member) =>
      this.isWithinRange(this.asDate(member.date), previousMonthStart, currentMonthStart),
    ).length;

    const currentMonthOrders = orders.filter((order) =>
      this.isWithinRange(this.asDate(order.created_date), currentMonthStart, nextMonthStart),
    ).length;
    const previousMonthOrders = orders.filter((order) =>
      this.isWithinRange(this.asDate(order.created_date), previousMonthStart, currentMonthStart),
    ).length;

    const approvedCreditsTotal = approvedTransactions.reduce(
      (total, transaction) =>
        total + this.toNumber(transaction.amount || transaction.credits),
      0,
    );
    const currentMonthCredits = approvedTransactions
      .filter((transaction) =>
        this.isWithinRange(
          this.asDate(transaction.created_date),
          currentMonthStart,
          nextMonthStart,
        ),
      )
      .reduce(
        (total, transaction) =>
          total + this.toNumber(transaction.amount || transaction.credits),
        0,
      );
    const previousMonthCredits = approvedTransactions
      .filter((transaction) =>
        this.isWithinRange(
          this.asDate(transaction.created_date),
          previousMonthStart,
          currentMonthStart,
        ),
      )
      .reduce(
        (total, transaction) =>
          total + this.toNumber(transaction.amount || transaction.credits),
        0,
      );

    const monthlyBuckets = this.buildMonthlyBuckets(12);
    const paymentsOverview = {
      received: monthlyBuckets.map((bucket) => ({
        x: bucket.label,
        y: approvedTransactions.filter((transaction) =>
          this.isWithinRange(this.asDate(transaction.created_date), bucket.start, bucket.end),
        ).length,
      })),
      due: monthlyBuckets.map((bucket) => ({
        x: bucket.label,
        y: orders.filter((order) =>
          this.isWithinRange(this.asDate(order.created_date), bucket.start, bucket.end),
        ).length,
      })),
    };

    const weeklyBuckets = this.buildWeeklyBuckets(7);
    const weeklyActivity = {
      sales: weeklyBuckets.map((bucket) => ({
        x: bucket.label,
        y: orders.filter((order) =>
          this.isWithinRange(this.asDate(order.created_date), bucket.start, bucket.end),
        ).length,
      })),
      revenue: weeklyBuckets.map((bucket) => ({
        x: bucket.label,
        y: approvedTransactions.filter((transaction) =>
          this.isWithinRange(this.asDate(transaction.created_date), bucket.start, bucket.end),
        ).length,
      })),
    };

    const statusMap = new Map<string, number>();
    orders.forEach((order) => {
      const status = (order.status ?? 'Unknown').trim() || 'Unknown';
      statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
    });

    const orderStatusBreakdown = Array.from(statusMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, amount]) => ({ name, amount }));

    const topClients = visibleClients
      .map((client) => {
        const ordersCount = orders.filter(
          (order) =>
            order.createdby === client.username ||
            order.createdby === `${client.id}`,
        ).length;

        return {
          id: client.id,
          name: `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim() ||
            client.companyname ||
            client.username ||
            `Client #${client.id}`,
          email: client.email,
          status: client.status,
          city: client.city,
          wallet: this.toNumber(client.wallete_balance),
          orders: ordersCount,
        };
      })
      .sort((a, b) => b.orders - a.orders || b.wallet - a.wallet)
      .slice(0, 5);

    const recentOrders = orders.slice(0, 6).map((order) => {
      const client = this.resolveUser(users, order.createdby);

      return {
        id: order.id,
        clientName:
          `${client?.firstname ?? ''} ${client?.lastname ?? ''}`.trim() ||
          client?.companyname ||
          order.createdby ||
          '-',
        package: order.package || '-',
        status: order.status || '-',
        amount: this.toNumber(order.amount),
        createdDate: order.created_date,
      };
    });

    const recentTransactions = transactions.slice(0, 6).map((transaction) => {
      const client = users.find((user) => user.username === transaction.createdby);

      return {
        id: transaction.id,
        clientName:
          `${client?.firstname ?? ''} ${client?.lastname ?? ''}`.trim() ||
          client?.companyname ||
          transaction.createdby ||
          '-',
        type:
          !transaction.transaction_id || transaction.transaction_id === '0'
            ? 'Credit'
            : transaction.transaction_id,
        status: transaction.status || '-',
        amount: this.toNumber(transaction.amount || transaction.credits),
        createdDate: transaction.created_date,
      };
    });

    const todayKey = now.toISOString().slice(0, 10);
    const websiteAccessToday = websiteAccessLogs.filter((log) => {
      const date = this.asDate(log.lastlogintime);
      return date ? date.toISOString().slice(0, 10) === todayKey : false;
    }).length;
    const attendanceToday = attendanceRows.filter(
      (row) => row.todaysdate === todayKey,
    ).length;
    const pendingOrders = orders.filter(
      (order) => (order.status ?? '').trim().toLowerCase() === 'pending',
    ).length;
    const completedOrders = orders.filter(
      (order) => (order.status ?? '').trim().toLowerCase() === 'completed',
    ).length;

    return {
      overview: {
        clients: {
          value: visibleClients.length,
          growthRate: this.calculateGrowthRate(currentMonthClients, previousMonthClients),
        },
        staff: {
          value: visibleStaff.length,
          growthRate: this.calculateGrowthRate(currentMonthStaff, previousMonthStaff),
        },
        orders: {
          value: orders.length,
          growthRate: this.calculateGrowthRate(currentMonthOrders, previousMonthOrders),
        },
        credits: {
          value: Number(approvedCreditsTotal.toFixed(2)),
          growthRate: this.calculateGrowthRate(currentMonthCredits, previousMonthCredits),
        },
      },
      paymentsOverview,
      weeklyActivity,
      orderStatusBreakdown:
        orderStatusBreakdown.length > 0
          ? orderStatusBreakdown
          : [{ name: 'No Orders', amount: 1 }],
      topClients,
      recentOrders,
      recentTransactions,
      quickStats: {
        websiteAccessTotal: websiteAccessLogs.length,
        websiteAccessToday,
        attendanceToday,
        pendingOrders,
        completedOrders,
      },
    };
  }

  private asDate(value?: Date | string | null) {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toNumber(value?: number | string | null) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private isWithinRange(date: Date | null, start: Date, end: Date) {
    return Boolean(date && date >= start && date < end);
  }

  private calculateGrowthRate(current: number, previous: number) {
    if (previous <= 0) {
      return current > 0 ? 100 : 0;
    }

    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  private buildMonthlyBuckets(totalMonths: number) {
    const buckets: Array<{ label: string; start: Date; end: Date }> = [];
    const now = new Date();

    for (let offset = totalMonths - 1; offset >= 0; offset -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);

      buckets.push({
        label: start.toLocaleString('en-US', { month: 'short' }),
        start,
        end,
      });
    }

    return buckets;
  }

  private buildWeeklyBuckets(totalDays: number) {
    const buckets: Array<{ label: string; start: Date; end: Date }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
      const start = new Date(today);
      start.setDate(today.getDate() - offset);

      const end = new Date(start);
      end.setDate(start.getDate() + 1);

      buckets.push({
        label: start.toLocaleString('en-US', { weekday: 'short' }),
        start,
        end,
      });
    }

    return buckets;
  }

  private resolveUser(users: Users[], value?: string | null) {
    if (!value) {
      return null;
    }

    return (
      users.find(
        (user) =>
          user.username === value || String(user.id) === String(value),
      ) ?? null
    );
  }

  private formatTatLabel(packageValue?: string | null) {
    if (!packageValue) {
      return '—';
    }

    const trimmed = packageValue.trim();

    if (/^\d+$/.test(trimmed)) {
      return `${Number(trimmed)} Hours`;
    }

    return trimmed;
  }

  private calculateRemainingTat(order: Order) {
    if (!order.created_date || !order.package) {
      return '—';
    }

    if (['Completed', 'Cancel'].includes(order.status)) {
      return '—';
    }

    const tatHours = Number(order.package);

    if (!Number.isFinite(tatHours)) {
      return '—';
    }

    const expiry = new Date(order.created_date).getTime() + tatHours * 60 * 60 * 1000;
    const diffMs = expiry - Date.now();
    const sign = diffMs < 0 ? '-' : '';
    const absMs = Math.abs(diffMs);
    const hours = Math.floor(absMs / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  private calculateWorkingHours(login: Date, logout: Date) {
    const diffMs = new Date(logout).getTime() - new Date(login).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}
