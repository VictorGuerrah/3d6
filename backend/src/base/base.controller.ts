import { Get, Post, Patch, Delete, Param, Body, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

export function BaseController<T, CreateDto, UpdateDto, ResponseDto>(
  dto: Type<ResponseDto>,
  prefix: string
): any {
  @Controller(prefix)
  abstract class BaseControllerHost {
    constructor(protected readonly service: any) {}

    protected transform(entity: any): ResponseDto {
      return plainToInstance(dto, entity);
    }

    protected transformMany(entities: any[]): ResponseDto[] {
      return entities.map(e => this.transform(e));
    }

    @Post()
    async create(@Body() createDto: CreateDto): Promise<ResponseDto> {
      const entity = await this.service.create(createDto);
      return this.transform(entity);
    }

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(): Promise<ResponseDto[]> {
      const entities = await this.service.findAll();
      return this.transformMany(entities);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ResponseDto> {
      const entity = await this.service.findOne(id);
      return this.transform(entity);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateDto): Promise<ResponseDto> {
      const entity = await this.service.update(id, updateDto);
      return this.transform(entity);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
      return this.service.remove(id);
    }
  }

  return BaseControllerHost;
}
