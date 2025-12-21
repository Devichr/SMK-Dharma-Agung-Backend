import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { AssignTeachersDto } from './dto/assign-teachers.dto';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubjectDto) {
    // Cek apakah code + gradeLevel sudah ada
    const existing = await this.prisma.subject.findFirst({
      where: { 
        code: dto.code,
        gradeLevel: dto.gradeLevel,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Subject with code ${dto.code} for ${dto.gradeLevel} already exists`
      );
    }

    return this.prisma.subject.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        category: dto.category,
        gradeLevel: dto.gradeLevel,
      },
      include: {
        teacherSubjects: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            schedules: true,
            teacherSubjects: true,
          },
        },
      },
    });
  }

  async findAll(search?: string, category?: string, gradeLevel?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }

    return this.prisma.subject.findMany({
      where,
      orderBy: [
        { gradeLevel: 'asc' },
        { name: 'asc' },
      ],
      include: {
        teacherSubjects: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            schedules: true,
            teacherSubjects: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        teacherSubjects: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
        schedules: {
          include: {
            gradeClass: true,
            teacher: true,
            room: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            teacherSubjects: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    return subject;
  }

  async update(id: number, dto: UpdateSubjectDto) {
    await this.findOne(id);

    // Jika code atau gradeLevel diubah, cek uniqueness
    if (dto.code || dto.gradeLevel) {
      const current = await this.prisma.subject.findUnique({
        where: { id },
      });

      const codeToCheck = dto.code || current!.code;
      const gradeLevelToCheck = dto.gradeLevel || current!.gradeLevel;

      const existing = await this.prisma.subject.findFirst({
        where: {
          code: codeToCheck,
          gradeLevel: gradeLevelToCheck,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Subject with code ${codeToCheck} for ${gradeLevelToCheck} already exists`
        );
      }
    }

    return this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        category: dto.category,
        gradeLevel: dto.gradeLevel,
      },
      include: {
        teacherSubjects: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            schedules: true,
            teacherSubjects: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Cek apakah subject masih digunakan di schedule
    const scheduleCount = await this.prisma.schedule.count({
      where: { subjectId: id },
    });

    if (scheduleCount > 0) {
      throw new BadRequestException(
        `Cannot delete subject. It is still used in ${scheduleCount} schedule(s)`
      );
    }

    return this.prisma.subject.delete({
      where: { id },
    });
  }

  // ============================================
  // ASSIGN TEACHERS
  // ============================================

  async assignTeachers(subjectId: number, dto: AssignTeachersDto) {
    // Validasi subject exists
    await this.findOne(subjectId);

    // Validasi semua teachers exist
    const teacherIds = dto.teachers.map(t => t.teacherId);
    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: teacherIds } },
    });

    if (teachers.length !== teacherIds.length) {
      throw new BadRequestException('One or more teachers not found');
    }

    // Validasi hanya ada 1 primary teacher
    const primaryCount = dto.teachers.filter(t => t.isPrimary).length;
    if (primaryCount > 1) {
      throw new BadRequestException('Only one teacher can be primary');
    }

    // Hapus semua assignment yang ada untuk subject ini
    await this.prisma.teacherSubject.deleteMany({
      where: { subjectId },
    });

    // Buat assignment baru
    const assignments = await Promise.all(
      dto.teachers.map(t =>
        this.prisma.teacherSubject.create({
          data: {
            teacherId: t.teacherId,
            subjectId,
            isPrimary: t.isPrimary || false,
          },
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        })
      )
    );

    return {
      subjectId,
      teachers: assignments,
    };
  }

  async addTeacher(subjectId: number, teacherId: number, isPrimary: boolean = false) {
    // Validasi subject exists
    await this.findOne(subjectId);

    // Validasi teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${teacherId} not found`);
    }

    // Cek apakah sudah di-assign
    const existing = await this.prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId,
      },
    });

    if (existing) {
      throw new ConflictException('Teacher already assigned to this subject');
    }

    // Jika isPrimary true, set yang lain jadi false
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
        teacher: {
          include: {
            user: true,
          },
        },
        subject: true,
      },
    });
  }

  async removeTeacher(subjectId: number, teacherId: number) {
    // Validasi subject exists
    await this.findOne(subjectId);

    const assignment = await this.prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Teacher assignment not found');
    }

    return this.prisma.teacherSubject.delete({
      where: { id: assignment.id },
    });
  }

  async setPrimaryTeacher(subjectId: number, teacherId: number) {
    // Validasi subject exists
    await this.findOne(subjectId);

    // Validasi assignment exists
    const assignment = await this.prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Teacher is not assigned to this subject');
    }

    // Set semua jadi false dulu
    await this.prisma.teacherSubject.updateMany({
      where: { subjectId },
      data: { isPrimary: false },
    });

    // Set yang dipilih jadi true
    return this.prisma.teacherSubject.update({
      where: { id: assignment.id },
      data: { isPrimary: true },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        subject: true,
      },
    });
  }

  async getTeachersBySubject(subjectId: number) {
    await this.findOne(subjectId);

    return this.prisma.teacherSubject.findMany({
      where: { subjectId },
      include: {
        teacher: {
          include: {
            user: true,
            gradeClasses: true,
          },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { teacher: { name: 'asc' } },
      ],
    });
  }

  // Get categories for filter
  async getCategories() {
    const subjects = await this.prisma.subject.findMany({
      where: {
        category: { not: null },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return subjects.map(s => s.category).filter(Boolean);
  }
}