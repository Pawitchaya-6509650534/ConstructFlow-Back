import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignEngineerDto } from './dto/assign-engineer.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateProjectPhaseDto } from './dto/create-project-phase.dto';
import { UpdateProjectPhaseDto } from './dto/update-project-phase.dto';
import { CreateProjectCheckpointDto } from './dto/create-project-checkpoint.dto';
import { UpdateProjectCheckpointDto } from './dto/update-project-checkpoint.dto';
import {
  UserRole,
  ProjectStatus,
  TaskStatus,
} from '../../generated/prisma/client.js';
import { BasePaginationDto } from 'src/common/util/base-pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  private computeProjectStatus(
    assignments: { engineer_id: string | null }[] | undefined,
    endDate: Date | null | undefined,
  ): ProjectStatus {
    const now = new Date()

    // เช็ค delayed ก่อน (end_date เลยวันปัจจุบัน)
    if (endDate && new Date(endDate) < now) {
      return ProjectStatus.DELAYED
    }

    // มี assignment = IN_PROGRESS
    if (assignments && assignments.length > 0) {
      return ProjectStatus.IN_PROGRESS
    }

    return ProjectStatus.PLANNING
  }

  private resolveProjectStatus(project: any): ProjectStatus {
    const now = new Date()
    const phases = project.phases ?? []

    // ถ้าทุก phase เสร็จแล้ว = COMPLETED
    if (phases.length > 0 && phases.every((p: any) => p.status === TaskStatus.COMPLETED)) {
      return ProjectStatus.COMPLETED
    }

    // end_date เลยแล้ว และยังไม่ completed = DELAYED
    if (project.end_date && new Date(project.end_date) < now) {
      return ProjectStatus.DELAYED
    }

    // มี assignment = IN_PROGRESS
    if (project.assignments?.length > 0) {
      return ProjectStatus.IN_PROGRESS
    }

    return ProjectStatus.PLANNING
  }

  async createProject(dto: CreateProjectDto, userId: string) {
    if (dto.assignments?.length) {
      const engineers = await this.prisma.user.findMany({
        where: {
          id: { in: dto.assignments.map((a) => a.engineer_id) },
          role: UserRole.ENGINEER,
          is_active: true,
          deleted_at: null,
        },
      });

      if (engineers.length !== dto.assignments.length) {
        throw new BadRequestException('Some engineers IDs are not found');
      }
    }

    let phasesData: any[] = [];
    const hasCustomPhases = dto.phases && dto.phases.length > 0;

    if (hasCustomPhases) {
      phasesData = dto.phases!.map((p) => ({
        name: p.name,
        order_index: p.order_index,
        budget_estimate: p.budget_estimate,
        ...(p.start_date && {
          start_date: new Date(p.start_date),
        }),
        ...(p.end_date && {
          end_date: new Date(p.end_date),
        }),
        status: TaskStatus.PENDING,
        created_by: userId,
        checkpoints: {
          create: (p.checkpoints || []).map((c) => ({
            name: c.name,
            order_index: c.order_index,
            status: TaskStatus.PENDING,
            created_by: userId,
          })),
        },
      }));
    } else if (dto.template_id) {
      const template = await this.prisma.template.findFirst({
        where: { id: dto.template_id, deleted_at: null },
        include: {
          phases: {
            where: { deleted_at: null },
            include: {
              checkpoints: {
                where: { deleted_at: null },
              },
            },
          },
        },
      });
      if (!template) throw new NotFoundException('Template not found');

      phasesData = template.phases.map((p) => ({
        name: p.name,
        order_index: p.order_index,
        budget_estimate: p.budget_estimate,
        created_by: userId,
        status: TaskStatus.PENDING,
        checkpoints: {
          create: p.checkpoints.map((c) => ({
            name: c.name,
            order_index: c.order_index,
            status: TaskStatus.PENDING,
            created_by: userId,
          })),
        },
      }));
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        template_id: dto.template_id,
        budget_total: dto.budget_total ?? 0,
        ...(dto.start_date && {
          start_date: new Date(dto.start_date),
        }),
        ...(dto.end_date && {
          end_date: new Date(dto.end_date),
        }),
        owner_name: dto.owner_name,
        status: this.computeProjectStatus(
          dto.assignments,
          dto.end_date ? new Date(dto.end_date) : null,
        ),
        created_by: userId,
        phases: { create: phasesData },
        assignments: {
          create: dto.assignments?.map((a) => ({
            engineer_id: a.engineer_id,
            assigned_by: userId,
            created_by: userId,
          })),
        },
        documents: {
          create: dto.documents?.map((d) => ({
            name: d.name,
            url: d.url,
            created_by: userId,
          })),
        },
      },
      include: {
        phases: {
          orderBy: { order_index: 'asc' },
          include: {
            checkpoints: { orderBy: { order_index: 'asc' } },
          },
        },
        assignments: {
          include: {
            engineer: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        documents: true,
      },
    });
  }

  async findAllProjects(
    user: any,
    query: BasePaginationDto,
    status?: ProjectStatus,
  ) {
    const { page = 1, limit = 10, searchKeyword, joinTable } = query;

    const where: any = { deleted_at: null };

    if (user.role === UserRole.ENGINEER) {
      where.assignments = {
        some: { engineer_id: user.userId, deleted_at: null },
      };
    }

    if (status && !joinTable) {
      where.status = status;
    }

    if (searchKeyword) {
      where.OR = [
        {
          name: {
            contains: searchKeyword,
            mode: 'insensitive',
          },
        },
        {
          owner_name: {
            contains: searchKeyword,
            mode: 'insensitive',
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    let orderBy: any = { created_at: 'desc' };

    const needPostFilter = joinTable && status;

    const data = await this.prisma.project.findMany({
      where,
      skip: needPostFilter ? 0 : (page - 1) * limit,
      take: needPostFilter ? undefined : limit,
      orderBy,
      include: {
        ...(joinTable === true && {
          phases: {
            orderBy: { order_index: 'asc' },
            include: { checkpoints: { orderBy: { order_index: 'asc' } } },
          },
          assignments: {
            include: {
              engineer: {
                select: { id: true, username: true, first_name: true, last_name: true },
              },
            },
          },
          documents: true,
        }),
        _count: { select: { phases: true, assignments: true } },
      },
    });

    let processedData = data.map(p => ({
      ...p,
      status: joinTable ? this.resolveProjectStatus(p) : p.status,
    }));

    if (needPostFilter) {
      processedData = processedData.filter(p => p.status === status);
      const filteredTotal = processedData.length;
      const skip = (page - 1) * limit;
      const paginated = processedData.slice(skip, skip + limit);

      return {
        data: paginated,
        meta: {
          total: filteredTotal,
          page,
          limit,
          totalPages: Math.ceil(filteredTotal / limit),
        },
      };
    }

    const total = await this.prisma.project.count({ where });

    return {
      data: processedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findProjectById(id: string, user: any) {
    const project = await this.prisma.project.findFirst({
      where: { id, deleted_at: null },
      include: {
        phases: {
          where: { deleted_at: null },
          orderBy: { order_index: 'asc' },
          include: {
            checkpoints: {
              where: { deleted_at: null },
              orderBy: { order_index: 'asc' },
            },
          },
        },
        assignments: {
          where: { deleted_at: null },
          include: {
            engineer: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                email: true,
              },
            },
          },
        },
        documents: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (user.role === UserRole.ENGINEER) {
      const isAssigned = project.assignments.some(
        (a) => a.engineer_id === user.userId,
      );
      if (!isAssigned)
        throw new ForbiddenException('Not assigned to this project');
    }

    // Calculate progress
    let totalCheckpoints = 0;
    let completedCheckpoints = 0;
    project.phases.forEach((p) => {
      totalCheckpoints += p.checkpoints.length;
      completedCheckpoints += p.checkpoints.filter(
        (c) => c.status === TaskStatus.COMPLETED,
      ).length;
    });

    const progress_percentage =
      totalCheckpoints > 0
        ? Math.round((completedCheckpoints / totalCheckpoints) * 100)
        : 0;

    const computedStatus = this.resolveProjectStatus(project)

    if (computedStatus !== project.status) {
      await this.prisma.project.update({
        where: { id },
        data: { status: computedStatus },
      })
    }

    return { ...project, status: computedStatus, progress_percentage };
  }

  async updateProject(id: string, dto: UpdateProjectDto, userId: string) {
    await this.findProjectById(id, { role: UserRole.CEO });

    const { assignments, documents, phases, ...updateData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const currentAssignments = await tx.projectAssignment.findMany({
        where: { project_id: id, deleted_at: null },
      })
      // 1. Update project fields
      const project = await tx.project.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.start_date && { start_date: new Date(updateData.start_date) }),
          ...(updateData.end_date && { end_date: new Date(updateData.end_date) }),
          status: this.computeProjectStatus(
            currentAssignments,
            updateData.end_date ? new Date(updateData.end_date) : null,
          ),
          updated_by: userId,
          updated_at: new Date(),
        },
      })

      // 2. Sync assignments — delete all then re-insert
      if (assignments !== undefined) {
        await tx.projectAssignment.deleteMany({ where: { project_id: id } });
        if (assignments.length > 0) {
          await tx.projectAssignment.createMany({
            data: assignments.map((a) => ({
              project_id: id,
              engineer_id: a.engineer_id,
              assigned_at: new Date(),
              assigned_by: userId,
              created_by: userId,
            })),
          });
        }
      }

      // 3. Sync phases + checkpoints — delete all then re-insert
      if (phases !== undefined) {
        // delete cascades to checkpoints (ถ้า schema มี onDelete: Cascade)
        // ถ้าไม่มี ต้อง delete checkpoints ก่อน
        const existingPhases = await tx.templatePhase.findMany
          ? undefined
          : undefined; // ใช้ projectPhase ตามชื่อ model จริง

        await tx.projectCheckpoint.deleteMany({
          where: { phase: { project_id: id } },
        });
        await tx.projectPhase.deleteMany({ where: { project_id: id } });

        for (const phase of phases) {
          const createdPhase = await tx.projectPhase.create({
            data: {
              project_id: id,
              name: phase.name,
              order_index: phase.order_index ?? 0,
              budget_estimate: phase.budget_estimate ?? 0,
              ...(phase.start_date && {
                start_date: new Date(phase.start_date),
              }),
              ...(phase.end_date && {
                end_date: new Date(phase.end_date),
              }),
              status: 'PENDING',
              created_by: userId,
            },
          });

          if (phase.checkpoints?.length) {
            await tx.projectCheckpoint.createMany({
              data: phase.checkpoints.map((c) => ({
                phase_id: createdPhase.id,
                name: c.name,
                order_index: c.order_index ?? 0,
                status: 'PENDING',
                created_by: userId,
              })),
            });
          }
        }
      }

      return project;
    });
  }

  async removeProject(id: string, userId: string) {
    await this.findProjectById(id, { role: UserRole.CEO });
    return this.prisma.project.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
        updated_at: new Date(),
        is_active: false,
      },
    });
  }

  // --- Assignments ---
  async getAssignments(projectId: string) {
    return this.prisma.projectAssignment.findMany({
      where: { project_id: projectId, deleted_at: null },
      include: {
        engineer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
      },
    });
  }

  async addAssignment(
    projectId: string,
    dto: AssignEngineerDto,
    userId: string,
  ) {
    const existing = await this.prisma.projectAssignment.findFirst({
      where: {
        project_id: projectId,
        engineer_id: dto.engineer_id,
        deleted_at: null,
      },
    });
    if (existing) throw new BadRequestException('Engineer already assigned');

    return this.prisma.projectAssignment.create({
      data: {
        project_id: projectId,
        engineer_id: dto.engineer_id,
        assigned_by: userId,
        created_by: userId,
      },
    });
  }

  async removeAssignment(
    projectId: string,
    assignmentId: string,
    userId: string,
  ) {
    return this.prisma.projectAssignment.update({
      where: { id: assignmentId },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
        updated_at: new Date(),
        is_active: false,
      },
    });
  }

  // --- Documents ---
  async getDocuments(projectId: string, user: any) {
    await this.findProjectById(projectId, user); // check access
    return this.prisma.projectDocument.findMany({
      where: { project_id: projectId, deleted_at: null },
    });
  }

  async addDocument(projectId: string, dto: CreateDocumentDto, userId: string) {
    return this.prisma.projectDocument.create({
      data: {
        ...dto,
        project_id: projectId,
        created_by: userId,
      },
    });
  }

  async addDocumentUrls(projectId: string, urls: string[], userId: string) {
    return this.prisma.projectDocument.createMany({
      data: urls.map((url, i) => ({
        project_id: projectId,
        name: url.split('/').pop() ?? `เอกสาร ${i + 1}`,
        url,
        created_by: userId,
      })),
    })
  }

  async removeDocument(projectId: string, docId: string, userId: string) {
    return this.prisma.projectDocument.update({
      where: { id: docId },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
        updated_at: new Date(),
        is_active: false,
      },
    });
  }

  // --- Phases ---
  async getPhases(projectId: string, user: any) {
    await this.findProjectById(projectId, user);
    return this.prisma.projectPhase.findMany({
      where: { project_id: projectId, deleted_at: null },
      orderBy: { order_index: 'asc' },
      include: {
        checkpoints: {
          where: { deleted_at: null },
          orderBy: { order_index: 'asc' },
        },
      },
    });
  }

  async addPhase(
    projectId: string,
    dto: CreateProjectPhaseDto,
    userId: string,
  ) {
    return this.prisma.projectPhase.create({
      data: {
        ...dto,
        project_id: projectId,
        created_by: userId,
      },
    });
  }

  async updatePhase(
    projectId: string,
    phaseId: string,
    dto: UpdateProjectPhaseDto,
    userId: string,
  ) {
    return this.prisma.projectPhase.update({
      where: { id: phaseId },
      data: { ...dto, updated_by: userId, updated_at: new Date() },
    });
  }

  async removePhase(projectId: string, phaseId: string, userId: string) {
    return this.prisma.projectPhase.update({
      where: { id: phaseId },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
        updated_at: new Date(),
        is_active: false,
      },
    });
  }

  // --- Checkpoints ---
  async getCheckpoints(projectId: string, phaseId: string, user: any) {
    await this.findProjectById(projectId, user);
    return this.prisma.projectCheckpoint.findMany({
      where: { phase_id: phaseId, deleted_at: null },
      orderBy: { order_index: 'asc' },
    });
  }

  async addCheckpoint(
    projectId: string,
    phaseId: string,
    dto: CreateProjectCheckpointDto,
    userId: string,
  ) {
    return this.prisma.projectCheckpoint.create({
      data: {
        ...dto,
        phase_id: phaseId,
        created_by: userId,
        status: TaskStatus.PENDING,
      },
    });
  }

  async updateCheckpoint(
    projectId: string,
    phaseId: string,
    checkpointId: string,
    dto: UpdateProjectCheckpointDto,
    user: any,
  ) {
    await this.findProjectById(projectId, user); // check access

    // Fetch current state
    const current = await this.prisma.projectCheckpoint.findFirst({
      where: { id: checkpointId, deleted_at: null },
    });
    if (!current) throw new NotFoundException('Checkpoint not found');

    const isEng = user.role === UserRole.ENGINEER;

    // Build update data
    const data: any = { updated_by: user.id, updated_at: new Date() };

    if (isEng) {
      if (dto.status) data.status = dto.status;
      if (dto.note_text !== undefined) data.note_text = dto.note_text;
      if (dto.image_url !== undefined) data.image_url = dto.image_url;
      if (
        dto.status &&
        dto.status !== TaskStatus.PENDING &&
        !current.started_at
      )
        data.started_at = new Date();
      if (
        dto.status === TaskStatus.COMPLETED &&
        current.status !== TaskStatus.COMPLETED
      )
        data.completed_at = new Date();
    } else {
      if (dto.status) data.status = dto.status;
      if (dto.name) data.name = dto.name;
      if (dto.order_index !== undefined) data.order_index = dto.order_index;
    }

    const updated = await this.prisma.projectCheckpoint.update({
      where: { id: checkpointId },
      data,
    });

    // บันทึก log ทุกครั้ง ไม่ว่า status จะเปลี่ยนหรือไม่
    const statusChanged = dto.status && dto.status !== current.status;

    await this.prisma.checkpointLog.create({
      data: {
        checkpoint_id: checkpointId,
        old_status: current.status,
        new_status: dto.status ?? current.status,
        note_text: dto.note_text || (statusChanged ? 'เปลี่ยนสถานะ' : 'อัพเดทข้อมูล'),
        created_by: user.userId,  // ใครบันทึก
      },
    });

    // Auto-complete phase logic — เฉพาะเมื่อ status เปลี่ยนเป็น COMPLETED
    if (statusChanged) {
      const allPhaseCheckpoints = await this.prisma.projectCheckpoint.findMany({
        where: { phase_id: phaseId, deleted_at: null },
      });

      const allDone = allPhaseCheckpoints.every(c => c.status === TaskStatus.COMPLETED)
      const anyStarted = allPhaseCheckpoints.some(
        c => c.status === TaskStatus.IN_PROGRESS || c.status === TaskStatus.COMPLETED
      )

      let newPhaseStatus: TaskStatus
      if (allDone) {
        newPhaseStatus = TaskStatus.COMPLETED
      } else if (anyStarted) {
        newPhaseStatus = TaskStatus.IN_PROGRESS
      } else {
        newPhaseStatus = TaskStatus.PENDING
      }

      await this.prisma.projectPhase.update({
        where: { id: phaseId },
        data: { status: newPhaseStatus, updated_at: new Date() },
      })

      // Auto-complete project ถ้าทุก phase เสร็จ
      if (newPhaseStatus === TaskStatus.COMPLETED) {
        const allProjectPhases = await this.prisma.projectPhase.findMany({
          where: { project_id: projectId, deleted_at: null },
        })
        const allPhaseDone = allProjectPhases.every(
          p => p.status === TaskStatus.COMPLETED || p.id === phaseId,
        )
        if (allPhaseDone) {
          await this.prisma.project.update({
            where: { id: projectId },
            data: { status: ProjectStatus.COMPLETED, updated_at: new Date() },
          })
        }
      }
    }

    return updated;
  }

  async removeCheckpoint(
    projectId: string,
    phaseId: string,
    checkpointId: string,
    userId: string,
  ) {
    return this.prisma.projectCheckpoint.update({
      where: { id: checkpointId },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
        updated_at: new Date(),
        is_active: false,
      },
    });
  }

  // --- Logs ---
  async getCheckpointLogs(projectId: string, phaseId: string, checkpointId: string, user: any) {
    await this.findProjectById(projectId, user);
    return this.prisma.checkpointLog.findMany({
      where: { checkpoint_id: checkpointId, deleted_at: null },
      orderBy: { created_at: 'desc' },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true, username: true },
        },
        images: true,
      },
    });
  }

  async addCheckpointImages(checkpointId: string, urls: string[], userId: string) {
    // หา log ล่าสุดของ checkpoint นี้
    const latestLog = await this.prisma.checkpointLog.findFirst({
      where: { checkpoint_id: checkpointId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    })

    if (latestLog) {
      // เพิ่มรูปใน log
      await this.prisma.checkpointLogImage.createMany({
        data: urls.map(url => ({
          log_id: latestLog.id,
          url,
          created_by: userId,
        })),
      })
    }

    // อัพเดท image_url หลักใน checkpoint (รูปแรก)
    if (urls.length > 0) {
      await this.prisma.projectCheckpoint.update({
        where: { id: checkpointId },
        data: { image_url: urls[0] },
      })
    }
  }
}
