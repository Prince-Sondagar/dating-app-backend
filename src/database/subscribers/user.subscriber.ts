import * as bcrypt from "bcrypt";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import UserEntity from "../entities/user.entity";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
	async beforeInsert(event: InsertEvent<UserEntity>) {
		await this.hashPassword(event.entity);
	}

	async beforeUpdate(event: UpdateEvent<UserEntity>) {
		const user = event.databaseEntity;
		await this.hashPassword(user);
	}

	async hashPassword(user: UserEntity) {
		if (user?.password) {
			user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(12));
		}
	}
}