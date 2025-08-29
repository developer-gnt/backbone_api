import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateService } from './state.service';
import { StateController } from './state.controller';
import { State } from './entity/state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([State])],
  controllers: [StateController],
  providers: [StateService],
})
export class StateModule {}
