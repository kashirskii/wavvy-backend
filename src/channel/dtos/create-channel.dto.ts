import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({
    description: 'Название канала',
    minLength: 3,
    maxLength: 20,
    example: 'MyChannel',
  })
  @Length(3, 20)
  name: string;
}
