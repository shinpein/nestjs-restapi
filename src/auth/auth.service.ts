import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Msg, Jwt } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  //3つのサービスをDI
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * サインアップ
   *
   * @param {AuthDto} dto
   * @return {*}  {Promise<Msg>}
   * @memberof AuthService
   */
  async signUp(dto: AuthDto): Promise<Msg> {
    //bcryptで入力されたパスワードをハッシュ化
    const hashed = await bcrypt.hash(dto.password, 12);
    try {
      //prisma.user の部分はschema.prismaに相当
      //prismaサービスのcreateメソッドを呼び出してDBに登録。
      await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword: hashed,
        },
      });
      return {
        //登録が成功した場合
        message: 'ok',
      };
    } catch (error) {
      // 登録に失敗した場合、prismaのエラーコードが返る
      if (error instanceof PrismaClientKnownRequestError) {
        //既に存在する場合のエラー
        if (error.code === 'P2002') {
          throw new ForbiddenException('既に登録されています');
        }
      }
      throw error;
    }
  }

  /**
   * ログイン
   *
   * @param {AuthDto} dto
   * @return {*}  {Promise<Jwt>}
   * @memberof AuthService
   */
  async login(dto: AuthDto): Promise<Jwt> {
    // email に一致する user をDBから取得
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Eメールまたはパスワードが不正です');
    }

    //平文のパスワードとハッシュ化されたDB内のパスワードが一致するか検証
    const isValid = await bcrypt.compare(dto.password, user.hashedPassword);

    if (!isValid) {
      throw new ForbiddenException('Eメールまたはパスワードが不正です');
    }
    return this.generateJwt(user.id, user.email);
  }

  /**
   * Jwt アクセストークン生成
   *
   * @param {number} userId
   * @param {string} email
   * @return {*}  {Promise<Jwt>}
   * @memberof AuthService
   */
  async generateJwt(userId: number, email: string): Promise<Jwt> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    // payload と secret でアクセストークンを作成（有効期限5分）
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '5m',
      secret: secret,
    });
    return {
      accessToken: token,
    };
  }
}
