import { PartialType } from '@nestjs/swagger';
import { CreateHikeDto } from './create-hike.dto';

export class UpdateHikeDto extends PartialType(CreateHikeDto) {}
