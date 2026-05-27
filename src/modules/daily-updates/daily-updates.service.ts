import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDailyUpdateDto } from './dto/create-daily-update.dto';
import { UpdateDailyUpdateDto } from './dto/update-daily-update.dto';
import { UserRole } from '../../generated/prisma/client.js';
import { startOfDay } from 'date-fns';

@Injectable()
export class DailyUpdatesService {
  constructor(private prisma: PrismaService) { }

  async create(projectId: string, dto: CreateDailyUpdateDto, userId: string) {
    const now = new Date()
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    // 1 ครั้งต่อวันต่อโปรเจ็ค ไม่ว่าใครจะ post
    const existing = await this.prisma.dailyUpdate.findUnique({
      where: {
        daily_update_unique: {
          project_id: projectId,
          date: today,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'มีการบันทึก Daily Update สำหรับวันนี้แล้ว',
      );
    }

    return this.prisma.dailyUpdate.create({
      data: {
        ...dto,
        project_id: projectId,
        engineer_id: userId,
        date: today,
        created_by: userId,
      },
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

  async addImages(updateId: string, urls: string[], userId: string) {
    return this.prisma.dailyUpdateImage.createMany({
      data: urls.map(url => ({
        daily_update_id: updateId,
        url,
        created_by: userId,
      })),
    })
  }

  async findAll(projectId: string, user: any) {
    // ทุก role เห็น feed เดียวกัน
    return this.prisma.dailyUpdate.findMany({
      where: { project_id: projectId, deleted_at: null },
      orderBy: { date: 'desc' },
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
        images: true,
      },
    });
  }

  async findOne(projectId: string, updateId: string, user: any) {
    const dailyUpdate = await this.prisma.dailyUpdate.findFirst({
      where: { id: updateId, project_id: projectId, deleted_at: null },
      include: {
        engineer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
        images: true,
      },
    });

    if (!dailyUpdate) throw new NotFoundException('Daily update not found');

    return dailyUpdate;
  }

  async update(
    projectId: string,
    updateId: string,
    dto: UpdateDailyUpdateDto,
    userId: string,
  ) {
    const dailyUpdate = await this.findOne(projectId, updateId, { id: userId, role: UserRole.ENGINEER });

    // แก้ได้เฉพาะคนที่ post และแก้ได้วันเดียวกันเท่านั้น
    if (dailyUpdate.engineer_id !== userId) {
      throw new ForbiddenException('แก้ไขได้เฉพาะรายการที่ตัวเองบันทึก');
    }

    const today = startOfDay(new Date());
    const updateDate = startOfDay(new Date(dailyUpdate.date!));
    if (updateDate.getTime() !== today.getTime()) {
      throw new ForbiddenException('แก้ไขได้เฉพาะวันที่บันทึกเท่านั้น');
    }

    return this.prisma.dailyUpdate.update({
      where: { id: updateId },
      data: { ...dto, updated_by: userId, updated_at: new Date() },
    });
  }
}
