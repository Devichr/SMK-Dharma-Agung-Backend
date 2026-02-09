import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { 
  GenerateTimetableDto, 
  SubjectConfigDto 
} from './dto/generate-timetable.dto';
import { 
  CreateSchoolTimeConfigDto, 
  UpdateSchoolTimeConfigDto,
  BreakTimeDto 
} from './dto/school-time-config.dto';
import { 
  CreateSubjectHoursDto, 
  UpdateSubjectHoursDto 
} from './dto/subject-hours.dto';

import {Prisma} from '@prisma/client';

interface TimeSlot {
  period: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakDuration?: number;
}

interface TeacherAvailability {
  teacherId: number;
  teacherName: string;
  subjectId: number;
  timePreference: string;
  maxHoursPerDay: number;
  unavailableDays: number[];
  currentHours: Map<number, number>; // day -> hours
  totalHours: number;
}

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // SCHOOL TIME CONFIGURATION
  // ============================================

  async createSchoolTimeConfig(dto: CreateSchoolTimeConfigDto) {
    const existing = await this.prisma.schoolTimeConfig.findUnique({
      where: { academicYear: dto.academicYear },
    });

    if (existing) {
      throw new BadRequestException(
        `School time configuration for ${dto.academicYear} already exists`
      );
    }

    return this.prisma.schoolTimeConfig.create({
      data: {
        academicYear: dto.academicYear,
        schoolStartTime: dto.schoolStartTime,
        schoolEndTime: dto.schoolEndTime,
        periodDuration: dto.periodDuration,
        breakDuration: dto.breakDuration,
        maxPeriodsPerDay: dto.maxPeriodsPerDay,
        breakTimes: dto.breakTimes as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async getSchoolTimeConfig(academicYear: string) {
    let config = await this.prisma.schoolTimeConfig.findUnique({
      where: { academicYear },
    });

    // Auto-create default config if not found
    if (!config) {
      console.log(`Creating default config for ${academicYear}`);
      config = await this.prisma.schoolTimeConfig.create({
        data: {
          academicYear,
          schoolStartTime: '07:30',
          schoolEndTime: '16:00',
          periodDuration: 90,
          breakDuration: 15,
          maxPeriodsPerDay: 8,
          breakTimes: [
            { afterPeriod: 2, duration: 20 },
            { afterPeriod: 5, duration: 30 },
          ] as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return config;
  }

  async updateSchoolTimeConfig(
    academicYear: string,
    dto: UpdateSchoolTimeConfigDto
  ) {
    await this.getSchoolTimeConfig(academicYear);

    const updateData: Prisma.SchoolTimeConfigUpdateInput = {
      ...(dto.schoolStartTime && { schoolStartTime: dto.schoolStartTime }),
      ...(dto.schoolEndTime && { schoolEndTime: dto.schoolEndTime }),
      ...(dto.periodDuration !== undefined && { periodDuration: dto.periodDuration }),
      ...(dto.breakDuration !== undefined && { breakDuration: dto.breakDuration }),
      ...(dto.maxPeriodsPerDay !== undefined && { maxPeriodsPerDay: dto.maxPeriodsPerDay }),
      ...(dto.breakTimes && { breakTimes: dto.breakTimes as unknown as Prisma.InputJsonValue }),
    };

    return this.prisma.schoolTimeConfig.update({
      where: { academicYear },
      data: updateData,
    });
  }

  async getAllSchoolTimeConfigs() {
    return this.prisma.schoolTimeConfig.findMany({
      orderBy: { academicYear: 'desc' },
    });
  }

  // ============================================
  // TIME SLOT GENERATION
  // ============================================

  private generateTimeSlots(config: any): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = config.schoolStartTime.split(':').map(Number);
    const [endHour, endMinute] = config.schoolEndTime.split(':').map(Number);

    const breakTimes = config.breakTimes as BreakTimeDto[];
    const breakMap = new Map<number, number>();

    for (const breakTime of breakTimes) {
      breakMap.set(breakTime.afterPeriod, breakTime.duration);
    }

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    let period = 1;

    while (currentMinutes < endMinutes && period <= config.maxPeriodsPerDay) {
      const periodStart = currentMinutes;
      const periodEnd = currentMinutes + config.periodDuration;

      if (periodEnd > endMinutes) break;

      slots.push({
        period,
        startTime: this.minutesToTime(periodStart),
        endTime: this.minutesToTime(periodEnd),
        isBreak: false,
      });

      currentMinutes = periodEnd;

      const breakDuration = breakMap.get(period);
      if (breakDuration) {
        const breakEnd = currentMinutes + breakDuration;
        if (breakEnd <= endMinutes) {
          currentMinutes = breakEnd;
        }
      } else {
        currentMinutes += config.breakDuration;
      }

      period++;
    }

    return slots;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // ============================================
  // CONSTRAINT CHECKING
  // ============================================

  private isTeacherAvailable(
    teacher: TeacherAvailability,
    day: number,
    period: number,
    timeSlot: TimeSlot
  ): boolean {
    if (teacher.unavailableDays.includes(day)) {
      return false;
    }

    const currentHours = teacher.currentHours.get(day) || 0;
    if (currentHours >= teacher.maxHoursPerDay) {
      return false;
    }

    if (teacher.timePreference !== 'ANY') {
      const [hour] = timeSlot.startTime.split(':').map(Number);

      switch (teacher.timePreference) {
        case 'MORNING':
          if (hour < 7 || hour >= 10) return false;
          break;
        case 'MIDDAY':
          if (hour < 10 || hour >= 13) return false;
          break;
        case 'AFTERNOON':
          if (hour < 13 || hour >= 16) return false;
          break;
      }
    }

    return true;
  }

  // ============================================
  // IMPROVED TIMETABLE GENERATION ALGORITHM
  // ============================================

  async generateTimetable(dto: GenerateTimetableDto) {
    const { gradeClassId, subjects, academicYear, daysPerWeek = [1, 2, 3, 4, 5, 6] } = dto;

    // Get or create school time configuration
    const config = await this.getSchoolTimeConfig(academicYear);

    // Validate grade class
    const gradeClass = await this.prisma.gradeClass.findUnique({
      where: { id: gradeClassId },
    });

    if (!gradeClass) {
      throw new NotFoundException(`Grade class with id ${gradeClassId} not found`);
    }

    // Get subject details with teachers
    const subjectIds = subjects.map(s => s.subjectId);
    const subjectDetails = await this.prisma.subject.findMany({
      where: {
        id: { in: subjectIds },
        gradeLevel: gradeClass.gradeLevel,
      },
      include: {
        teacherSubjects: {
          include: {
            teacher: {
              include: {
                preference: true,
              },
            },
          },
        },
      },
    });

    // Validate all subjects have teachers
    const subjectsWithoutTeachers: string[] = [];
    for (const subject of subjectDetails) {
      if (subject.teacherSubjects.length === 0) {
        subjectsWithoutTeachers.push(subject.name);
      }
    }

    if (subjectsWithoutTeachers.length > 0) {
      throw new BadRequestException(
        `The following subjects have no assigned teachers: ${subjectsWithoutTeachers.join(', ')}. Please assign teachers first.`
      );
    }

    // Delete existing schedules
    await this.prisma.schedule.deleteMany({
      where: { gradeClassId },
    });

    // Generate time slots
    const timeSlots = this.generateTimeSlots(config);
    console.log(`Generated ${timeSlots.length} time slots per day`);

    // Prepare teacher availability
    const teacherAvailability = new Map<number, TeacherAvailability[]>();

    for (const subjectDetail of subjectDetails) {
      const teachers: TeacherAvailability[] = [];

      for (const ts of subjectDetail.teacherSubjects) {
        const pref = ts.teacher.preference;
        teachers.push({
          teacherId: ts.teacher.id,
          teacherName: ts.teacher.name,
          subjectId: subjectDetail.id,
          timePreference: pref?.timePreference || 'ANY',
          maxHoursPerDay: pref?.maxHoursPerDay || 8,
          unavailableDays: (pref?.unavailableDays as number[]) || [],
          currentHours: new Map(),
          totalHours: 0,
        });
      }

      // Sort: primary first
      teachers.sort((a, b) => {
        const aPrimary = subjectDetail.teacherSubjects.find(
          ts => ts.teacherId === a.teacherId
        )?.isPrimary;
        const bPrimary = subjectDetail.teacherSubjects.find(
          ts => ts.teacherId === b.teacherId
        )?.isPrimary;
        return aPrimary && !bPrimary ? -1 : !aPrimary && bPrimary ? 1 : 0;
      });

      teacherAvailability.set(subjectDetail.id, teachers);
      console.log(`Subject ${subjectDetail.name} has ${teachers.length} teachers`);
    }

    // ============================================
    // NEW IMPROVED ALGORITHM
    // ============================================
    const schedule: any[] = [];
    const usedSlots = new Set<string>(); // "day-period"
    
    // NEW: Track which subjects are scheduled on which days
    const subjectsPerDay = new Map<number, Set<number>>(); // day -> Set of subjectIds
    daysPerWeek.forEach(day => subjectsPerDay.set(day, new Set()));

    // Create subject-hours map
    const subjectHoursMap = new Map<number, number>();
    const preferredDaysMap = new Map<number, number[]>();

    for (const subject of subjects) {
      subjectHoursMap.set(subject.subjectId, subject.hoursPerWeek);
      if (subject.preferredDays && subject.preferredDays.length > 0) {
        preferredDaysMap.set(subject.subjectId, subject.preferredDays);
      } else {
        preferredDaysMap.set(subject.subjectId, daysPerWeek);
      }
    }

    // Track assigned hours per subject
    const assignedHours = new Map<number, number>();
    subjects.forEach(s => assignedHours.set(s.subjectId, 0));

    // Sort subjects by hours needed (descending) - schedule harder subjects first
    const sortedSubjects = [...subjects].sort((a, b) => b.hoursPerWeek - a.hoursPerWeek);

    // Main scheduling loop - IMPROVED
    console.log('Starting scheduling process...');
    
    for (const subject of sortedSubjects) {
      const needed = subjectHoursMap.get(subject.subjectId) || 0;
      const preferredDays = preferredDaysMap.get(subject.subjectId) || daysPerWeek;
      const teachers = teacherAvailability.get(subject.subjectId) || [];

      if (teachers.length === 0) {
        console.warn(`No teachers available for subject ${subject.subjectId}`);
        continue;
      }

      let assigned = 0;
      const subjectName = subjectDetails.find(s => s.id === subject.subjectId)?.name;

      console.log(`\nScheduling ${subjectName} - needs ${needed} hours`);

      // Try each day
      for (const day of preferredDays) {
        if (assigned >= needed) break;

        // NEW: Check if this subject is already scheduled on this day
        if (subjectsPerDay.get(day)?.has(subject.subjectId)) {
          console.log(`  - Day ${day}: Subject already scheduled, skipping`);
          continue;
        }

        // Try each time slot
        for (const timeSlot of timeSlots) {
          if (assigned >= needed) break;

          const slotKey = `${day}-${timeSlot.period}`;
          if (usedSlots.has(slotKey)) continue;

          // Try to find available teacher
          let teacherAssigned = false;
          for (const teacher of teachers) {
            // Check basic availability
            const currentHours = teacher.currentHours.get(day) || 0;
            
            // Check constraints
            if (teacher.unavailableDays.includes(day)) {
              continue;
            }

            if (currentHours >= teacher.maxHoursPerDay) {
              continue;
            }

            // Check time preference (relaxed)
            if (teacher.timePreference !== 'ANY') {
              const [hour] = timeSlot.startTime.split(':').map(Number);
              let timeMatch = true;

              switch (teacher.timePreference) {
                case 'MORNING':
                  if (hour < 7 || hour >= 10) timeMatch = false;
                  break;
                case 'MIDDAY':
                  if (hour < 10 || hour >= 13) timeMatch = false;
                  break;
                case 'AFTERNOON':
                  if (hour < 13 || hour >= 16) timeMatch = false;
                  break;
              }

              if (!timeMatch) continue;
            }

            // Assign this slot
            schedule.push({
              day,
              period: timeSlot.period,
              startTime: timeSlot.startTime,
              endTime: timeSlot.endTime,
              subjectId: subject.subjectId,
              teacherId: teacher.teacherId,
              gradeClassId,
            });

            usedSlots.add(slotKey);
            assigned++;

            // NEW: Mark this subject as scheduled on this day
            subjectsPerDay.get(day)?.add(subject.subjectId);

            // Update teacher hours
            teacher.currentHours.set(day, currentHours + 1);
            teacher.totalHours++;

            teacherAssigned = true;
            console.log(`  ✓ Day ${day}, Period ${timeSlot.period}: Assigned to ${teacher.teacherName}`);
            
            // After assigning, move to next day for this subject
            break;
          }

          if (teacherAssigned) {
            // Successfully assigned, move to next day
            break;
          }
        }
      }

      assignedHours.set(subject.subjectId, assigned);
      console.log(`  Final: ${assigned}/${needed} hours assigned for ${subjectName}`);
    }

    // Check warnings
    const warnings: string[] = [];
    for (const [subjectId, needed] of subjectHoursMap.entries()) {
      const assigned = assignedHours.get(subjectId) || 0;
      if (assigned < needed) {
        const subjectDetail = subjectDetails.find(s => s.id === subjectId);
        warnings.push(
          `${subjectDetail?.name}: ${assigned}/${needed} hours assigned`
        );
      }
    }

    // Save to database
    if (schedule.length > 0) {
      await this.prisma.schedule.createMany({
        data: schedule,
      });
      console.log(`\n✓ Saved ${schedule.length} schedules to database`);
    } else {
      console.log('\n✗ No schedules were created');
    }

    // Log daily subject distribution
    console.log('\nDaily subject distribution:');
    for (const day of daysPerWeek) {
      const subjectsOnDay = subjectsPerDay.get(day);
      console.log(`  Day ${day}: ${subjectsOnDay?.size || 0} different subjects`);
    }

    return {
      message: `Successfully generated ${schedule.length} schedule slots`,
      gradeClassId,
      scheduleCount: schedule.length,
      totalSlotsAvailable: timeSlots.length * daysPerWeek.length,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // ============================================
  // TIMETABLE RETRIEVAL
  // ============================================

  async getTimetable(gradeClassId: number) {
    const gradeClass = await this.prisma.gradeClass.findUnique({
      where: { id: gradeClassId },
      include: {
        schedules: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: true,
              },
            },
            room: true,
          },
          orderBy: [{ day: 'asc' }, { period: 'asc' }],
        },
      },
    });

    if (!gradeClass) {
      throw new NotFoundException(`Grade class with id ${gradeClassId} not found`);
    }

    // Group by day
    const timetableByDay = new Map<number, any[]>();
    const days = [1, 2, 3, 4, 5, 6];

    for (const day of days) {
      const daySchedules = gradeClass.schedules.filter(s => s.day === day);
      timetableByDay.set(day, daySchedules);
    }

    return {
      gradeClass: {
        id: gradeClass.id,
        name: gradeClass.name,
        gradeLevel: gradeClass.gradeLevel,
        academicYear: gradeClass.academicYear,
      },
      timetable: Array.from(timetableByDay.entries()).map(([day, schedules]) => ({
        day,
        dayName: this.getDayName(day),
        schedules,
      })),
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private getDayName(day: number): string {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || '';
  }

  async clearTimetable(gradeClassId: number) {
    const deleted = await this.prisma.schedule.deleteMany({
      where: { gradeClassId },
    });

    return {
      message: `Deleted ${deleted.count} schedules`,
      count: deleted.count,
    };
  }

  async getTeacherPreference(teacherId: number) {
    return this.prisma.teacherPreference.findUnique({
      where: { teacherId },
    });
  }

  async updateTeacherPreference(
    teacherId: number,
    data: {
      timePreference?: string;
      maxHoursPerDay?: number;
      maxHoursPerWeek?: number;
      unavailableDays?: number[];
    }
  ) {
    const createData: Prisma.TeacherPreferenceCreateInput = {
      teacher: { connect: { id: teacherId } },
      ...(data.timePreference && { timePreference: data.timePreference as any }),
      ...(data.maxHoursPerDay !== undefined && { maxHoursPerDay: data.maxHoursPerDay }),
      ...(data.maxHoursPerWeek !== undefined && { maxHoursPerWeek: data.maxHoursPerWeek }),
      ...(data.unavailableDays && { unavailableDays: data.unavailableDays as unknown as Prisma.InputJsonValue }),
    };

    const updateData: Prisma.TeacherPreferenceUpdateInput = {
      ...(data.timePreference && { timePreference: data.timePreference as any }),
      ...(data.maxHoursPerDay !== undefined && { maxHoursPerDay: data.maxHoursPerDay }),
      ...(data.maxHoursPerWeek !== undefined && { maxHoursPerWeek: data.maxHoursPerWeek }),
      ...(data.unavailableDays && { unavailableDays: data.unavailableDays as unknown as Prisma.InputJsonValue }),
    };

    return this.prisma.teacherPreference.upsert({
      where: { teacherId },
      create: createData,
      update: updateData,
    });
  }

  // ============================================
  // SUBJECT HOURS CONFIGURATION (UNCHANGED)
  // ============================================

  async createSubjectHours(dto: CreateSubjectHoursDto) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${dto.subjectId} not found`);
    }

    const gradeClass = await this.prisma.gradeClass.findUnique({
      where: { id: dto.gradeClassId },
    });

    if (!gradeClass) {
      throw new NotFoundException(
        `Grade class with id ${dto.gradeClassId} not found`
      );
    }

    if (subject.gradeLevel !== gradeClass.gradeLevel) {
      throw new BadRequestException(
        `Subject grade level does not match class grade level`
      );
    }

    return this.prisma.subjectHours.create({
      data: {
        subjectId: dto.subjectId,
        gradeClassId: dto.gradeClassId,
        hoursPerWeek: dto.hoursPerWeek,
        preferredDays: dto.preferredDays || [],
      },
      include: {
        subject: true,
        gradeClass: true,
      },
    });
  }

  async getSubjectHours(subjectId: number, gradeClassId: number) {
    return this.prisma.subjectHours.findUnique({
      where: {
        subjectId_gradeClassId: {
          subjectId,
          gradeClassId,
        },
      },
      include: {
        subject: true,
        gradeClass: true,
      },
    });
  }

  async updateSubjectHours(
    subjectId: number,
    gradeClassId: number,
    dto: UpdateSubjectHoursDto
  ) {
    return this.prisma.subjectHours.update({
      where: {
        subjectId_gradeClassId: {
          subjectId,
          gradeClassId,
        },
      },
      data: dto,
    });
  }

  async getSubjectHoursByClass(gradeClassId: number) {
    return this.prisma.subjectHours.findMany({
      where: { gradeClassId },
      include: {
        subject: true,
      },
      orderBy: { hoursPerWeek: 'desc' },
    });
  }
}