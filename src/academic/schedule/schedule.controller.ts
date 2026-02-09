import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
  GenerateTimetableDto,
} from './dto/generate-timetable.dto';
import {
  CreateSchoolTimeConfigDto,
  UpdateSchoolTimeConfigDto,
} from './dto/school-time-config.dto';
import {
  CreateSubjectHoursDto,
  UpdateSubjectHoursDto,
} from './dto/subject-hours.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // ============================================
  // SCHOOL TIME CONFIGURATION ENDPOINTS
  // ============================================

  @Post('config')
  @HttpCode(HttpStatus.CREATED)
  async createSchoolTimeConfig(@Body() dto: CreateSchoolTimeConfigDto) {
    return this.scheduleService.createSchoolTimeConfig(dto);
  }

  @Get('config/:academicYear')
  async getSchoolTimeConfig(@Param('academicYear') academicYear: string) {
    return this.scheduleService.getSchoolTimeConfig(academicYear);
  }

  @Put('config/:academicYear')
  async updateSchoolTimeConfig(
    @Param('academicYear') academicYear: string,
    @Body() dto: UpdateSchoolTimeConfigDto,
  ) {
    return this.scheduleService.updateSchoolTimeConfig(academicYear, dto);
  }

  @Get('config')
  async getAllSchoolTimeConfigs() {
    return this.scheduleService.getAllSchoolTimeConfigs();
  }

  // ============================================
  // SUBJECT HOURS CONFIGURATION ENDPOINTS
  // ============================================

  @Post('subject-hours')
  @HttpCode(HttpStatus.CREATED)
  async createSubjectHours(@Body() dto: CreateSubjectHoursDto) {
    return this.scheduleService.createSubjectHours(dto);
  }

  @Get('subject-hours/:subjectId/:gradeClassId')
  async getSubjectHours(
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Param('gradeClassId', ParseIntPipe) gradeClassId: number,
  ) {
    return this.scheduleService.getSubjectHours(subjectId, gradeClassId);
  }

  @Put('subject-hours/:subjectId/:gradeClassId')
  async updateSubjectHours(
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Param('gradeClassId', ParseIntPipe) gradeClassId: number,
    @Body() dto: UpdateSubjectHoursDto,
  ) {
    return this.scheduleService.updateSubjectHours(subjectId, gradeClassId, dto);
  }

  @Get('subject-hours/class/:gradeClassId')
  async getSubjectHoursByClass(
    @Param('gradeClassId', ParseIntPipe) gradeClassId: number,
  ) {
    return this.scheduleService.getSubjectHoursByClass(gradeClassId);
  }

  // ============================================
  // TIMETABLE GENERATION ENDPOINTS
  // ============================================

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateTimetable(@Body() dto: GenerateTimetableDto) {
    return this.scheduleService.generateTimetable(dto);
  }

  @Get('timetable/:gradeClassId')
  async getTimetable(@Param('gradeClassId', ParseIntPipe) gradeClassId: number) {
    return this.scheduleService.getTimetable(gradeClassId);
  }

  @Delete('timetable/:gradeClassId')
  @HttpCode(HttpStatus.OK)
  async clearTimetable(@Param('gradeClassId', ParseIntPipe) gradeClassId: number) {
    return this.scheduleService.clearTimetable(gradeClassId);
  }

  // ============================================
  // TEACHER PREFERENCE ENDPOINTS
  // ============================================

  @Get('teacher-preference/:teacherId')
  async getTeacherPreference(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.scheduleService.getTeacherPreference(teacherId);
  }

  @Put('teacher-preference/:teacherId')
  async updateTeacherPreference(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Body()
    data: {
      timePreference?: string;
      maxHoursPerDay?: number;
      maxHoursPerWeek?: number;
      unavailableDays?: number[];
    },
  ) {
    return this.scheduleService.updateTeacherPreference(teacherId, data);
  }
}