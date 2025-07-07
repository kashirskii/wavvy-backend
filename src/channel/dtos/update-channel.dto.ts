import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChannelDto {
  @ApiPropertyOptional({
    description: 'Название канала (необязательное)',
    example: 'UpdatedChannelName',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
