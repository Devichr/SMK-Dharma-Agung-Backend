import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeacherDto) {
    // Jika userId tidak ada, buat user baru
    let userId = dto.userId;

    if (!userId) {
      // Buat user baru dengan email dari NIP atau generate
      const email = `${dto.nip}@school.com`;
      const password = await bcrypt.hash(dto.nip, 10); // Default password = NIP

      const newUser = await this.prisma.user.create({
        data: {
          email,
          password,
          role: 'TEACHER',
        },
      });

      userId = newUser.id;
    }

    return this.prisma.teacher.create({
      data: {
        name: dto.name,
        nip: dto.nip,
        phone: dto.phone,
        address: dto.address,
        userId: userId,
      },
      include: {
        user: true,
        gradeClasses: true,
      },
    });
  }

  async findAll(page: number, limit: number, search: string) {
    return this.prisma.teacher.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        gradeClasses: true,
      },
    });
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        gradeClasses: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    return teacher;
  }

  async update(id: number, dto: UpdateTeacherDto) {
    await this.findOne(id);

    return this.prisma.teacher.update({
      where: { id },
      data: {
        name: dto.name,
        nip: dto.nip,
        phone: dto.phone,
        address: dto.address,
        ...(dto.userId !== undefined && { userId: dto.userId }),
      },
      include: {
        user: true,
        gradeClasses: true,
      },
    });
  }

  async getSubjects(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${teacherId} not found`);
    }

    return this.prisma.teacherSubject.findMany({
      where: { teacherId },
      include: {
        subject: {
          include: {
            _count: {
              select: {
                schedules: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { subject: { name: 'asc' } },
      ],
    });
  }

  async assignSubject(teacherId: number, subjectId: number, isPrimary: boolean = false) {
    const teacher = await this.findOne(teacherId);

    // Validasi subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${subjectId} not found`);
    }

    // Cek apakah sudah di-assign
    const existing = await this.prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId,
      },
    });

    if (existing) {
      throw new ConflictException('Subject already assigned to this teacher');
    }

    // Jika isPrimary true, set yang lain jadi false untuk subject ini
    if (isPrimary) {
      await this.prisma.teacherSubject.updateMany({
        where: { subjectId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.teacherSubject.create({
      data: {
        teacherId,
        subjectId,
        isPrimary,
      },
      include: {
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async removeSubject(teacherId: number, subjectId: number) {
    await this.findOne(teacherId);

    const assignment = await this.prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Subject assignment not found');
    }

    return this.prisma.teacherSubject.delete({
      where: { id: assignment.id },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.teacher.delete({
      where: { id },
    });
  }
}