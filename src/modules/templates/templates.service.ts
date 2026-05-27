import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { CreateTemplatePhaseDto } from './dto/create-phase.dto';
import { UpdateTemplatePhaseDto } from './dto/update-phase.dto';
import { CreateTemplateCheckpointDto } from './dto/create-checkpoint.dto';
import { UpdateTemplateCheckpointDto } from './dto/update-checkpoint.dto';
import { CreateTemplateFullDto } from './dto/create-template-full.dto';
import { BasePaginationDto } from 'src/common/util/base-pagination.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) { }

  private serializeTemplate(template: any) {
    return {
      ...template,
      phases: (template.phases ?? []).map((phase: any) => ({
        ...phase,
        budget_estimate: Number(phase.budget_estimate ?? 0),
        start_offset_day: Number(phase.start_offset_day ?? 0),
        duration_days: Number(phase.duration_days ?? 0),
      })),
    }
  }

  async createTemplateFull(dto: CreateTemplateFullDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. create template
      const template = await tx.template.create({
        data: {
          name: dto.name,
          description: dto.description,
          created_by: userId,
        },
      });

      // 2. create phases + checkpoints
      for (const phase of dto.phases) {
        const createdPhase = await tx.templatePhase.create({
          data: {
            template_id: template.id,
            name: phase.name,
            order_index: phase.order_index,
            start_offset_day: phase.start_offset_day ?? 0,
            duration_days: phase.duration_days ?? 0,
            budget_estimate: phase.budget_estimate ?? 0,
            created_by: userId,
          },
        });

        for (const cp of phase.checkpoints || []) {
          await tx.templateCheckpoint.create({
            data: {
              phase_id: createdPhase.id,
              name: cp.name,
              order_index: cp.order_index,
              created_by: userId,
            },
          });
        }
      }

      return template;
    });
  }

  async createTemplate(dto: CreateTemplateDto, userId: string) {
    return this.prisma.template.create({
      data: {
        ...dto,
        created_by: userId,
      },
    });
  }

  async createPhase(
    templateId: string,
    dto: CreateTemplatePhaseDto,
    userId: string,
  ) {
    return this.prisma.templatePhase.create({
      data: {
        template_id: templateId,
        ...dto,
        created_by: userId,
      },
    });
  }

  async createCheckpoint(
    phaseId: string,
    dto: CreateTemplateCheckpointDto,
    userId: string,
  ) {
    return this.prisma.templateCheckpoint.create({
      data: {
        phase_id: phaseId,
        ...dto,
        created_by: userId,
      },
    });
  }

  async findAllTemplates(query: BasePaginationDto) {
    const { page = 1, limit = 10, searchKeyword } = query;
    const skip = (page - 1) * limit;
    const where: any = { deleted_at: null };
    if (searchKeyword) {
      where.OR = [
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
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
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data: data.map(t => this.serializeTemplate(t)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneTemplate(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
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
      },
    });
    return template ? this.serializeTemplate(template) : null;
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto, userId: string) {
    return this.prisma.template.update({
      where: { id },
      data: {
        ...dto,
        updated_by: userId,
      },
    });
  }

  async deleteTemplate(id: string, userId: string) {
    return this.prisma.template.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
      },
    });
  }

  async updatePhase(id: string, dto: UpdateTemplatePhaseDto, userId: string) {
    return this.prisma.templatePhase.update({
      where: { id },
      data: {
        ...dto,
        updated_by: userId,
      },
    });
  }

  async deletePhase(id: string, userId: string) {
    return this.prisma.templatePhase.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
      },
    });
  }

  async updateCheckpoint(
    id: string,
    dto: UpdateTemplateCheckpointDto,
    userId: string,
  ) {
    return this.prisma.templateCheckpoint.update({
      where: { id },
      data: {
        ...dto,
        updated_by: userId,
      },
    });
  }

  async deleteCheckpoint(id: string, userId: string) {
    return this.prisma.templateCheckpoint.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_by: userId,
      },
    });
  }
}
