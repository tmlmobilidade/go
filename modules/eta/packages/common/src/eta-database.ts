/** Fully qualified table name in the given database. */
export function qualifiedTable(database: string, table: string): string {
	return `${database}.${table}`;
}

/** Replaces `{database}` placeholders with the given database name. */
export function substituteEtaDatabase(database: string, sql: string): string {
	return sql.replaceAll('{database}', database);
}
