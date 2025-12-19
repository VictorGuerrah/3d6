import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

@Entity({ name : 'users' })
export class User extends BaseEntity {
  @Column({length: 100 , nullable: false})
  name: string;

  @Column({length: 100, unique: true, nullable: false})
  email: string;

  @Column({length: 255, nullable: false})
  password: string;
}
