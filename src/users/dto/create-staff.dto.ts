import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'Andi Saputra' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  employeeId: string;


  @ApiProperty({ example: 'Headmaster' })
  @IsNotEmpty()
  @IsString()
  position: string;


  @ApiProperty({ example: '08123456789' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 12' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 3, nullable: true, required: false })
  @IsOptional()
  userId?: number;
}
