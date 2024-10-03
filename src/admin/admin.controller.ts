import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Post,
	Put,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import {
	AdminLoginDto,
	AdminRenewAccessTokenDto,
	ChartTimeDto,
	EmailOtpVerifyBody,
	SuperPassionsDto,
	UpdatePassionsDto,
} from "./admin.dto";

import { AuthGuard } from "@nestjs/passport";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "src/utils/decorators/user.decorator";
import { AdminService } from "./admin.service";

@Controller("admin")
@ApiTags("Admin")
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Post("email-login")
	@ApiOperation({ summary: "Sent Otp on Email" })
	@ApiBody({ type: AdminLoginDto })
	@UseGuards()
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Otp successfully sent.!",
	})
	async loginWithEmail(@Body("email") email: string) {
		const response = await this.adminService.loginWithEmailOtp(email);
		return {
			error: false,
			message: `Otp successfully sent.`,
		};
	}

	@Post("email-otp-verify")
	@ApiOperation({ summary: "Verify Otp" })
	@UseGuards()
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Login Successfully.!",
	})
	async verifyEmailOTP(@Body() emailOtpVerifyBody: EmailOtpVerifyBody) {
		const { response } = await this.adminService.verifyUserEmailOTP(emailOtpVerifyBody);
		return {
			error: false,
			message: `User Login Successfully.`,
			data: await this.adminService.login(response),
			user: response.email,
		};
	}

	@Get("users")
	@ApiOperation({ summary: "Fetch User" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Fetched Successfully!",
	})
	async fetchAllUserDetails() {
		const getAllUsers = await this.adminService.fetchAllUsersDetails();
		return {
			error: false,
			message: "User Fetched Successfully",
			data: getAllUsers,
		};
	}

	@Delete("user/:id")
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User removed successfully!",
	})
	async deleteUser(@Param("id") id: string) {
		const deleteUser = await this.adminService.deleteUser(id);
		return {
			error: false,
			message: "User removed successfully",
			data: deleteUser
		};
	}

	@Get("super-passions")
	@ApiOperation({ summary: "Fetch Super Passions" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Super Passions Fetch Successfully",
	})
	async fetchAllSuperPassions() {
		const getAllSuperPassions = await this.adminService.fetchAllSuperPassions();
		return {
			error: false,
			message: "User Fetched Successfully",
			data: getAllSuperPassions,
		};
	}

	@Get("passions")
	@ApiOperation({ summary: "Fetch Passions" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Passions fetched successfully!",
	})
	async fetchAllPassion() {
		const allPassions = await this.adminService.findBy({});
		return {
			error: false,
			message: "Passions fetched successfully",
			data: allPassions.map(({ passion, id }) => ({ passion, id })),
		};
	}

	@Post("add-super-passions")
	@ApiOperation({ summary: "Add Super Passions" })
	@ApiBearerAuth("JWT-auth")
	@ApiConsumes("multipart/form-data")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Super Passions Added Successfully!",
	})
	@UseInterceptors(FileFieldsInterceptor([{ name: "image", maxCount: 1 }]))
	async addSuperPassions(@UploadedFiles() files: { image?: SuperPassionsDto }, @Body() createPassions: SuperPassionsDto) {
		const superPassions = await this.adminService.createNewSuperPassions(files, createPassions);
		return {
			error: false,
			message: "Super Passions Added Successfully",
			data: superPassions,
		};
	}

	@Put("update-super-passions/:id")
	@ApiOperation({ summary: "Update Super Passions" })
	@ApiParam({ name: "id", description: "Add Super Passions Id" })
	@ApiConsumes("multipart/form-data")
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Super Passions Updated Successfully!",
	})
	@UseInterceptors(FileFieldsInterceptor([{ name: "image", maxCount: 1 }]))
	async updateSuperPassions(
		@Param("id") id: string,
		@UploadedFiles() files: { image?: UpdatePassionsDto },
		@Body() updatePassions: UpdatePassionsDto,
	) {
		const superPassions = await this.adminService.updateNewSuperPassions(id, updatePassions, files);
		return {
			error: false,
			message: "Super Passions Updated Successfully",
			data: superPassions,
		};
	}

	@Delete("delete/:id")
	@ApiOperation({ summary: "Delete Super Passions" })
	@ApiParam({ name: "id", description: "Super Passions Id" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UseInterceptors(FileFieldsInterceptor([{ name: "image", maxCount: 1 }]))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Super Passions Deleted Successfully!",
	})
	async deleteSuperPassions(@Param("id") id: string) {
		const deletePassion = await this.adminService.deletePassions(id);
		return {
			error: false,
			message: "Super Passions Deleted Successfully",
			data: deletePassion,
		};
	}

	@Get("user-subscriptions")
	@ApiOperation({ summary: "Fetch User Subscription" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Fetched Successfully!",
	})
	async fetchAllUserSubscriptions() {
		const getAllSubscriptions = await this.adminService.getAllUsersSubscriptions();
		return {
			error: false,
			message: "User Fetched Successfully",
			data: getAllSubscriptions,
		};
	}

	@Post("chart-user-data")
	@ApiOperation({ summary: "Fetch User Chart Data" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiBody({ type: ChartTimeDto })
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User Chart Data Fetched Successfully!",
	})
	async fetchAllChartReletedData(@Body("time") time?: ChartTimeDto) {
		const data = await this.adminService.getUsersData({ time });
		return {
			error: false,
			message: "Chart Releted Data Fetched Successfully",
			data: data,
		};
	}

	@Post("chart-subscription-data")
	@ApiOperation({ summary: "Fetch Subscription Chart Data" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiBody({ type: ChartTimeDto })
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Subscription Chart Data Fetched Successfully!",
	})
	async fetchSubscriptionChartData(@Body("time") time?: ChartTimeDto) {
		const data = await this.adminService.getSubscriptionData({ time });
		return {
			error: false,
			message: "Chart Releted Data Fetched Successfully",
			data: data,
		};
	}

	@Get("subscription-plans")
	@ApiOperation({ summary: "Fetch Subscription Plans" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Subscription Plan Fetched Successfully!",
	})
	async fetchAllSubscriptions() {
		const getAllSubsctiptions = await this.adminService.getSubscriptions();
		return {
			error: false,
			message: "Subscription Plan Fetched Successfully",
			data: getAllSubsctiptions,
		};
	}

	@Get("logout")
	@ApiOperation({ summary: "Logout" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(ValidationPipe)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Logout Successfully!",
	})
	async handleLogout(@User() user: any) {
		const logout = await this.adminService.logoutUser(user);
		return {
			error: false,
			message: "Logout Successfully",
			data: logout,
		};
	}
	@Post("renew-token")
	@ApiOperation({ summary: "Renew Token" })
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Token successfully renewed!",
	})
	async renewAccessToken(@Body() renewAccessTokenDto: AdminRenewAccessTokenDto): Promise<any> {
		const response = await this.adminService.renewAccessToken(renewAccessTokenDto.refreshToken);

		return {
			error: false,
			message: `token successfully renewed`,
			data: response,
		};
	}
}
