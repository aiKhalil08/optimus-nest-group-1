import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    readonly firstName: string;

    @IsString()
    readonly lastName: string;

    @IsEmail({}, {message: 'Invalid Email Address'})
    readonly email: string;

    @IsOptional()
    readonly avatar?: any;
}
