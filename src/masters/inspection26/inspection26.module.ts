import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspection26Service } from './inspection26.service';
import { Inspection26Controller } from './inspection26.controller';
import { Inspection26 } from './entities/inspection26.entity';
import { Inspection26Site } from './entities/inspection26-site.entity';
import { Inspection26Exterior } from './entities/inspection26-exterior.entity';
import { Inspection26Interior } from './entities/inspection26-interior.entity';
import { Inspection26Basement } from './entities/inspection26-basement.entity';
import { Inspection26Measurements } from './entities/inspection26-measurements.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Inspection26, 
    Inspection26Site, 
    Inspection26Exterior, 
    Inspection26Interior, 
    Inspection26Basement, 
    Inspection26Measurements
  ])],
  controllers: [Inspection26Controller],
  providers: [Inspection26Service],
  exports: [Inspection26Service],
})
export class Inspection26Module {}
