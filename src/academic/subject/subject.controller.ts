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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { AssignTeachersDto } from './dto/assign-teachers.dto';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.subjectService.findAll(search, category);
  }

  @Get('categories')
  getCategories() {
    return this.subjectService.getCategories();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.remove(id);
  }

  // ============================================
  // TEACHER ASSIGNMENT ENDPOINTS
  // ============================================

  @Post(':id/teachers')
  assignTeachers(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTeachersDto: AssignTeachersDto,
  ) {
    return this.subjectService.assignTeachers(id, assignTeachersDto);
  }

  @Post(':id/teachers/:teacherId')
  addTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Body('isPrimary') isPrimary?: boolean,
  ) {
    return this.subjectService.addTeacher(id, teacherId, isPrimary);
  }

  @Delete(':id/teachers/:teacherId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.subjectService.removeTeacher(id, teacherId);
  }

  @Put(':id/teachers/:teacherId/primary')
  setPrimaryTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.subjectService.setPrimaryTeacher(id, teacherId);
  }

  @Get(':id/teachers')
  getTeachersBySubject(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.getTeachersBySubject(id);
  }
}