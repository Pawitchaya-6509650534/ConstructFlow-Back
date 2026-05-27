import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const optionalBooleanMapper = new Map([
  ['undefined', undefined],
  ['true', true],
  ['false', false],
]);

export class BasePaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'หน้าที่ต้องการ' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'จำนวนรายการต่อหน้า' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  // @ApiPropertyOptional({
  //   example: 'created_at:DESC',
  //   description:
  //     'การเรียงลำดับ เช่น created_at:DESC หรือ name:ASC หรือ score_1:DESC,created_at:ASC ',
  // })
  // @IsOptional()
  // @IsString()F
  // sort?: string;

  @ApiPropertyOptional({
    description: 'keyword for search',
    example: 'Sleep in the morning',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  searchKeyword?: string;

  @ApiPropertyOptional({
    description: 'ระบุว่าให้ JOIN ตาราง หรือไม่',
    example: true,
  })
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;

    return value;
  })
  @IsOptional()
  joinTable?: boolean = false;
}
