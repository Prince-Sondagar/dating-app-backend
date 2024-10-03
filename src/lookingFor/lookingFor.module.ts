import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { LookingForController } from "./lookingFor.controller";
import { LookingForService } from "./lookingFor.service";

@Module({
	imports: [DatabaseModule],
	controllers: [LookingForController],
	providers: [LookingForService],
})
export class LookingForModule { }
