import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import LookingForEntity from "src/database/entities/lookingfor.entity";
import PassionEntity from "src/database/entities/passion.entity";
import UserEntity from "src/database/entities/user.entity";
import { dataSourceOption } from "./data-source";
import AdminLogsEntity from "./entities/adminLogsEntity.entity";
import LanguagesEntity from "./entities/language.entity";
import MessageEntity from "./entities/message.entity";
import ProfileMediaEntity from "./entities/profileMedia.entity";
import SubscriptionsEntity from "./entities/subscriptions.entity";
import SuperPassionsEntity from "./entities/superPassions.entity";
import userConnectedAccountEntity from "./entities/userConnectedAccount.entity";
import UserDiscoverySettingEntity from "./entities/userDiscoverySetting.entity";
import userSpotifyAccountArtistEntity from "./entities/userSpotifyArtist.entity";
import UsersInterestProfileEntity from "./entities/usersInterest.entity";
import UsersMessageThreadEntity from "./entities/usersMessageThread.entity";

const repositories = TypeOrmModule.forFeature([
	UserEntity,
	UserDiscoverySettingEntity,
	SuperPassionsEntity,
	PassionEntity,
	LanguagesEntity,
	MessageEntity,
	LookingForEntity,
	ProfileMediaEntity,
	UsersInterestProfileEntity,
	UsersMessageThreadEntity,
	SubscriptionsEntity,
	userConnectedAccountEntity,
	userSpotifyAccountArtistEntity,
	AdminLogsEntity,
]);

@Module({
	imports: [TypeOrmModule.forRoot(dataSourceOption), repositories],
	exports: [repositories],
})
export class DatabaseModule {}
