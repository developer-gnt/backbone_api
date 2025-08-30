import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenceService } from './reference.service';
import { ReferenceController } from './reference.controller';
import { Reference } from './entity/reference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reference])],
  controllers: [ReferenceController],
  providers: [ReferenceService],
})
export class ReferenceModule {}
