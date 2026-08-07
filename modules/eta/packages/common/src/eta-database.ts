/** Fully qualified table name in the given database. */
export function qualifiedTable(database: string, table: string): string {
	return `${database}.${table}`;
}
