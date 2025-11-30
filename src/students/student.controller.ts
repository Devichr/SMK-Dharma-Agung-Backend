import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentService } from './student.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  AssignClassDto,
  FilterStudentDto,
} from './dto/student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({
    status: 201,
    description: 'Student has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.createStudent({
      ...createStudentDto,
      birthDate: new Date(createStudentDto.birthDate),
      userId: createStudentDto.userId || null,
      gradeClassId: createStudentDto.gradeClassId || null,
    });
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all students with optional filters' })
  @ApiQuery({
    name: 'gradeClassId',
    required: false,
    type: Number,
    description: 'Filter by grade class ID',
  })
  @ApiQuery({
    name: 'enrollmentYear',
    required: false,
    type: Number,
    description: 'Filter by enrollment year',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or NISN',
  })
  @ApiResponse({ status: 200, description: 'Return all students.' })
  async findAll(@Query() filter: FilterStudentDto) {
    return this.studentService.findAll({
      gradeClassId: filter.gradeClassId
        ? parseInt(filter.gradeClassId.toString())
        : undefined,
      enrollmentYear: filter.enrollmentYear
        ? parseInt(filter.enrollmentYear.toString())
        : undefined,
      search: filter.search,
    });
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get student statistics' })
  @ApiResponse({ status: 200, description: 'Return student statistics.' })
  async getStats() {
    return this.studentService.getStudentStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return the student.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Get('nisn/:nisn')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get a student by NISN' })
  @ApiParam({ name: 'nisn', type: String, description: 'Student NISN' })
  @ApiResponse({ status: 200, description: 'Return the student.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async findByNisn(@Param('nisn') nisn: string) {
    return this.studentService.findByNisn(nisn);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a student' })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, {
      ...updateStudentDto,
      birthDate: updateStudentDto.birthDate
        ? new Date(updateStudentDto.birthDate)
        : undefined,
    });
  }

  @Post(':id/assign-class')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign student to a class' })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student has been successfully assigned to class.',
  })
  @ApiResponse({ status: 404, description: 'Student or class not found.' })
  @ApiResponse({ status: 400, description: 'Class is full.' })
  async assignToClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignClassDto: AssignClassDto,
  ) {
    return this.studentService.assignToClass(id, assignClassDto.gradeClassId);
  }

  @Post(':id/remove-class')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove student from class' })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student has been successfully removed from class.',
  })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async removeFromClass(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.removeFromClass(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a student' })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.delete(id);
  }
}