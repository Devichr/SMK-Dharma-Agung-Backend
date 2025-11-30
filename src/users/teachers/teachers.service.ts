import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeacherDto) {
    return this.prisma.teacher.create({
      data: {
        name: dto.name,
        nip: dto.nip,
        phone: dto.phone,
        address: dto.address,
        userId: dto.userId ?? 0,
      },
    });
  }

  async findAll(page: number, limit: number, search: string) {
    return this.prisma.teacher.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return student;
  }

  async update(id: number, dto: UpdateTeacherDto) {
    await this.findOne(id); // throw if missing

    return this.prisma.teacher.update({
      where: { id },
      data: {
        name: dto.name,
        nip: dto.nip,
        phone: dto.phone,
        address: dto.address,
       userId: dto.userId,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.student.delete({
      where: { id },
    });
  }
}
