import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

import { UserController } from './user.controller';
import { EncounterController } from './encounter.controller';
import { EncounterService } from './encounter.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController, EncounterController],
  providers: [UserService, EncounterService],
  exports: [UserService],
})
export class UserModule {}