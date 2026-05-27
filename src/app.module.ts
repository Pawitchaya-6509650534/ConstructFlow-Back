import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ExpenseRequestsModule } from './modules/expense-requests/expense-requests.module';
import { DailyUpdatesModule } from './modules/daily-updates/daily-updates.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UsersModule, AuthModule, TemplatesModule, ProjectsModule, ExpenseRequestsModule, DailyUpdatesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
