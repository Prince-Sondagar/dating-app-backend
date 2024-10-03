import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { PassionController } from "./passion.controller";
import { PassionService } from "./passion.service";

@Module({
	imports: [DatabaseModule],
	controllers: [PassionController],
	providers: [PassionService],
})
export class PassionModule {}
