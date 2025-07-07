import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { promises as fsPromises } from 'fs';
import { existsSync } from 'fs';

@Injectable()
export class FileService {
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  async createFile(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new InternalServerErrorException('No file provided');
    }

    const fileExtension = extname(file.originalname).toLowerCase();
    const fileName = uuidv4() + fileExtension;
    const fullPath = join(this.uploadRoot, fileName);

    try {
      if (!existsSync(this.uploadRoot)) {
        fsPromises.mkdir(this.uploadRoot, { recursive: true });
      }

      await fsPromises.writeFile(fullPath, file.buffer);
      return fileName;
    } catch {
      throw new InternalServerErrorException('Error writing file');
    }
  }
}
