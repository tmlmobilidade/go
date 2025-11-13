/* * */

import { Logger } from '@tmlmobilidade/logger';
import pg from 'pg';

/* * */

const client = new pg.Client({
	connectionTimeoutMillis: 10000,
	database: process.env.BRIDGEDB_DB,
	host: process.env.BRIDGEDB_HOST,
	password: process.env.BRIDGEDB_PASSWORD,
	port: Number(process.env.BRIDGEDB_PORT) || 5432,
	user: process.env.BRIDGEDB_USER,
});

async function connect() {
	await client.connect();
	Logger.success('Connected to BRIDGEDB');
}

async function disconnect() {
	await client.end();
	Logger.success('Disconnected from BRIDGEDB');
}

/* * */

export const BRIDGEDB = {
	client,
	connect,
	disconnect,
};
