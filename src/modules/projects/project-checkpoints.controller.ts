import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectCheckpointDto } from './dto/create-project-checkpoint.dto';
import { UpdateProjectCheckpointDto } from './dto/update-project-checkpoint.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { R2Service, UploadFile } from 'src/common/r2/r2.service';
import { UseInterceptors, UploadedFiles } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects/:projectId/phases/:phaseId/checkpoints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectCheckpointsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly r2Service: R2Service,
  ) { }

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @Param('phaseId') phaseId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.getCheckpoints(projectId, phaseId, user);
  }

  @Post()
  @Roles(UserRole.CEO)
  create(
    @Param('projectId') projectId: string,
    @Param('phaseId') phaseId: string,
    @Body() dto: CreateProjectCheckpointDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.addCheckpoint(projectId, phaseId, dto, user.id);
  }

  @Patch(':checkpointId')
  update(
    @Param('projectId') projectId: string,
    @Param('phaseId') phaseId: string,
    @Param('checkpointId') checkpointId: string,
    @Body() dto: UpdateProjectCheckpointDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.updateCheckpoint(
      projectId,
      phaseId,
      checkpointId,
      dto,
      user,
    );
  }

  @Delete(':checkpointId')
  @Roles(UserRole.CEO)
  remove(
    @Param('projectId') projectId: string,
    @Param('phaseId') phaseId: string,
    @Param('checkpointId') checkpointId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.removeCheckpoint(
      projectId,
      phaseId,
      checkpointId,
      user.id,
    );
  }

  @Post(':checkpointId/images')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Param('projectId') projectId: string,
    @Param('phaseId') phaseId: string,
    @Param('checkpointId') checkpointId: string,
    @UploadedFiles() files: UploadFile[],
    @CurrentUser() user: any,
  ) {
    const urls = await Promise.all(
      files.map(f => this.r2Service.upload(f, 'images/checkpoints'))
    )
    await this.projectsService.addCheckpointImages(checkpointId, urls, user.userId)

    return { urls }
  }

  @Get(':checkpointId/logs')
  getLogs(
    @Param('projectId') projectId: string,
    @Param('phaseId') phaseId: string,
    @Param('checkpointId') checkpointId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.getCheckpointLogs(
      projectId,
      phaseId,
      checkpointId,
      user,
    );
  }
}
