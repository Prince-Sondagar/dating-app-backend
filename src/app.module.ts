import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SwaggerModule } from "@nestjs/swagger";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as path from "path";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { AwsModule } from "./aws/aws.module";
import { dataSourceOption } from "./database/data-source";
import { LookingForModule } from "./lookingFor/lookingFor.module";
import { MessageModule } from "./message/message.module";
import { PassionModule } from "./passion/passion.module";
import { ProfileMediaModule } from "./profileMedia/profileMedia.module";
import { ScheduleModule } from "./schedule/schedule.module";
import SubscriptionModule from "./subscriptions/subscription.module";
import { UserModule } from "./user/user.module";
import { UserConnectedAccountModule } from "./userConnectedAccount/userConnectedAccount.module";
import { UsersInterestModule } from "./usersInterest/usersInterest.module";

const NODE_ENV = process.env.NODE_ENV;

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [
				path.resolve(process.cwd(), "env/.env"),
				path.resolve(process.cwd(), "env", !NODE_ENV ? ".dev.env" : `.${NODE_ENV}.env`),
			],
			isGlobal: true,
		}),
		ScheduleModule,
		AuthModule,
		AwsModule,
		SubscriptionModule,
		UserModule,
		PassionModule,
		LookingForModule,
		ProfileMediaModule,
		UsersInterestModule,
		MessageModule,
		UserConnectedAccountModule,
		AdminModule,
		SwaggerModule,
		TypeOrmModule.forRootAsync({
			useFactory() {
				console.log("DB Server: ", (dataSourceOption as any).host);
				console.log("DB Port: ", (dataSourceOption as any).port);
				console.log("DB Name: ", dataSourceOption.database);
				return dataSourceOption;
			},
		}),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
