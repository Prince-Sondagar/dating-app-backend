import {
	BadRequestException,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IUser } from "src/user/user.type";
import { User } from "src/utils/decorators/user.decorator";
import { ProfileMediaService } from "./profileMedia.service";

@Controller("profile-medias")
@ApiTags("Profile Media")
export class ProfileMediaController {
	constructor(private readonly profileMediaService: ProfileMediaService) {}

	@Delete(":ids")
	@ApiOperation({ summary: "Delete Profile Media" })
	@ApiParam({ name: "ids", description: "Type Id of delete profile media" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User media deleted successfully!",
	})
	async deleteProfileMedia(@User() user: IUser, @Param("ids") deleteProfileMediasIds: string) {
		try {
			await this.profileMediaService.deleteUserProfileMedias(user.id, deleteProfileMediasIds);

			return {
				error: false,
				message: "User media deleted successfully",
				data: null,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get("")
	@ApiOperation({ summary: "Fetch Profile Media" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User media fetched successfully!",
	})
	async getProfileMedia(@User() user: IUser) {
		try {
			const userProfileMedias = await this.profileMediaService.find({ user: { id: user.id } });

			return {
				error: false,
				message: "User media fetched successfully",
				data: userProfileMedias.map(({ id, url }) => ({ id, url })) ?? [],
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
