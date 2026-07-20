import {
  IsString, IsOptional, IsEnum, IsNumber, Min, Max,
  IsArray, IsUUID, MaxLength, IsInt, ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateHikeDto {
  @ApiProperty({ example: 'Tour du Mont Blanc' })
  @IsString()
  @MaxLength(300)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiProperty({ enum: ['very_easy','easy','moderate','hard','expert'] })
  @IsEnum(['very_easy','easy','moderate','hard','expert'])
  difficulty: string;

  @ApiProperty({ enum: ['loop','out_and_back','point_to_point'] })
  @IsEnum(['loop','out_and_back','point_to_point'])
  hikeType: string;

  @ApiProperty({ enum: ['trail','rocky','snow','mixed','via_ferrata'] })
  @IsEnum(['trail','rocky','snow','mixed','via_ferrata'])
  terrainType: string;

  @ApiProperty({ enum: ['hiking','trail_running','snowshoeing','mountain_biking','cycling'] })
  @IsEnum(['hiking','trail_running','snowshoeing','mountain_biking','cycling'])
  practiceType: string;

  @ApiProperty({ required: false, example: 12.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  distanceKm?: number;

  @ApiProperty({ required: false, example: 850 })
  @IsOptional()
  @IsInt()
  @Min(0)
  elevationGainM?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  elevationLossM?: number;

  @ApiProperty({ required: false, description: 'Estimated duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMin?: number;

  @ApiProperty({ required: false, maxLength: 70 })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @ApiProperty({ required: false, maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;

  @ApiProperty({ required: false, description: 'Best months (1-12)', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(12, { each: true })
  @ArrayMaxSize(12)
  bestMonths?: number[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  tagIds?: string[];
}
