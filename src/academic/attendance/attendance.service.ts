import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AttendanceStatus } from './dto/submit-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // Get teacher's classes
  async getTeacherClasses(teacherId: number) {
    const teacherSubjects = await this.prisma.teacherSubject.findMany({
      where: { teacherId },
      include: {
        subject: {
          include: {
            schedules: {
              include: {
                gradeClass: {
                  include: {
                    _count: {
                      select: { students: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teacherSubjects || teacherSubjects.length === 0) {
      return [];
    }

    // Aggregate unique classes (menghindari duplikasi)
    const classesMap = new Map();

    teacherSubjects.forEach((ts) => {
      ts.subject.schedules.forEach((schedule) => {
        const key = `${schedule.gradeClass.id}-${ts.subject.id}`;
        
        if (!classesMap.has(key)) {
          classesMap.set(key, {
            id: schedule.gradeClass.id,
            name: schedule.gradeClass.name,
            gradeLevel: schedule.gradeClass.gradeLevel,
            academicYear: schedule.gradeClass.academicYear,
            studentCount: schedule.gradeClass._count.students,
            subject: {
              id: ts.subject.id,
              name: ts.subject.name,
              code: ts.subject.code,
            },
          });
        }
      });
    });

    return Array.from(classesMap.values());
  }

  // Get students with today's attendance
  async getClassStudents(
    teacherId: number,
    gradeClassId: number,
    subjectId: number,
    date?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Verify teacher teaches this class/subject
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        gradeClassId,
        subjectId,
        subject: {
          teacherSubjects: {
            some: {
              teacherId,
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new BadRequestException(
        'Teacher does not teach this subject in this class',
      );
    }

    const gradeClass = await this.prisma.gradeClass.findUnique({
      where: { id: gradeClassId },
      include: {
        students: {
          include: {
            attendances: {
              where: {
                date: {
                  gte: targetDate,
                  lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
                },
                subjectId,
                teacherId,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!gradeClass) {
      throw new NotFoundException('Class not found');
    }

    return {
      gradeClass: {
        id: gradeClass.id,
        name: gradeClass.name,
        gradeLevel: gradeClass.gradeLevel,
      },
      date: targetDate,
      students: gradeClass.students.map((student) => ({
        id: student.id,
        name: student.name,
        nisn: student.nisn,
        status: student.attendances[0]?.status || null,
        notes: student.attendances[0]?.notes || null,
        attendanceId: student.attendances[0]?.id || null,
      })),
    };
  }

  // Submit attendance
  async submitAttendance(
    teacherId: number,
    gradeClassId: number,
    subjectId: number,
    attendances: Array<{
      studentId: number;
      status: AttendanceStatus;
      notes?: string;
    }>,
    date?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Verify teacher teaches this class/subject
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        gradeClassId,
        subjectId,
        subject: {
          teacherSubjects: {
            some: {
              teacherId,
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new BadRequestException(
        'Teacher does not teach this subject in this class',
      );
    }

    // Upsert attendances
    const results = await Promise.all(
      attendances.map((attendance) =>
        this.prisma.attendance.upsert({
          where: {
            studentId_date_subjectId: {
              studentId: attendance.studentId,
              date: targetDate,
              subjectId,
            },
          },
          create: {
            studentId: attendance.studentId,
            teacherId,
            subjectId,
            gradeClassId,
            date: targetDate,
            status: attendance.status,
            notes: attendance.notes,
          },
          update: {
            status: attendance.status,
            notes: attendance.notes,
          },
        }),
      ),
    );

    return {
      message: 'Attendance submitted successfully',
      count: results.length,
      date: targetDate,
    };
  }

  // Get attendance summary
  async getClassAttendanceSummary(
    teacherId: number,
    gradeClassId: number,
    subjectId: number,
    startDate?: string,
    endDate?: string,
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        teacherId,
        gradeClassId,
        subjectId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nisn: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { student: { name: 'asc' } }],
    });

    // Group by student
    const studentMap = new Map();

    attendances.forEach((att) => {
      if (!studentMap.has(att.studentId)) {
        studentMap.set(att.studentId, {
          student: att.student,
          attendances: [],
          summary: {
            hadir: 0,
            sakit: 0,
            izin: 0,
            alpha: 0,
            total: 0,
          },
        });
      }

      const studentData = studentMap.get(att.studentId);
      studentData.attendances.push({
        date: att.date,
        status: att.status,
        notes: att.notes,
      });

      studentData.summary.total++;
      studentData.summary[att.status.toLowerCase()]++;
    });

    return {
      period: { start, end },
      students: Array.from(studentMap.values()),
    };
  }

  // Get teacher statistics
  async getTeacherStats(teacherId: number, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    const [totalClasses, todayAttendances, monthAttendances] =
      await Promise.all([
        this.getTeacherClasses(teacherId),
        this.prisma.attendance.count({
          where: {
            teacherId,
            date: {
              gte: targetDate,
              lt: endDate,
            },
          },
        }),
        this.prisma.attendance.groupBy({
          by: ['status'],
          where: {
            teacherId,
            date: {
              gte: new Date(
                targetDate.getFullYear(),
                targetDate.getMonth(),
                1,
              ),
              lt: new Date(
                targetDate.getFullYear(),
                targetDate.getMonth() + 1,
                1,
              ),
            },
          },
          _count: {
            status: true,
          },
        }),
      ]);

    const stats = {
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
    };

    monthAttendances.forEach((item) => {
      const statusKey = item.status.toLowerCase();
      if (statusKey in stats) {
        stats[statusKey] = item._count.status;
      }
    });

    return {
      totalClasses: totalClasses.length,
      todayAttendances,
      monthStats: stats,
      totalMonthAttendances: Object.values(stats).reduce((a, b) => a + b, 0),
    };
  }
}