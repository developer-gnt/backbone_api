import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspection36Service } from './inspection36.service';
import { Inspection36Controller } from './inspection36.controller';
import { Inspection36 } from './entities/inspection36.entity';
import { Inspection36Arrive } from './entities/inspection36-arrive.entity';
import { Inspection36Curb } from './entities/inspection36-curb.entity';
import { Inspection36Exterior } from './entities/inspection36-exterior.entity';
import { Inspection36Yard } from './entities/inspection36-yard.entity';
import { Inspection36Outbuildings } from './entities/inspection36-outbuildings.entity';
import { Inspection36Mainlevel } from './entities/inspection36-mainlevel.entity';
import { Inspection36Upperlevel } from './entities/inspection36-upperlevel.entity';
import { Inspection36Belowgrade } from './entities/inspection36-belowgrade.entity';
import { Inspection36Adu } from './entities/inspection36-adu.entity';
import { Inspection36Final } from './entities/inspection36-final.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection36,
      Inspection36Arrive,
      Inspection36Curb,
      Inspection36Exterior,
      Inspection36Yard,
      Inspection36Outbuildings,
      Inspection36Mainlevel,
      Inspection36Upperlevel,
      Inspection36Belowgrade,
      Inspection36Adu,
      Inspection36Final,
    ]),
  ],
  controllers: [Inspection36Controller],
  providers: [Inspection36Service],
})
export class Inspection36Module {}
