import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { SubmitPredictionDto } from './dto/submit-prediction.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictions: PredictionsService) {}

  @Get('me')
  mine(@CurrentUser('id') userId: string) {
    return this.predictions.getMine(userId);
  }

  /** Guarda el borrador de una fase (GROUP, ROUND_OF_32, ... FINAL). */
  @Put('me/phase/:phase')
  savePhase(
    @CurrentUser('id') userId: string,
    @Param('phase') phase: string,
    @Body() dto: SubmitPredictionDto,
  ) {
    return this.predictions.savePhase(userId, phase, dto);
  }

  /** Firma (cierra) una fase. */
  @Post('me/phase/:phase/confirm')
  confirmPhase(
    @CurrentUser('id') userId: string,
    @Param('phase') phase: string,
    @Body() dto: SubmitPredictionDto,
  ) {
    return this.predictions.confirmPhase(userId, phase, dto);
  }
}
