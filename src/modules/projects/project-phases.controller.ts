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
import { CreateProjectPhaseDto } from './dto/create-project-phase.dto';
import { UpdateProjectPhaseDto } from './dto/update-project-phase.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects/:projectId/phases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectPhasesController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.projectsService.getPhases(projectId, user);
  }

  @Post()
  @Roles(UserRole.CEO)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectPhaseDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.addPhase(projectId, dto, user.id);
  }

  @Patch(':phaseId')
  @Roles(UserRole.CEO)
  update(
    @Param('projectId') projectId: string,
    @Param('phaseId') phaseId: string,
    @Body() dto: UpdateProjectPhaseDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.updatePhase(projectId, phaseId, dto, user.id);
  }

  @Delete(':phaseId')
  @Roles(UserRole.CEO)
  remove(
    @Param('projectId') projectId: string,
    @Param('phaseId') phaseId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.removePhase(projectId, phaseId, user.id);
  }
}
