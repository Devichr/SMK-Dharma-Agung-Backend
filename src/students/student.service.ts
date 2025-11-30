import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async createStudent(data: {
    name: string;
    nisn: string;
    phone: string;
    address: string;
    birthDate: Date;
    schoolOrigin: string;
    userId?: number | null;
    enrollmentYear?: number; // Tahun masuk
    gradeClassId?: number | null; // Kelas
  }) {
    // Jika enrollmentYear tidak diberikan, gunakan tahun saat ini
    const enrollmentYear = data.enrollmentYear || new Date().getFullYear();

    return this.prisma.student.create({
      data: {
        name: data.name,
        nisn: data.nisn,
        phone: data.phone,
        address: data.address,
        birthDate: data.birthDate,
        schoolOrigin: data.schoolOrigin,
        enrollmentYear: enrollmentYear,
        userId: data.userId || null,
        gradeClassId: data.gradeClassId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        gradeClass: {
          include: {
            classroom: true,
            homeroom: {
              select: {
                id: true,
                name: true,
                nip: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(filter?: {
    gradeClassId?: number;
    enrollmentYear?: number;
    search?: string;
  }) {
    const where: any = {};

    if (filter?.gradeClassId) {
      where.gradeClassId = filter.gradeClassId;
    }

    if (filter?.enrollmentYear) {
      where.enrollmentYear = filter.enrollmentYear;
    }

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { nisn: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.student.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        gradeClass: {
          include: {
            classroom: true,
            homeroom: {
              select: {
                id: true,
                name: true,
                nip: true,
              },
            },
          },
        },
      },
      orderBy: [
        { gradeClass: { gradeLevel: 'asc' } },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        gradeClass: {
          include: {
            classroom: true,
            homeroom: {
              select: {
                id: true,
                name: true,
                nip: true,
              },
            },
          },
        },
        attendances: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
            schedule: {
              select: {
                id: true,
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async findByNisn(nisn: string) {
    const student = await this.prisma.student.findUnique({
      where: { nisn },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        gradeClass: {
          include: {
            classroom: true,
            homeroom: {
              select: {
                id: true,
                name: true,
                nip: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with NISN ${nisn} not found`);
    }

    return student;
  }

  async update(
    id: number,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      birthDate?: Date;
      schoolOrigin?: string;
      enrollmentYear?: number;
      gradeClassId?: number | null;
    },
  ) {
    // Check if student exists
    await this.findOne(id);

    return this.prisma.student.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        gradeClass: {
          include: {
            classroom: true,
            homeroom: {
              select: {
                id: true,
                name: true,
                nip: true,
              },
            },
          },
        },
      },
    });
  }

  async assignToClass(studentId: number, gradeClassId: number) {
    // Verify student exists
    await this.findOne(studentId);

    // Verify grade class exists
    const gradeClass = await this.prisma.gradeClass.findUnique({
      where: { id: gradeClassId },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!gradeClass) {
      throw new NotFoundException(`Grade class with ID ${gradeClassId} not found`);
    }

    // Check capacity
    if (gradeClass._count.students >= gradeClass.capacity) {
      throw new Error(`Grade class ${gradeClass.name} is full (capacity: ${gradeClass.capacity})`);
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: { gradeClassId },
      include: {
        gradeClass: {
          include: {
            classroom: true,
            homeroom: {
              select: {
                id: true,
                name: true,
                nip: true,
              },
            },
          },
        },
      },
    });
  }

  async removeFromClass(studentId: number) {
    await this.findOne(studentId);

    return this.prisma.student.update({
      where: { id: studentId },
      data: { gradeClassId: null },
    });
  }

  async delete(id: number) {
    await this.findOne(id);

    return this.prisma.student.delete({
      where: { id },
    });
  }

  async getStudentStats() {
    const [total, byGrade, byYear] = await Promise.all([
      // Total students
      this.prisma.student.count(),

      // Students by grade level
      this.prisma.gradeClass.findMany({
        select: {
          gradeLevel: true,
          _count: {
            select: { students: true },
          },
        },
      }),

      // Students by enrollment year
      this.prisma.student.groupBy({
        by: ['enrollmentYear'],
        _count: true,
        orderBy: {
          enrollmentYear: 'desc',
        },
      }),
    ]);

    return {
      total,
      byGrade,
      byYear,
    };
  }
}