import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { TeacherService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherResponseDto } from './dto/teacher-response.dto';

@ApiTags('teachers')
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // CREATE TEACHER
  @Post()
  @ApiOperation({ summary: 'Create new teacher' })
  @ApiResponse({ status: 201, type: TeacherResponseDto })
  create(@Body() dto: CreateTeacherDto) {
    return this.teacherService.create(dto);
  }

  // GET ALL TEACHERS WITH PAGINATION & SEARCH
  @Get()
  @ApiOperation({ summary: 'Get all teachers (pagination + search)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: [TeacherResponseDto] })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.teacherService.findAll(page, limit, search);
  }

  // GET TEACHER BY ID
  @Get(':id')
  @ApiOperation({ summary: 'Get teacher by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: TeacherResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.findOne(id);
  }

  // UPDATE TEACHER
  @Put(':id')
  @ApiOperation({ summary: 'Update teacher by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: TeacherResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.update(id, dto);
  }

  @Get(':id/subjects')
  getSubjects(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getSubjects(id);
  }

  @Post(':id/subjects/:subjectId')
  assignSubject(
    @Param('id', ParseIntPipe) id: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Body('isPrimary') isPrimary?: boolean,
  ) {
    return this.teacherService.assignSubject(id, subjectId, isPrimary);
  }

  @Delete(':id/subjects/:subjectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSubject(
    @Param('id', ParseIntPipe) id: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
  ) {
    return this.teacherService.removeSubject(id, subjectId);
  }


  // SOFT DELETE TEACHER
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete teacher by ID' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.remove(id);
  }
}
