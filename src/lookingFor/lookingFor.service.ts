import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import LookingForEntity from "src/database/entities/lookingfor.entity";
import { FindOptionsSelect, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class LookingForService {
	constructor(
		@InjectRepository(LookingForEntity)
		private readonly lookingFor: Repository<LookingForEntity>,
	) {}

	async findOne(
		requestedLookingFor: FindOptionsWhere<LookingForEntity>,
		selectedAttr?: FindOptionsSelect<LookingForEntity>,
	) {
		const lookingFor = await this.lookingFor.findOne({
			where: requestedLookingFor,
			...(selectedAttr ? { select: selectedAttr } : {}),
		});
		return lookingFor || null;
	}

	async find(where: FindOptionsWhere<LookingForEntity>): Promise<LookingForEntity[]> {
		const LookingFor: LookingForEntity[] = await this.lookingFor.findBy(where);
		return LookingFor ?? [];
	}
}
