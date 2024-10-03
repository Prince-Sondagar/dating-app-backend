import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { UserAccountEnum } from "src/database/types/user-current-account";

export class ConnectUserAccountDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	code?: string;

	@ApiProperty()
	@IsOptional()
	selectedAnthem?: object;
}

export class RefreshSpotifyArtist {
	@IsOptional()
	@IsString()
	date?: string;
}

export class ConnectInstagramAccount {
	@ApiProperty()
	@IsOptional()
	@IsString()
	code?: string;
}

export class ConnectedAccountType {
	@IsString()
	type: UserAccountEnum;
}

export class UpdateSpotifyArtist {
	@ApiProperty()
	@IsOptional()
	@IsString()
	id?: string;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	isSelected?: boolean;
}
