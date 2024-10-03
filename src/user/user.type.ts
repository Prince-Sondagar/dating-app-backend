import UserEntity from "src/database/entities/user.entity";

export type IUser = Omit<UserEntity, "password">;
