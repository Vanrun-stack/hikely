import { IsOptional, IsString, IsEnum, IsNumber, Min, IsInt, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class HikeFiltersDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() regionId?: string;
  @ApiPropertyOptional({ enum: ['very_easy','easy','moderate','hard','expert'] })
  @IsOptional() @IsEnum(['very_easy','easy','moderate','hard','expert']) difficulty?: string;
  @ApiPropertyOptional({ enum: ['hiking','trail_running','snowshoeing','mountain_biking','cycling'] })
  @IsOptional() @IsEnum(['hiking','trail_running','snowshoeing','mountain_biking','cycling']) practiceType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) minDistance?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) maxDistance?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) minElevation?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) maxElevation?: number;
  @ApiPropertyOptional({ enum: ['createdAt','rating','distance','popular'] })
  @IsOptional() @IsEnum(['createdAt','rating','distance','popular']) sortBy?: string;
  @ApiPropertyOptional({ enum: ['asc','desc'] })
  @IsOptional() @IsEnum(['asc','desc']) sortOrder?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsInt() @Min(1) @Type(() => Number) page?: number;
  @ApiPropertyOptional({ default: 12 }) @IsOptional() @IsInt() @Min(1) @Type(() => Number) limit?: number;
}
