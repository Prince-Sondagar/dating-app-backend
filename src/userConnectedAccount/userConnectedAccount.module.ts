import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { UserConnectedAccountController } from "./userConnectedAccount.controller";
import { UserConnectedAccountService } from "./userConnectedAccount.service";

@Module({
	imports: [DatabaseModule],
	controllers: [UserConnectedAccountController],
	providers: [UserConnectedAccountService],
})
export class UserConnectedAccountModule {}
