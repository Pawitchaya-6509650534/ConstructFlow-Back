import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseRequestDto } from './dto/create-expense-request.dto';
import { ApproveRejectExpenseDto } from './dto/approve-reject-expense.dto';
import {
  RequestStatus,
  UserRole,
  TaskStatus,
} from '../../generated/prisma/client.js';
import { UploadFile } from 'src/common/r2/r2.service';

@Injectable()
export class ExpenseRequestsService {
  constructor(private prisma: PrismaService) { }

  async create(
    projectId: string,
    dto: CreateExpenseRequestDto,
    userId: string,
  ) {
    // Phase must belong to this project and must be COMPLETED
    const phase = await this.prisma.projectPhase.findFirst({
      where: { id: dto.phase_id, project_id: projectId, deleted_at: null },
    });

    if (!phase) throw new NotFoundException('Project Phase not found');
    if (phase.status !== TaskStatus.COMPLETED) {
      throw new BadRequestException(
        'Expense request can only be made when phase is COMPLETED',
      );
    }

    return this.prisma.expenseRequest.create({
      data: {
        project_id: projectId,
        phase_id: dto.phase_id,
        amount: dto.amount,
        description: dto.description,
        status: RequestStatus.PENDING,
        created_by: userId,
        requester_id: userId,
      },
    });
  }

  async addImages(reqId: string, urls: string[], userId: string) {
    return this.prisma.expenseImage.createMany({
      data: urls.map(url => ({
        expense_request_id: reqId,
        url,
        created_by: userId,
      })),
    })
  }

  async addDocuments(reqId: string, urls: string[], files: UploadFile[], userId: string) {
    return this.prisma.expenseDocument.createMany({
      data: urls.map((url, i) => ({
        expense_request_id: reqId,
        name: files[i].originalname,
        url,
        size: `${(files[i].buffer.length / 1024).toFixed(0)} KB`,
        created_by: userId,
      })),
    })
  }

  async findAll(
    projectId: string,
    status: RequestStatus | undefined,
    user: any,
  ) {
    const where: any = { project_id: projectId, deleted_at: null };

    if (status) {
      where.status = status;
    }

    if (user.role === UserRole.ENGINEER) {
      where.requester_id = user.id;
    }

    return this.prisma.expenseRequest.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        phase: { select: { id: true, name: true } },
        requester: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
          },
        },
        images: true,
        documents: true,
      },
    });
  }

  async findOne(projectId: string, reqId: string, user: any) {
    const request = await this.prisma.expenseRequest.findFirst({
      where: { id: reqId, project_id: projectId, deleted_at: null },
      include: {
        phase: { select: { id: true, name: true } },
        requester: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
          },
        },
        approver: { select: { id: true, first_name: true, last_name: true } },
        rejector: { select: { id: true, first_name: true, last_name: true } },
        images: true,
        documents: true,
      },
    });

    if (!request) throw new NotFoundException('Expense request not found');

    if (user.role === UserRole.ENGINEER && request.requester_id !== user.id) {
      throw new ForbiddenException('Cannot view expense requests of others');
    }

    return request;
  }

  async approve(projectId: string, reqId: string, userId: string) {
    const request = await this.findOne(projectId, reqId, {
      role: UserRole.CEO,
    });

    if (request.status === RequestStatus.APPROVED)
      throw new ConflictException('Already approved');
    if (request.status === RequestStatus.REJECTED)
      throw new ConflictException('Already rejected');

    return this.prisma.expenseRequest.update({
      where: { id: reqId },
      data: {
        status: RequestStatus.APPROVED,
        approved_by: userId,
        approved_at: new Date(),
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }

  async reject(
    projectId: string,
    reqId: string,
    dto: ApproveRejectExpenseDto,
    userId: string,
  ) {
    const request = await this.findOne(projectId, reqId, {
      role: UserRole.CEO,
    });

    if (request.status === RequestStatus.APPROVED)
      throw new ConflictException('Already approved');
    if (request.status === RequestStatus.REJECTED)
      throw new ConflictException('Already rejected');

    return this.prisma.expenseRequest.update({
      where: { id: reqId },
      data: {
        status: RequestStatus.REJECTED,
        rejected_by: userId,
        rejected_at: new Date(),
        reviewer_note: dto.reviewer_note,
        updated_by: userId,
        updated_at: new Date(),
      },
    });
  }

  async getSummary(projectId: string) {
    const phases = await this.prisma.projectPhase.findMany({
      where: { project_id: projectId, deleted_at: null },
      include: {
        expense_requests: {
          where: { status: RequestStatus.APPROVED, deleted_at: null },
        },
      },
      orderBy: { order_index: 'asc' },
    });

    let totalBudget = 0;
    let totalActualCost = 0;

    const phaseSummaries = phases.map((p) => {
      const budget = p.budget_estimate ? Number(p.budget_estimate) : 0;
      const actualCost = p.expense_requests.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0,
      );

      totalBudget += budget;
      totalActualCost += actualCost;

      return {
        phase_id: p.id,
        phase_name: p.name,
        budget_estimate: budget,
        actual_cost: actualCost,
        variance: budget - actualCost,
      };
    });

    return {
      project_id: projectId,
      total_budget: totalBudget,
      total_actual_cost: totalActualCost,
      total_variance: totalBudget - totalActualCost,
      phases: phaseSummaries,
    };
  }
}
