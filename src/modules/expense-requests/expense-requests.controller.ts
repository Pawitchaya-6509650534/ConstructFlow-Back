import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpenseRequestsService } from './expense-requests.service';
import { CreateExpenseRequestDto } from './dto/create-expense-request.dto';
import { ApproveRejectExpenseDto } from './dto/approve-reject-expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, RequestStatus } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { R2Service, UploadFile } from 'src/common/r2/r2.service';
import { UseInterceptors, UploadedFiles } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'

@Controller('projects/:projectId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseRequestsController {
  constructor(
    private readonly expenseRequestsService: ExpenseRequestsService,
    private readonly r2Service: R2Service,
  ) { }

  @Get('expense-summary')
  @Roles(UserRole.CEO)
  getSummary(@Param('projectId') projectId: string) {
    return this.expenseRequestsService.getSummary(projectId);
  }

  @Post('expense-requests')
  @Roles(UserRole.ENGINEER)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateExpenseRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.expenseRequestsService.create(projectId, dto, user.userId);
  }

  @Get('expense-requests')
  findAll(
    @Param('projectId') projectId: string,
    @Query('status') status: RequestStatus,
    @CurrentUser() user: any,
  ) {
    return this.expenseRequestsService.findAll(projectId, status, user);
  }

  @Post('expense-requests/:reqId/images')
  @Roles(UserRole.ENGINEER)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Param('projectId') projectId: string,
    @Param('reqId') reqId: string,
    @UploadedFiles() files: UploadFile[],
    @CurrentUser() user: any,
  ) {
    const urls = await Promise.all(
      files.map(f => this.r2Service.upload(f, 'images/expenses'))
    )
    return this.expenseRequestsService.addImages(reqId, urls, user.userId)
  }

  @Post('expense-requests/:reqId/documents')
  @Roles(UserRole.ENGINEER)
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadDocuments(
    @Param('projectId') projectId: string,
    @Param('reqId') reqId: string,
    @UploadedFiles() files: UploadFile[],
    @CurrentUser() user: any,
  ) {
    const urls = await Promise.all(
      files.map(f => this.r2Service.upload(f, 'files/expenses'))
    )
    return this.expenseRequestsService.addDocuments(reqId, urls, files, user.userId)
  }

  @Get('expense-requests/:reqId')
  findOne(
    @Param('projectId') projectId: string,
    @Param('reqId') reqId: string,
    @CurrentUser() user: any,
  ) {
    return this.expenseRequestsService.findOne(projectId, reqId, user);
  }

  @Patch('expense-requests/:reqId/approve')
  @Roles(UserRole.CEO)
  approve(
    @Param('projectId') projectId: string,
    @Param('reqId') reqId: string,
    @CurrentUser() user: any,
  ) {
    return this.expenseRequestsService.approve(projectId, reqId, user.userId);
  }

  @Patch('expense-requests/:reqId/reject')
  @Roles(UserRole.CEO)
  reject(
    @Param('projectId') projectId: string,
    @Param('reqId') reqId: string,
    @Body() dto: ApproveRejectExpenseDto,
    @CurrentUser() user: any,
  ) {
    return this.expenseRequestsService.reject(projectId, reqId, dto, user.userId);
  }
}
