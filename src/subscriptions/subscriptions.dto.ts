import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class createSubscriptionDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	priceId: string;
}
