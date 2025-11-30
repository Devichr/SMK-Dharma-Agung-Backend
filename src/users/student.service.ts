import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: {
        name: dto.name,
        nisn: dto.nisn,
        phone: dto.phone,
        address: dto.address,
        birthDate: new Date(dto.birthDate),
        schoolOrigin: dto.schoolOrigin ?? '',
        userId: dto.userId ?? null,
      },
    });
  }

  async findAll(page : number, limit : number, search: string) {
    return this.prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return student;
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.findOne(id); // throw if missing

    return this.prisma.student.update({
      where: { id },
      data: {
        name: dto.name,
        nisn: dto.nisn,
        phone: dto.phone,
        address: dto.address,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        schoolOrigin: dto.schoolOrigin,
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
