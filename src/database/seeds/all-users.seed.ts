/* spellchecker: disable */

import { DataSource, Repository } from "typeorm";
import { Seeder } from "typeorm-extension";
import LookingForEntity from "../entities/lookingfor.entity";
import PassionEntity from "../entities/passion.entity";
import UserEntity from "../entities/user.entity";
import { getAllUser } from "./get-all-users";

const seedData = async ({
	passionRepo,
	lookingForRepo,
}: {
	passionRepo: Repository<PassionEntity>;
	lookingForRepo: Repository<LookingForEntity>;
}): Promise<Array<UserEntity>> => {
	return [] || getAllUser();
};

export default class CreateUsers implements Seeder {
	public async run(dataSource: DataSource): Promise<void> {
		const passionRepo = await dataSource.getRepository(PassionEntity);
		const lookingForRepo = await dataSource.getRepository(LookingForEntity);

		await dataSource
			.createQueryBuilder()
			.insert()
			.into(UserEntity)
			.values(await seedData({ passionRepo, lookingForRepo }))
			.orIgnore()
			.execute();
	}
}
