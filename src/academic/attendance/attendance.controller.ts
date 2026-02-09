import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import {
  GetAttendanceQueryDto,
  GetAttendanceSummaryQueryDto,
} from './dto/attendance-query.dto';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Get teacher's classes
  @Get('my-classes')
  async getMyClasses(@Request() req) {
    return this.attendanceService.getTeacherClasses(req.user.teacherId);
  }

  // Get students in a class with attendance
  @Get('class/:gradeClassId/subject/:subjectId/students')
  async getClassStudents(
    @Request() req,
    @Param('gradeClassId', ParseIntPipe) gradeClassId: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Query() query: GetAttendanceQueryDto,
  ) {
    return this.attendanceService.getClassStudents(
      req.user.teacherId,
      gradeClassId,
      subjectId,
      query.date,
    );
  }

  // Submit attendance
  @Post('class/:gradeClassId/subject/:subjectId/submit')
  async submitAttendance(
    @Request() req,
    @Param('gradeClassId', ParseIntPipe) gradeClassId: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Body() dto: SubmitAttendanceDto,
  ) {

      console.log('=== DEBUG req.user ===');
  console.log(req.user); // Cek apakah teacherId ada
  console.log('======================');
  
  if (!req.user.teacherId) {
    throw new BadRequestException('Teacher ID not found in token. Please login again.');
  }

    return this.attendanceService.submitAttendance(
      req.user.teacherId,
      gradeClassId,
      subjectId,
      dto.attendances,
      dto.date,
    );
  }

  // Get attendance summary
  @Get('class/:gradeClassId/subject/:subjectId/summary')
  async getAttendanceSummary(
    @Request() req,
    @Param('gradeClassId', ParseIntPipe) gradeClassId: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Query() query: GetAttendanceSummaryQueryDto,
  ) {
    return this.attendanceService.getClassAttendanceSummary(
      req.user.teacherId,
      gradeClassId,
      subjectId,
      query.startDate,
      query.endDate,
    );
  }

  // Get teacher statistics
  @Get('stats')
  async getStats(@Request() req, @Query() query: GetAttendanceQueryDto) {
    return this.attendanceService.getTeacherStats(
      req.user.teacherId,
      query.date,
    );
  }
}