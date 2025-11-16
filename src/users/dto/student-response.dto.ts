import { ApiProperty } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nisn: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  schoolOrigin: string;

  @ApiProperty({ nullable: true })
  userId?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
