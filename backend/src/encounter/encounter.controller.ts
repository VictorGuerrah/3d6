import { Body, Controller, Post } from '@nestjs/common';
import { EncounterService } from './encounter.service';
import type { ComputeEncountersInput, ComputeEncountersOutput } from './dto/compute-encounters.dto';

/**
 * Controller for encounter computation endpoints.
 */
@Controller('encounter')
export class EncounterController {
  constructor(private readonly encounterService: EncounterService) {}

  /**
   * Compute optimal enemy encounter combinations based on input parameters.
   */
  @Post('compute')
  computeEncounters(@Body() input: ComputeEncountersInput): ComputeEncountersOutput[] {
    return this.encounterService.computeEncounters(input);
  }
}
