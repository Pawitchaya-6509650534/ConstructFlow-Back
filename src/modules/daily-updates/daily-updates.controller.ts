import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DailyUpdatesService } from './daily-updates.service';
import { CreateDailyUpdateDto } from './dto/create-daily-update.dto';
import { UpdateDailyUpdateDto } from './dto/update-daily-update.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { R2Service, UploadFile } from 'src/common/r2/r2.service';
import { UseInterceptors, UploadedFiles } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'

@Controller('projects/:projectId/daily-updates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DailyUpdatesController {
  constructor(
    private readonly dailyUpdatesService: DailyUpdatesService,
    private readonly r2Service: R2Service,
  ) { }

  @Post()
  @Roles(UserRole.ENGINEER)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateDailyUpdateDto,
    @CurrentUser() user: any,
  ) {
    return this.dailyUpdatesService.create(projectId, dto, user.userId)
  }

  @Get()
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.dailyUpdatesService.findAll(projectId, user);
  }

  @Post(':id/images')
  @Roles(UserRole.ENGINEER)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @UploadedFiles() files: UploadFile[],
    @CurrentUser() user: any,
  ) {
    const urls = await Promise.all(
      files.map(f => this.r2Service.upload(f, 'images/daily-updates'))
    )
    return this.dailyUpdatesService.addImages(id, urls, user.userId)
  }

  @Get(':id')
  findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.dailyUpdatesService.findOne(projectId, id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ENGINEER)
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDailyUpdateDto,
    @CurrentUser() user: any,
  ) {
    return this.dailyUpdatesService.update(projectId, id, dto, user.userId)
  }
}
