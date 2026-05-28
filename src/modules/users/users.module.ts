import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserPreferences } from './user-preferences.entity';
import { UsersService } from './users.service';
import { UsersController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPreferences])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
