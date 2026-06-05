const ETA_DATABASES = ['eta', 'eta_dev'] as const;

/** ClickHouse database for ETA tables (`eta_dev` when `ENVIRONMENT=dev`, else `eta`). */
export function getEtaDatabase(): (typeof ETA_DATABASES)[number] {
	return process.env.ENVIRONMENT === 'dev' ? 'eta_dev' : 'eta';
}

/** Fully qualified table name in the active ETA database. */
export function qualifiedTable(table: string): string {
	return `${getEtaDatabase()}.${table}`;
}

/** Replaces `{database}` placeholders after resolving the active ETA database. */
export function substituteEtaDatabase(sql: string): string {
	const database = getEtaDatabase();
	if (!ETA_DATABASES.includes(database)) {
		throw new Error(`Invalid ETA database name: ${database}`);
	}
	return sql.replaceAll('{database}', database);
}
