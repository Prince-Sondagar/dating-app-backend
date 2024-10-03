import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import LanguagesEntity from "src/database/entities/language.entity";
import { FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class LanguageService {
	constructor(
		@InjectRepository(LanguagesEntity)
		private readonly language: Repository<LanguagesEntity>,
	) {}

	async findBy(where: FindOptionsWhere<LanguagesEntity>): Promise<LanguagesEntity[]> {
		const userLanguages: LanguagesEntity[] = await this.language.findBy(where);
		return userLanguages ?? [];
	}
}
