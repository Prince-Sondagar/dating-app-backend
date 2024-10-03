import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { AwsService } from "src/aws/aws.service";
import ProfileMediaEntity from "src/database/entities/profileMedia.entity";
import { DeepPartial, FindOptionsWhere, In, Repository, SaveOptions } from "typeorm";
import { parse } from "url";

export class ProfileMediaService {
	constructor(
		@InjectRepository(ProfileMediaEntity)
		private readonly profileMedia: Repository<ProfileMediaEntity>,

		private awsService: AwsService,
		private configService: ConfigService,
	) {}
	async saveProfileMedias(
		entities: DeepPartial<ProfileMediaEntity>[],
		options?: SaveOptions & { reload: false },
	): Promise<DeepPartial<ProfileMediaEntity>[]> {
		const uploadedProfileMedias = await this.profileMedia.save(entities, options);
		return uploadedProfileMedias ?? [];
	}

	async find(where: FindOptionsWhere<ProfileMediaEntity>): Promise<ProfileMediaEntity[]> {
		const profileMedia: ProfileMediaEntity[] = await this.profileMedia.findBy(where);
		return profileMedia ?? [];
	}

	async delete(criteria: FindOptionsWhere<ProfileMediaEntity>) {
		const profileMedia = await this.profileMedia.delete(criteria);
		return profileMedia ?? [];
	}

	async deleteUserProfileMedias(userId: string, deleteProfileMediasIds: string) {
		const profileMediasIds = deleteProfileMediasIds.split(",");

		const getProfileMedias = await this.find({ id: In(profileMediasIds), user: { id: userId } });

		if (getProfileMedias.length) {
			try {
				await Promise.all(
					getProfileMedias.map(async ({ url }) => {
						try {
							const Key = parse(url).path.replace("/", "");
							return await this.awsService.s3.send(
								new DeleteObjectCommand({ Bucket: this.configService.get("AWS_S3_BUCKET"), Key }),
							);
						} catch (error: any) {}
					}),
				);
			} catch (error: unknown) {}

			return this.delete({ id: In(profileMediasIds) });
		} else {
			return [];
		}
	}
}
