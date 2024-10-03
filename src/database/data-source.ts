import { config } from "dotenv";
import * as path from "path";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

const NODE_ENV = process.env.NODE_ENV;

config({
	path: path.resolve(process.cwd(), "env", !NODE_ENV ? ".dev.env" : `.${NODE_ENV}.env`),
});

export const dataSourceOption: DataSourceOptions & SeederOptions = {
	type: "postgres",
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT),
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	entities: [__dirname + "/entities/**.entity.{js,ts}"],
	migrations: [__dirname + "/migrations/**.{js,ts}"],
	seeds: [__dirname + "/seeds/**.seed.{js,ts}"],
	subscribers: [__dirname + "/subscribers/**.subscriber.{js,ts}"],
	synchronize: false,
	logging: ["error", "query", "log", "warn", "migration", "schema"],
};

const dataSource = new DataSource(dataSourceOption);
dataSource.initialize();

export default dataSource;
