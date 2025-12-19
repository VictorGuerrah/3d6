import { ObjectLiteral, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BaseService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<T | null> {
    return this.repository.findOneBy({ id } as any);
  }
  async create(item: Partial<T>): Promise<T> {
    return this.repository.save(item as T);
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Entity not found with id ${id}`);
    }
    Object.assign(existing, item);
    return this.repository.save(existing);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete({ id } as any);
  }
}
