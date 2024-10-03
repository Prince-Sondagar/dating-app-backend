import { ColumnOptions, TableColumnOptions } from "typeorm";

export const createdAt = { type: "timestamp", precision: 0, default: () => "CURRENT_TIMESTAMP" } as ColumnOptions;
export const updatedAt = {
	type: "timestamp",
	precision: 0,
	default: () => "CURRENT_TIMESTAMP",
	onUpdate: "CURRENT_TIMESTAMP",
} as ColumnOptions;
export const deletedAt = { precision: 0, default: null } as ColumnOptions;

export const primaryColumn: TableColumnOptions = {
	name: "id",
	type: "varchar",
	isGenerated: true,
	generationStrategy: "uuid",
	isPrimary: true,
};

export const createdAtColumn: TableColumnOptions = {
	name: "created_at",
	type: "timestamp",
	default: "CURRENT_TIMESTAMP",
};

export const updatedAtColumn: TableColumnOptions = {
	name: "updated_at",
	type: "timestamp",
	default: "CURRENT_TIMESTAMP",
	onUpdate: "CURRENT_TIMESTAMP",
};

export const deletedAtColumn: TableColumnOptions = {
	name: "deleted_at",
	type: "timestamp",
	isNullable: true,
};
