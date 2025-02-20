import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Between, EntityNotFoundError, Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor (
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            const existingUser = await this.userRepository.findOne({
                where: {email: createUserDto.email}
            });

            if (existingUser) {
                throw new ConflictException('Email already taken');
            }

            const newUser = new User();
            Object.assign(newUser, createUserDto);

            if (createUserDto.avatar) {
                // image upload logic goes here

                // set path to image after upload
                newUser.imageUrl = `/public/${createUserDto.email}.jpg`; 
            }

            return await this.userRepository.save(newUser);
        } catch (error) {
            if (error instanceof ConflictException)
                throw error;

            throw new Error('Failed to create user');
        }
    }

    async findAll({page, count, startDate, endDate}: {page: number, count: number, startDate: string, endDate: string}) {
        console.log(new Date(startDate), new Date(endDate))
        let whereClause = {};

        if (startDate && endDate) {
            whereClause = {
                createdAt: Between(
                    new Date(startDate),
                    new Date(endDate)
                )
            };
        }

        const totalUsers = await this.userRepository.count({where: whereClause});

        const totalPages = Math.ceil(totalUsers / count);

        const users = await this.userRepository.find({
            select: ['id', 'firstName', 'lastName', 'isActive', 'createdAt'],
            skip: (page - 1) * count,
            take: count,
            where: whereClause
        });

        return {users, page, setSize: count, usersCount: users.length, totalPages, totalUsers};
    }

    async findOne(id: number) {
        try {
            return await this.userRepository.findOneOrFail({where: {id}});
        } catch (error) {
            if (error instanceof EntityNotFoundError)
                throw new NotFoundException(`User with id ${id} not found.`);

            throw error;
        }
    }

    async getMetrics() {
        const [activeUsersCount, inactiveUsersCount, totalUsersCount] = await Promise.all([
            this.userRepository.count({where: {isActive: true}}),
            this.userRepository.count({where: {isActive: false}}),
            this.userRepository.count()
        ]);

        return {activeUsersCount, inactiveUsersCount, totalUsersCount};
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const result = await this.userRepository.update(id, updateUserDto);

        if (result.affected === 1)
            return `User ${id} has been ${updateUserDto.isActive === true ? 'activated' : 'deactivated'}`;
        else
            return `Unable to ${updateUserDto.isActive === true ? 'activat' : 'deactivat'} user`;
    }

    async remove(id: number) {
        const result = await this.userRepository.delete(id);

        if (result.affected === 1)
            return `User ${id} has been deleted`;
        else
            return `Unable to delete user`;
    }
}
