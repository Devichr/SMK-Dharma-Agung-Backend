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
import { GradeClassService } from './grade-class.service';
import {
  CreateGradeClassDto,
  UpdateGradeClassDto,
  FilterGradeClassDto,
} from './dto/grade-class.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Grade Classes')
@Controller('grade-classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GradeClassController {
  constructor(private readonly gradeClassService: GradeClassService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new grade class' })
  @ApiResponse({
    status: 201,
    description: 'Grade class has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createGradeClassDto: CreateGradeClassDto) {
    return this.gradeClassService.create(createGradeClassDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all grade classes with optional filters' })
  @ApiQuery({
    name: 'gradeLevel',
    required: false,
    enum: ['GRADE_10', 'GRADE_11', 'GRADE_12'],
    description: 'Filter by grade level',
  })
  @ApiQuery({
    name: 'academicYear',
    required: false,
    type: String,
    description: 'Filter by academic year (e.g., 2024/2025)',
  })
  @ApiResponse({ status: 200, description: 'Return all grade classes.' })
  async findAll(@Query() filter: FilterGradeClassDto) {
    return this.gradeClassService.findAll(filter);
  }

  @Get('academic-years')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get list of all academic years' })
  @ApiResponse({ status: 200, description: 'Return all academic years.' })
  async getAcademicYears() {
    return this.gradeClassService.getAcademicYears();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get a grade class by ID with full details' })
  @ApiParam({ name: 'id', type: Number, description: 'Grade class ID' })
  @ApiResponse({ status: 200, description: 'Return the grade class.' })
  @ApiResponse({ status: 404, description: 'Grade class not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradeClassService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get statistics for a grade class' })
  @ApiParam({ name: 'id', type: Number, description: 'Grade class ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the grade class statistics.',
  })
  @ApiResponse({ status: 404, description: 'Grade class not found.' })
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.gradeClassService.getClassStats(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a grade class' })
  @ApiParam({ name: 'id', type: Number, description: 'Grade class ID' })
  @ApiResponse({
    status: 200,
    description: 'Grade class has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Grade class not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeClassDto: UpdateGradeClassDto,
  ) {
    return this.gradeClassService.update(id, updateGradeClassDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a grade class' })
  @ApiParam({ name: 'id', type: Number, description: 'Grade class ID' })
  @ApiResponse({
    status: 200,
    description: 'Grade class has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Grade class not found.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete class with students.',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradeClassService.delete(id);
  }
}