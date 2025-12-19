import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class UpdateUserDto {

    @IsNotEmpty()
    @IsOptional()
    name: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsOptional()
    password: string;
}
