import { SetMetadata } from '@nestjs/common';
import { STEP_UP_KEY, StepUpAction } from '../../../common/constants/auth.constants';

export const RequiresStepUp = (action: StepUpAction) =>
  SetMetadata(STEP_UP_KEY, action);
