import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EncounterModule } from './encounter/encounter.module';

@Module({
  imports: [
    EncounterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
