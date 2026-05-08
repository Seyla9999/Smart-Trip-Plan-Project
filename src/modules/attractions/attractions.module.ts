import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attraction } from './attraction.entity'
import { AttractionsService } from './attractions.service'
import { AttractionsController } from './attractions.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Attraction])],
  providers: [AttractionsService],
  controllers: [AttractionsController],
  exports: [AttractionsService],
})
export class AttractionsModule {}
