import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Users } from 'src/user/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@ApiTags('Master Orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('masters/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'attachments', maxCount: 100 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new client order with optional attachments' })
  create(
    @CurrentUser() user: Users,
    @Body() dto: CreateOrderDto,
    @UploadedFiles()
    files?: {
      attachments?: Array<{
        buffer: Buffer;
        originalname: string;
        mimetype: string;
      }>;
    },
  ) {
    return this.orderService.create(dto, user, files?.attachments ?? []);
  }

  @Get()
  @ApiOperation({ summary: 'View orders with optional filters' })
  getOrders(
    @Query('status') status?: string,
    @Query('createdby') createdby?: string,
  ) {
    return this.orderService.getOrders({ status, createdby });
  }

  @Get('check-duplicate-address')
  @ApiOperation({ summary: 'Check whether a subject address already exists in the portal' })
  checkDuplicateAddress(@Query('address') address?: string) {
    return this.orderService.checkDuplicateAddress(address);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get client and team chat history for an order' })
  getMessages(@Param('id') id: string, @CurrentUser() user: Users) {
    return this.orderService.getMessages(id, user);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a chat message for an order' })
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: Users,
    @Body() body: { message?: string },
  ) {
    return this.orderService.sendMessage(id, user, body.message);
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'attachments', maxCount: 100 }]))
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @CurrentUser() user: Users,
    @Body() dto: UpdateOrderDto,
    @UploadedFiles()
    files?: {
      attachments?: Array<{
        buffer: Buffer;
        originalname: string;
        mimetype: string;
      }>;
    },
  ) {
    return this.orderService.update(id, dto, user, files?.attachments ?? []);
  }

  @Patch(':id/feedback')
  @ApiOperation({ summary: 'Submit client feedback for a completed order' })
  submitFeedback(
    @Param('id') id: string,
    @CurrentUser() user: Users,
    @Body() body: { feedback?: string; feedback_rating?: number | string },
  ) {
    return this.orderService.submitFeedback(id, user, body);
  }

  @Delete('downloads/:downloadId')
  @ApiOperation({ summary: 'Delete a working attachment from an editable order' })
  removeWorkingAttachment(
    @Param('downloadId') downloadId: string,
    @CurrentUser() user: Users,
  ) {
    return this.orderService.deleteWorkingAttachment(downloadId, user);
  }

  @Patch(':id/assign-supervisor')
  @ApiOperation({ summary: 'Assign supervisor to order' })
  assignSupervisor(
    @Param('id') id: string,
    @Body()
    body: {
      assigned_supervisor: string;
      assigner_name?: string;
      status?: string;
    },
    @CurrentUser() user: Users,
  ) {
    if (user.role?.toLowerCase() === 'supervisor') {
      throw new ForbiddenException('Admin can only assign supervisor');
    }
    return this.orderService.assignSupervisor(
      id,
      body.assigned_supervisor,
      body.assigner_name,
      body.status,
    );
  }

  @Patch(':id/assign-team-member')
  @ApiOperation({ summary: 'Assign team member to order' })
  assignTeamMember(
    @Param('id') id: string,
    @Body()
    body: {
      assigned_team_member: string;
      assigner_name?: string;
      status?: string;
    },
    @CurrentUser() user: Users,
  ) {
    if (user.role?.toLowerCase() !== 'supervisor' && user.role?.toLowerCase() !== 'admin') {
      throw new ForbiddenException('Only Supervisor or Admin can assign team member');
    }
    return this.orderService.assignTeamMember(
      id,
      body.assigned_team_member,
      body.assigner_name,
      body.status,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status: Accept / Reject / Cancel / Reopen' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; remark?: string },
  ) {
    return this.orderService.updateOrderStatus(id, body.status, body.remark);
  }

  @Patch(':id/start-work')
  @ApiOperation({ summary: 'Mark an assigned order as work in progress and optionally notify the client' })
  startWork(
    @Param('id') id: string,
    @Body() body: { message?: string },
  ) {
    return this.orderService.startWork(id, body.message);
  }

  @Patch(':id/complete')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'completedAttachments', maxCount: 100 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Complete or resend a completed order with uploaded result files' })
  completeOrder(
    @Param('id') id: string,
    @Body()
    body: {
      emp_remark?: string;
      complete_notification_email?: string;
      extra_emails?: string;
      summary_notes?: string;
      resend_remark?: string;
      replace_existing?: string;
    },
    @UploadedFiles()
    files?: {
      completedAttachments?: Array<{
        buffer: Buffer;
        originalname: string;
        mimetype: string;
      }>;
    },
  ) {
    return this.orderService.completeOrder(
      id,
      body,
      files?.completedAttachments ?? [],
    );
  }

  @Patch(':id/reply')
  @ApiOperation({ summary: 'Add reply, remark, and latest client/team message to order' })
  updateReplyRemark(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.updateReplyRemark(id, dto);
  }
}
