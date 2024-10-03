import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Post,
	Put,
	Res,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AnthemEnum, UserAccountEnum } from "src/database/types/user-current-account";
import { IUser } from "src/user/user.type";
import { User } from "src/utils/decorators/user.decorator";
import { ConnectInstagramAccount, ConnectUserAccountDto, UpdateSpotifyArtist } from "./userConnectedAccount.dto";
import { UserConnectedAccountService } from "./userConnectedAccount.service";

@Controller("connected-account")
@ApiTags("Connected Accounts")
export class UserConnectedAccountController {
	constructor(private readonly userConnectedAccountService: UserConnectedAccountService) {}

	@Get("connected")
	@ApiOperation({ summary: "Connected Account" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Connected User fetched successfully!",
	})
	async fetchUserConnectedAccount(@User() user: IUser, type: UserAccountEnum) {
		try {
			const getConnectedUser = await this.userConnectedAccountService.findConnectedUser(user, type);
			if (getConnectedUser) {
				return {
					error: false,
					message: "Connected User fetched successfully",
					data: getConnectedUser.map(({ type, metadata }) => ({ type, metadata })),
				};
			}
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get("redirect-:appType(spotify|instagram)")
	@ApiOperation({ summary: "Redirect" })
	@ApiParam({
		name: "appType",
		enum: [UserAccountEnum.INSTAGRAM, UserAccountEnum.SPOTIFY],
		description: "Select Apptype",
	})
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Redirect successfully!",
	})
	async redirectForConnectApp(@Param("appType") appType: UserAccountEnum, @Res() res: Response) {
		try {
			return res.redirect(await this.userConnectedAccountService.getRedirectUrl(appType));
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Post("disconnect")
	@ApiOperation({ summary: "Disconnect Account" })
	@ApiBody({ description: "The app type for disconnection" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Disconnect successfully!",
	})
	async disconnectSpotify(@User() user: IUser, @Body("appType") appType: UserAccountEnum) {
		try {
			await this.userConnectedAccountService.disconnectUserSocialMediaAccount(user, appType);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Post("connect-spotify")
	@ApiOperation({ summary: "Connect with Spotify" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Spotify Account Connected successfully!",
	})
	async handleSpotifyCallback(@User() user: IUser, @Body() connectSpotify: ConnectUserAccountDto) {
		try {
			const connectUserWithSpotifyAccount = await this.userConnectedAccountService.connectWithSpotify(
				user,
				connectSpotify,
			);
			return {
				error: false,
				message: "User Account Connected successfully",
				data: connectUserWithSpotifyAccount,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Post("connect-instagram")
	@ApiOperation({ summary: "Connect with Instagram" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Instagram Account Connected successfully!",
	})
	async handleInstagramConnect(@User() user: IUser, @Body() connectInstagram: ConnectInstagramAccount) {
		try {
			const connectUserWithInstagramAccount = await this.userConnectedAccountService.connectWithInstagram(
				user,
				connectInstagram,
			);
			return {
				error: false,
				message: "User Account Connected successfully",
				data: connectUserWithInstagramAccount?.metadata,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get("refresh-artist")
	@ApiOperation({ summary: "Refresh Artists" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Artist Refresh successfully!",
	})
	async handleRefreshArtist(@User() user: IUser) {
		try {
			const spotifyArtist = await this.userConnectedAccountService.refreshSpotifyArtist(user);
			return {
				error: false,
				message: "User Artist Refresh successfully",
				data: spotifyArtist,
				time: new Date(),
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Post("spotify-anthem")
	@ApiOperation({ summary: "Fetch Spotify Anthem" })
	@ApiProperty()
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Spotify Anthem Fetch successfully!",
	})
	async handleSpotifyAnthem(@User() user: IUser, @Body("search") search: string) {
		try {
			const spotifyAnthem = await this.userConnectedAccountService.fetchSpotifyAnthem(user, search);
			return {
				error: false,
				message: "User Artist Refresh successfully",
				data: spotifyAnthem,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Put("update-artist")
	@ApiOperation({ summary: "Update Spotify Artist" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Update Spotify Artistsuccessfully!",
	})
	async handleUpdateArtist(@User() user: IUser, @Body() updateArtist: UpdateSpotifyArtist) {
		try {
			await this.userConnectedAccountService.updateUserArtist(user, updateArtist);
			return {
				error: false,
				message: "User User Artist Successfully",
			};
		} catch (error) {}
	}

	@Post("spotify-artist")
	@ApiOperation({ summary: "Fetch Spotify Artist" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Spotify Artist Fetched successfully!",
	})
	async fetchUserSpotifyAritst(@User() user: IUser) {
		try {
			const getSpotifyArtists = await this.userConnectedAccountService.findUserSpotifyArtist(user);
			return {
				error: false,
				message: "User Spotify Artist Fetched successfully",
				data: getSpotifyArtists,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Put("anthem-:type(select|unSelect)")
	@ApiOperation({ summary: "Select Spotify Artist" })
	@ApiParam({ name: "type", enum: [AnthemEnum.SELECT, AnthemEnum.UNSELECT], description: "Select Anthem Type" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Spotify Account Fetched successfully!",
	})
	async selectSpotifyAnthem(
		@Param("type") type: AnthemEnum,
		@User() user: IUser,
		@Body() connectSpotify: ConnectUserAccountDto,
	) {
		try {
			const selectAnthem = await this.userConnectedAccountService.selectSpotifyAnthem(user, type, connectSpotify);
			return {
				error: false,
				message: "User Spotify Account Fetched successfully",
				data: selectAnthem,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
