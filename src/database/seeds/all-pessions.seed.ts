import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import PassionEntity from "../entities/passion.entity";
import { PassionsEnum, passions } from "../types/passions";

export default class PassionSeeder implements Seeder {
	public async run(dataSource: DataSource): Promise<void> {
		await dataSource
			.createQueryBuilder()
			.insert()
			.into(PassionEntity)
			.values(
				passions.map((passion: PassionsEnum) => ({
					passion: passion,
				})),
			)
			.orIgnore()
			.execute();
	}
}
