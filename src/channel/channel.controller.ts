import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Сhannel')
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить канал по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID канала' })
  @ApiResponse({ status: 200, description: 'Канал найден и возвращён.' })
  @ApiResponse({ status: 404, description: 'Канал с таким ID не найден.' })
  async findById(@Param('id', new ParseIntPipe()) id: number) {
    return await this.channelService.findByIdOrThrow(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Обновить канал' })
  @ApiParam({ name: 'id', type: Number, description: 'ID канала' })
  @ApiResponse({ status: 200, description: 'Канал успешно обновлён.' })
  @ApiResponse({ status: 404, description: 'Канал с таким ID не найден.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  async updateChannel(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateChannelDto: UpdateChannelDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.channelService.update(id, updateChannelDto, avatar);
  }
}
