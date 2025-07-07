import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import { FileService } from 'src/file/file.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  public async createOne(userId: number, name: string) {
    return await this.prisma.channel.create({
      data: {
        name: name,
        userId,
      },
    });
  }

  public async findAll() {
    return await this.prisma.channel.findMany();
  }

  public async findById(id: number) {
    return await this.prisma.channel.findUnique({ where: { id } });
  }

  public async findByIdOrThrow(id: number) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });

    if (!channel) {
      throw new NotFoundException(`Channel with id ${id} not found`);
    }

    return channel;
  }

  public async update(
    id: number,
    data: UpdateChannelDto,
    avatar?: Express.Multer.File,
  ) {
    if (Object.keys(data).length === 0 && !avatar) {
      return;
    }

    await this.findByIdOrThrow(id);

    const updateData: Prisma.ChannelUpdateInput = { ...data };

    if (avatar) {
      const fileName = await this.fileService.createFile(avatar);
      updateData.avatarUrl = fileName;
    }

    await this.prisma.channel.update({
      where: { id },
      data: updateData,
    });
  }
}
