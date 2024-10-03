import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Post,
	Query,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InterestStatusENUM } from "src/database/types/users-interest";
import { IUser } from "src/user/user.type";
import { SuccessResponse } from "src/utils/common-types/userResponse.type";
import { User } from "src/utils/decorators/user.decorator";
import { MatchesQueryDto, UsersInterestDto } from "./usersInterest.dto";
import { UsersInterestService } from "./usersInterest.service";

@Controller("userinterest")
@ApiTags("User Interest")
export class UsersInterestController {
	constructor(private readonly userInterestService: UsersInterestService) {}

	@Post(":status(liked|superliked|rejected|boost|revise)")
	@ApiOperation({ summary: "User Intrest" })
	@ApiParam({
		name: "status",
		enum: ["liked", "superliked", "rejected", "boost", "revise"],
		description: "Select Type Of User Intrest",
	})
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User has interested successfully!",
	})
	async setUsersInterest(
		@User() user: IUser,
		@Body() userInterestBody: UsersInterestDto,
		@Param("status") status: "liked" | "superliked" | "rejected" | "boost" | "revise",
	): Promise<SuccessResponse<InterestStatusENUM | any>> {
		try {
			let userInterest;
			if (status == "liked")
				userInterest = await this.userInterestService.likeUserInterest(user, userInterestBody, status);
			else if (status == "superliked")
				userInterest = await this.userInterestService.superLikeUserInterest(user, userInterestBody, status);
			else if (status == "rejected")
				userInterest = await this.userInterestService.rejectUserInterest(user, userInterestBody, status);
			else if (status == "revise") userInterest = await this.userInterestService.reviseUsersInterest(user);
			else if (status == "boost") userInterest = await this.userInterestService.boostUserInterest(user);
			return {
				error: false,
				message: "User has interested successfully",
				data: { isMatch: userInterest.isMatch, threadId: userInterest.threadId },
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get("matches/:type(likes|sentlikes)")
	@ApiOperation({ summary: "Fetch Matches" })
	@ApiParam({ name: "type", enum: ["likes", "sentlikes"], description: "Select User Matches" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User interested fetched successfully!",
	})
	async getMatchProfiles(
		@User() user: IUser,
		@Param("type") type: "likes" | "sentlikes",
		@Query(new ValidationPipe()) searchQuery: MatchesQueryDto,
	): Promise<SuccessResponse<InterestStatusENUM | string>> {
		try {
			let matchedProfiles;
			if (type == "likes") matchedProfiles = await this.userInterestService.getLikes(user, searchQuery);
			else if (type == "sentlikes") matchedProfiles = await this.userInterestService.getSentLike(user);
			return {
				error: false,
				message: "User interested fetched successfully",
				data: matchedProfiles ?? [],
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
