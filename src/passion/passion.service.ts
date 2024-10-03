import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import PassionEntity from "src/database/entities/passion.entity";
import { FindOptionsSelect, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class PassionService {
	constructor(
		@InjectRepository(PassionEntity)
		private readonly passions: Repository<PassionEntity>,
	) {}

	async findOne(requestedPassion: FindOptionsWhere<PassionEntity>, selectedAttr?: FindOptionsSelect<PassionEntity>) {
		const passion = await this.passions.findOne({
			where: requestedPassion,
			...(selectedAttr ? { select: selectedAttr } : {}),
		});
		return passion || null;
	}

	async findBy(where: FindOptionsWhere<PassionEntity>): Promise<PassionEntity[]> {
		const passion: PassionEntity[] = await this.passions.findBy(where);
		return passion ?? [];
	}
}
