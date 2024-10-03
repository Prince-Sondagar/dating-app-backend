import { DataSource } from "typeorm";
import { Seeder } from "typeorm-extension";
import PassionEntity from "../entities/passion.entity";
import SuperPassionsEntity from "../entities/superPassions.entity";
import { superPassions } from "../types/super-passions";

export default class SubPassionSeeder implements Seeder {
	public async run(dataSource: DataSource): Promise<void> {
		const entity = await dataSource.createEntityManager();
		await entity.save(
			await entity.create(
				SuperPassionsEntity,
				await Promise.all(
					superPassions.map(async (item) => ({
						superPassion: item?.superPassions,
						type: item?.type,
						description: item?.description,
						image: item?.image,
						subPassions: await dataSource
							.createQueryBuilder(PassionEntity, "passions")
							.where("passions.passion IN (:...subPassions)", { subPassions: item?.subPassions })
							.getMany(),
					})),
				),
			),
		);
	}
}
