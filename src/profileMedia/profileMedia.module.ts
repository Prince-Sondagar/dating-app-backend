import { Module } from "@nestjs/common";
import { JwtStrategy } from "src/auth/strategies/jwt.strategy";
import { AwsService } from "src/aws/aws.service";
import { DatabaseModule } from "src/database/database.module";
import { ProfileMediaService } from "src/profileMedia/profileMedia.service";
import { ProfileMediaController } from "./profileMedia.controller";

@Module({
	imports: [DatabaseModule],
	controllers: [ProfileMediaController],
	providers: [ProfileMediaService, JwtStrategy, AwsService],
})
export class ProfileMediaModule {}
