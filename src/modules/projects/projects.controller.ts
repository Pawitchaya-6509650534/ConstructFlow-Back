import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProjectStatus, UserRole } from '../../generated/prisma/client.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BasePaginationDto } from 'src/common/util/base-pagination.dto';
import { R2Service, UploadFile } from 'src/common/r2/r2.service';
import { UseInterceptors, UploadedFiles } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly r2Service: R2Service,
  ) { }

  @Get()
  @ApiQuery({ name: 'status', enum: ProjectStatus, required: false })
  findAll(
    @CurrentUser() user: { userId: string; role: string },
    @Query() query: BasePaginationDto,
    @Query('status') status?: ProjectStatus,
  ) {
    return this.projectsService.findAllProjects(user, query, status);
  }

  @Post()
  @Roles(UserRole.CEO)
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectsService.createProject(createProjectDto, user.userId)
  }

  @Post(':id/documents/upload')
  @Roles(UserRole.CEO)
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: UploadFile[],
    @CurrentUser() user: { userId: string },
  ) {
    const urls = await Promise.all(
      files.map(f => this.r2Service.upload(f, 'files/documents'))
    )
    return this.projectsService.addDocumentUrls(id, urls, user.userId)
  }

  @Delete(':id/documents/:docId')
  @Roles(UserRole.CEO)
  removeDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectsService.removeDocument(id, docId, user.userId)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string; role: string }) {
    return this.projectsService.findProjectById(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.CEO)
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectsService.updateProject(
      id,
      updateProjectDto,
      user.userId,
    );
  }

  @Delete(':id')
  @Roles(UserRole.CEO)
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.projectsService.removeProject(id, user.userId);
  }
}
