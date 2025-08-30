import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forms } from './entity/forms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Forms])],
  providers: [FormsService],
  controllers: [FormsController],
})
export class FormsModule {}
