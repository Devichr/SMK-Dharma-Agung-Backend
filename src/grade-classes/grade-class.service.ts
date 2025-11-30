import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GradeLevel } from '@prisma/client';

@Injectable()
export class GradeClassService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    gradeLevel: GradeLevel;
    academicYear: string;
    capacity?: number;
    homeroomId?: number;
    classroomId?: number;
  }) {
    // Check if class name already exists for this academic year
    const existing = await this.prisma.gradeClass.findFirst({
      where: {
        name: data.name,
        academicYear: data.academicYear,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Class ${data.name} already exists for academic year ${data.academicYear}`,
      );
    }

    // Verify homeroom teacher exists if provided
    if (data.homeroomId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: data.homeroomId },
      });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher with ID ${data.homeroomId} not found`,
        );
      }
    }

    // Verify classroom exists if provided
    if (data.classroomId) {
      const classroom = await this.prisma.mapRoom.findUnique({
        where: { id: data.classroomId },
      });
      if (!classroom) {
        throw new NotFoundException(
          `Classroom with ID ${data.classroomId} not found`,
        );
      }
    }

    return this.prisma.gradeClass.create({
      data: {
        name: data.name,
        gradeLevel: data.gradeLevel,
        academicYear: data.academicYear,
        capacity: data.capacity || 30,
        homeroomId: data.homeroomId || null,
        classroomId: data.classroomId || null,
      },
      include: {
        homeroom: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
        classroom: {
          select: {
            id: true,
            name: true,
            roomId: true,
            capacity: true,
          },
        },
        _count: {
          select: { students: true },
        },
      },
    });
  }

  async findAll(filter?: {
    gradeLevel?: GradeLevel;
    academicYear?: string;
  }) {
    const where: any = {};

    if (filter?.gradeLevel) {
      where.gradeLevel = filter.gradeLevel;
    }

    if (filter?.academicYear) {
      where.academicYear = filter.academicYear;
    }

    return this.prisma.gradeClass.findMany({
      where,
      include: {
        homeroom: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
        classroom: {
          select: {
            id: true,
            name: true,
            roomId: true,
            capacity: true,
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
      orderBy: [
        { academicYear: 'desc' },
        { gradeLevel: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const gradeClass = await this.prisma.gradeClass.findUnique({
      where: { id },
      include: {
        homeroom: {
          select: {
            id: true,
            name: true,
            nip: true,
            phone: true,
          },
        },
        classroom: {
          select: {
            id: true,
            name: true,
            roomId: true,
            type: true,
            capacity: true,
            floor: true,
            building: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            nisn: true,
            phone: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
        schedules: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [{ day: 'asc' }, { period: 'asc' }],
        },
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
    });

    if (!gradeClass) {
      throw new NotFoundException(`Grade class with ID ${id} not found`);
    }

    return gradeClass;
  }

  async update(
    id: number,
    data: {
      name?: string;
      gradeLevel?: GradeLevel;
      academicYear?: string;
      capacity?: number;
      homeroomId?: number | null;
      classroomId?: number | null;
    },
  ) {
    // Check if grade class exists
    await this.findOne(id);

    // If changing name or academic year, check for conflicts
    if (data.name || data.academicYear) {
      const current = await this.prisma.gradeClass.findUnique({
        where: { id },
      });

      const nameToCheck = data.name || current!.name;
      const yearToCheck = data.academicYear || current!.academicYear;

      const existing = await this.prisma.gradeClass.findFirst({
        where: {
          name: nameToCheck,
          academicYear: yearToCheck,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Class ${nameToCheck} already exists for academic year ${yearToCheck}`,
        );
      }
    }

    // Verify homeroom teacher exists if provided
    if (data.homeroomId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: data.homeroomId },
      });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher with ID ${data.homeroomId} not found`,
        );
      }
    }

    // Verify classroom exists if provided
    if (data.classroomId) {
      const classroom = await this.prisma.mapRoom.findUnique({
        where: { id: data.classroomId },
      });
      if (!classroom) {
        throw new NotFoundException(
          `Classroom with ID ${data.classroomId} not found`,
        );
      }
    }

    return this.prisma.gradeClass.update({
      where: { id },
      data,
      include: {
        homeroom: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
        classroom: {
          select: {
            id: true,
            name: true,
            roomId: true,
            capacity: true,
          },
        },
        _count: {
          select: { students: true },
        },
      },
    });
  }

  async delete(id: number) {
    const gradeClass = await this.findOne(id);

    // Check if there are students in this class
    if (gradeClass._count.students > 0) {
      throw new BadRequestException(
        `Cannot delete class ${gradeClass.name} because it has ${gradeClass._count.students} student(s). Please move or remove the students first.`,
      );
    }

    return this.prisma.gradeClass.delete({
      where: { id },
    });
  }

  async getClassStats(id: number) {
    const gradeClass = await this.findOne(id);

    const studentStats = await this.prisma.student.groupBy({
      by: ['enrollmentYear'],
      where: { gradeClassId: id },
      _count: true,
    });

    return {
      ...gradeClass,
      studentStats,
    };
  }

  async getAcademicYears() {
    const years = await this.prisma.gradeClass.findMany({
      distinct: ['academicYear'],
      select: { academicYear: true },
      orderBy: { academicYear: 'desc' },
    });

    return years.map((y) => y.academicYear);
  }
}