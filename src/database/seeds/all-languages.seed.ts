import { InternalServerErrorException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import UsersLanguagesEntity from "../entities/language.entity";
import { Languages, LanguagesEnum } from "../types/languages";

export default class UserLanguagesSeeder implements Seeder {
	public async run(dataSource: DataSource): Promise<void> {
		try {
			await dataSource
				.createQueryBuilder()
				.insert()
				.into(UsersLanguagesEntity)
				.values(
					Languages.map((language: LanguagesEnum) => ({
						language,
					})),
				)
				.orIgnore()
				.execute();
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
	}
}
