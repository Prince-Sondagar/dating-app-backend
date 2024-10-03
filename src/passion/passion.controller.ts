import { Controller, Get, HttpStatus, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PassionService } from "./passion.service";

@Controller("passions")
@ApiTags("Passions")
export class PassionController {
	constructor(private readonly passionService: PassionService) {}

	@Get()
	@ApiOperation({ summary: "Fetch Passions" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Passions fetched successfully!",
	})
	async fetchAllPassion() {
		const allPassions = await this.passionService.findBy({});
		return {
			error: false,
			message: "Passions fetched successfully",
			data: allPassions.map(({ passion, id }) => ({ passion, id })),
		};
	}
}
