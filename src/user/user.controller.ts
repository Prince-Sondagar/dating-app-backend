import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Post,
	Put,
	Query,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import UserEntity from "src/database/entities/user.entity";
import UserDiscoverySettingEntity from "src/database/entities/userDiscoverySetting.entity";
import { SuccessResponse } from "src/utils/common-types/userResponse.type";
import { User } from "src/utils/decorators/user.decorator";
import { UpdateUserDiscoverySettingDto, UpdateUserDto } from "./user.dto";
import { UserService } from "./user.service";
import { IUser } from "./user.type";

@Controller("user")
@ApiTags("Users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Put("/")
	@ApiOperation({ summary: "Update User" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(new ValidationPipe())
	@UseInterceptors(FileFieldsInterceptor([{ name: "profileImages", maxCount: 6 }]))
	@ApiConsumes("multipart/form-data")
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User updated successfully!",
	})
	async userUpdate(
		@UploadedFiles() files: { profileImages?: UpdateUserDto },
		@User() user: IUser,
		@Body() updateUserBody: UpdateUserDto,
	): Promise<SuccessResponse<{ user: UserEntity }>> {
		try {
			const updatedUser = await this.userService.updateUser(files, user, updateUserBody);

			return {
				error: false,
				message: `User updated successfully`,
				data: {
					user: updatedUser,
				},
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get("me")
	@ApiOperation({ summary: "User Fetch" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Usersubscription cancel successfully!",
	})
	async userGet(@User() user: IUser): Promise<SuccessResponse<IUser>> {
		try {
			return {
				error: false,
				data: user,
				message: "User fetched successfully",
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Post("nearby")
	@ApiOperation({ summary: "Fetch Nearby User" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiQuery({ name: "passion", required: false, example: "passions", description: "Passions", type: String })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Near by user fetched successfully!",
	})
	async getNearByUser(
		@User() user: IUser,
		@Body("passion") passions?: string,
		@Query("limit", { transform: (limit) => limit ?? 20 }) limit?: number,
	): Promise<SuccessResponse<UserEntity[]>> {
		try {
			const getNearByUser = await this.userService.findNearbyUsers(user, passions, limit);
			return {
				error: false,
				message: "Near by user fetched successfully",
				data: getNearByUser,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get("super-passion")
	@ApiOperation({ summary: "Fetch Super Passsions" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "etch Super Passions successfully!",
	})
	async getSuperPassions() {
		try {
			const superPassions = await this.userService.fetchUserSuperPassions();
			return {
				error: false,
				message: "fetch Super Passions successfully",
				data: superPassions,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
	@Post("discovery-setting")
	@ApiOperation({ summary: "Update Discovery Setting" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User discovery setting updated successfully!",
	})
	async editDiscoverySetting(
		@User() user: IUser,
		@Body() updateUserDiscoverySettingDto: UpdateUserDiscoverySettingDto,
	): Promise<SuccessResponse<UserDiscoverySettingEntity>> {
		try {
			if (!Object.keys(updateUserDiscoverySettingDto).length) throw Error("Please provide setting for update");
			const discoverySetting = await this.userService.updateDiscoverySetting(user, updateUserDiscoverySettingDto);
			return {
				error: false,
				message: "User discovery setting updated successfully",
				data: discoverySetting,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	// @Post("avatar-upload")
	// @ApiOperation({ summary: "Update User" })
	// @ApiBearerAuth('JWT-auth')
	// @UseGuards(AuthGuard("jwt"))
	// @UseInterceptors(FileFieldsInterceptor([{ name: "avatar", maxCount: 1 }]))
	// async uploadAvatar(@UploadedFiles() files: { avatar?: Express.Multer.File[] }, @User() user: IUser) {
	// 	try {
	// 		if (!files?.avatar || !files?.avatar.length) throw Error("Please provide user image for verify it.");
	// 		await this.userService.uploadAvatar(files.avatar[0], user);
	// 		return {
	// 			error: false,
	// 			message: "User avatar uploaded successfully",
	// 		};
	// 	} catch (error) {
	// 		throw new BadRequestException(error.message);
	// 	}
	// }
	@Post("get-verified")
	@ApiConsumes("multipart/form-data")
	// @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Array of profile images' })
	@ApiOperation({ summary: "Verified User" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UseInterceptors(FileFieldsInterceptor([{ name: "avatar", maxCount: 1 }]))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User is verified successfully!",
	})
	async getVerifiedMark(
		@User() user: IUser,
		@UploadedFiles() files: { avatar?: Array<any> },
	): Promise<SuccessResponse> {
		try {
			if (user.isVerified) throw Error("User is already verified, not need to verify again.");
			if (!files?.avatar || !files?.avatar.length) throw Error("Please provide user image for verify it.");
			// await this.userService.maskUserVerified(user);
			user.avatar = files.avatar[0].location;
			user.isVerified = true;
			await this.userService.saveUser(user);
			return {
				error: false,
				message: "User is verified successfully!",
			};
		} catch (error) {
			await this.userService.removeUploadedFiles(files.avatar[0]);
			throw new BadRequestException(error.message);
		}
	}

	@Get("discovery-setting")
	@ApiOperation({ summary: "Fetch Discovery Setting" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User discovery fetched successfully!",
	})
	async fetchUserDiscovery(@User() user: IUser) {
		const userDiscovery = await this.userService.getDiscoverySetting(user);

		return {
			error: false,
			message: "User discovery fetched successfully",
			data: userDiscovery,
		};
	}
}
