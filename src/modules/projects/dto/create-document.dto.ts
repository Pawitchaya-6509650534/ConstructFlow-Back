import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'ชื่อเอกสาร',
    example: 'แบบแปลนโครงสร้างชั้น 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'URL ของเอกสาร',
    example: 'https://storage.example.com/docs/plan-01.pdf',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
