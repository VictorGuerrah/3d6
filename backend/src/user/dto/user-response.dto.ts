import { Expose, Exclude } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  get displayName() {
    return `${this.name} (${this.email})`;
  }
}