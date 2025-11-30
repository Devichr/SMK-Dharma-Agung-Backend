import {
  Body,
  Controller,
  Delete,
  Get,
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

import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffResponseDto } from './dto/staff-response.dto';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // CREATE STAFF
  @Post()
  @ApiOperation({ summary: 'Create new staff' })
  @ApiResponse({ status: 201, type: StaffResponseDto })
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  // GET ALL STAFF (WITH PAGINATION + SEARCH)
  @Get()
  @ApiOperation({ summary: 'Get all staff (pagination + search)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: [StaffResponseDto] })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.staffService.findAll(page, limit, search);
  }

  // GET STAFF BY ID
  @Get(':id')
  @ApiOperation({ summary: 'Get staff by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  // UPDATE STAFF
  @Put(':id')
  @ApiOperation({ summary: 'Update staff by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }

  // SOFT DELETE STAFF
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete staff by ID' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.remove(id);
  }
}
