import { Controller, Get, HttpStatus, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LookingForService } from "./lookingFor.service";

@Controller("lookingfor")
@ApiTags("Looking For")
export class LookingForController {
	constructor(private readonly lookingForService: LookingForService) {}

	@Get()
	@ApiOperation({ summary: "Looking For" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Lookingfor fetched successfully!",
	})
	async fetchAllLookingFor() {
		const allLookingFor = await this.lookingForService.find({});
		return {
			error: false,
			message: "Lookingfor fetched successfully",
			data: allLookingFor.map(({ id, for: name, image }) => ({ id, name, image })),
		};
	}
}
