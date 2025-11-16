import { ApiProperty } from '@nestjs/swagger';

export class StaffResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  position: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;


  @ApiProperty({ nullable: true })
  userId?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
