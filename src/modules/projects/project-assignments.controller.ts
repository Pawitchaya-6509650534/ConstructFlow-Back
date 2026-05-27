import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AssignEngineerDto } from './dto/assign-engineer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Projects/assignments')
@ApiBearerAuth()
@Controller('projects/:projectId/assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CEO)
export class ProjectAssignmentsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.projectsService.getAssignments(projectId);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: AssignEngineerDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.addAssignment(projectId, dto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('projectId') projectId: string,
    @Param('id') assignmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.removeAssignment(
      projectId,
      assignmentId,
      user.id,
    );
  }
}
