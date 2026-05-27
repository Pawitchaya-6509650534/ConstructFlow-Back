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
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Projects/documents')
@ApiBearerAuth()
@Controller('projects/:projectId/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectDocumentsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.projectsService.getDocuments(projectId, user);
  }

  @Post()
  @Roles(UserRole.CEO)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateDocumentDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.addDocument(projectId, dto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.CEO)
  remove(
    @Param('projectId') projectId: string,
    @Param('id') docId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.removeDocument(projectId, docId, user.id);
  }
}
