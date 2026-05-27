import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectAssignmentsController } from './project-assignments.controller';
import { ProjectDocumentsController } from './project-documents.controller';
import { ProjectPhasesController } from './project-phases.controller';
import { ProjectCheckpointsController } from './project-checkpoints.controller';
import { R2Module } from 'src/common/r2/r2.module';

@Module({
  imports: [R2Module],
  controllers: [ProjectsController, ProjectAssignmentsController, ProjectDocumentsController, ProjectPhasesController, ProjectCheckpointsController],
  providers: [ProjectsService]
})
export class ProjectsModule { }
