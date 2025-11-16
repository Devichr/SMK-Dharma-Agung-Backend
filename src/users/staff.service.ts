import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStaffDto) {
    return this.prisma.staff.create({
      data: {
        name: dto.name,
        employeeId: dto.employeeId,
        position: dto.position,
        phone: dto.phone,
        address: dto.address,
        userId: dto.userId ?? null,
      },
    });
  }

  async findAll(page: number, limit: number, search: string) {
    return this.prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return student;
  }

  async update(id: number, dto: UpdateStaffDto) {
    await this.findOne(id); // throw if missing

    return this.prisma.staff.update({
      where: { id },
      data: {
        name: dto.name,
        employeeId: dto.employeeId,
        position: dto.position,
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
