import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AwsService {
	public s3: S3Client;

	constructor(private configService: ConfigService) {
		this.s3 = new S3Client({
			region: configService.get("AWS_REGION"),
			credentials: {
				accessKeyId: configService.get("AWS_S3_ACCESS_KEY"),
				secretAccessKey: configService.get("AWS_S3_KEY_SECRET"),
			},
		});
	}

	removeObjectFromS3(Key: string) {
		return this.s3.send(new DeleteObjectCommand({ Bucket: this.configService.get("AWS_S3_BUCKET"), Key }));
	}
}
