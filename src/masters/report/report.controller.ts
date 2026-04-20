import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Users } from 'src/user/entities/user.entity';
import { ReportService } from './report.service';

@ApiTags('Master Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('employees')
  @ApiOperation({ summary: 'Employee report based on assigned supervisor/team member orders' })
  getEmployeeReport(@Query('role') role?: string) {
    return this.reportService.getEmployeeReport(role);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Client report based on orders created by each client' })
  getClientReport(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('username') username?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reportService.getClientReport({
      name,
      email,
      username,
      pageSize,
    });
  }

  @Get('orders')
  @ApiOperation({ summary: 'Orders report with file, address and client filters' })
  getOrderReport(
    @CurrentUser() user: Users,
    @Query('id') id?: string,
    @Query('subaddress') subaddress?: string,
    @Query('name') name?: string,
    @Query('createdby') createdby?: string,
    @Query('status') status?: string,
    @Query('unassignedOnly') unassignedOnly?: string,
    @Query('assignedSupervisor') assignedSupervisor?: string,
    @Query('assignedTeamMember') assignedTeamMember?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reportService.getOrderReport(
      {
        id,
        subaddress,
        name,
        createdby,
        status,
        unassignedOnly,
        assignedSupervisor,
        assignedTeamMember,
        pageSize,
      },
      user,
    );
  }

  @Get('orders/:id/details')
  @ApiOperation({ summary: 'Detailed order report view with attachments' })
  getOrderReportDetails(@Param('id') id: string, @CurrentUser() user: Users) {
    return this.reportService.getOrderReportDetails(id, user);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Transactions report with registration details' })
  getTransactions(
    @CurrentUser() user: Users,
    @Query('status') status?: string,
    @Query('username') username?: string,
    @Query('type') type?: string,
  ) {
    return this.reportService.getTransactions({ status, username, type }, user);
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Attendance report with derived working hours' })
  getAttendance(
    @Query('username') username?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportService.getAttendance({ username, fromDate, toDate });
  }

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'Dashboard summary with live counts, charts and recent activity' })
  getDashboardSummary() {
    return this.reportService.getDashboardSummary();
  }

  @Get('website-access')
  @ApiOperation({ summary: 'Website access report' })
  getWebsiteAccess() {
    return this.reportService.getWebsiteAccess();
  }
}
