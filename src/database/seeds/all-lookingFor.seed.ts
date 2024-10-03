import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import LookingForEntity from "../entities/lookingfor.entity";
import { LookingForData } from "../types/looking-for";

export default class LookingForSeeder implements Seeder {
	public async run(dataSource: DataSource): Promise<void> {
		await dataSource
			.createQueryBuilder()
			.insert()
			.into(LookingForEntity)
			.values(LookingForData.map(({ for: lookingFor, image }) => ({ for: lookingFor, image })))
			.orIgnore()
			.execute();
	}
}
