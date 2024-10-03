import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import AdminLogsEntity from "src/database/entities/adminLogsEntity.entity";
import UserEntity from "src/database/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(UserEntity)
		private readonly users: Repository<UserEntity>,
		@InjectRepository(AdminLogsEntity)
		private readonly admin: Repository<AdminLogsEntity>,
		@Inject(ConfigService)
		private configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get("JWT_SECRET"),
		});
	}

	async validate(user: { role: string; id: string }) {
		let validatedUser;
		if (user.role === "admin") {
			validatedUser = await this.admin.findOne({
				where: { id: user.id },
			});
		}
		if (user.role === "user") {
			validatedUser = await this.users.findOne({
				where: { id: user.id, deletedAt: null },
				relations: ["passions", "lookingFor"],
			});
		}
		if (!validatedUser) {
			throw new UnauthorizedException("Invalid user");
		}

		return validatedUser;
	}
}
