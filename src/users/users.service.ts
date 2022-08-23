import { ConflictException, Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from './user-roles.enum';
import { User } from './user.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { ReturnUserDto } from './return-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createAdminUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    } else {
      return this.createUser(createUserDto, UserRole.ADMIN);
    }
  }

  private async createUser(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<User> {
    const { email, name, password } = createUserDto;

    const user = this.userRepository.create();
    user.email = email;
    user.name = name;
    user.role = role;

    try {
      await user.save();
      return user;
    } catch (error) {
      if (error.code.toString() === '23505') {
        throw new ConflictException('Endereço de email já em uso');
      } else {
        throw new InternalServerErrorException(
          'Erro ao salvar o usuário banco de dados',
        );
      }
    }
  }

  public async findAll(): Promise<User[]> {
    const users: User[] = await this.userRepository.find();
    return users;
  }

  private async hasPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

}
