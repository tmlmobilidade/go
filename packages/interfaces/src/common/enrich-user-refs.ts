/* eslint-disable @typescript-eslint/no-explicit-any */
import { users } from '@/interfaces/auth/users.js';
import { type UserDisplay, UserDisplayFields } from '@tmlmobilidade/types';
import { FindOptions } from 'mongodb';

type AnyDoc = Record<string, any>;
type UserMap = Map<string, Partial<UserDisplay> & { _id: string }>;

const isUserRefKey = (k: string) => k === 'created_by' || k === 'updated_by';
const isEligibleId = (v: unknown) => typeof v === 'string' && v && v !== 'system';

function collectUserIds(input: unknown, out: Set<string>) {
	if (Array.isArray(input)) {
		for (const item of input) collectUserIds(item, out);
		return;
	}
	if (input && typeof input === 'object') {
		for (const [k, v] of Object.entries(input as AnyDoc)) {
			if (isUserRefKey(k) && isEligibleId(v)) out.add(v as string);
			collectUserIds(v, out);
		}
	}
}

function replaceRefs(input: unknown, map: UserMap): unknown {
	if (Array.isArray(input)) {
		return input.map(item => replaceRefs(item, map));
	}
	if (input && typeof input === 'object') {
		const obj = input as AnyDoc;
		const out: AnyDoc = Array.isArray(obj) ? [] : {};
		for (const [k, v] of Object.entries(obj)) {
			if (isUserRefKey(k) && typeof v === 'string' && v !== 'system') {
				const found = map.get(v);
				out[k] = found ?? v; // fallback to original id if user not found
			}
			else {
				out[k] = replaceRefs(v, map);
			}
		}
		return out;
	}
	return input;
}

async function fetchUsersMap(ids: Set<string>): Promise<UserMap> {
	if (ids.size === 0) return new Map();
	const coll = await users.getCollection();

	// Only fetch UserDisplay fields
	const projection: FindOptions['projection'] = Object.keys(UserDisplayFields).reduce((acc, field) => {
		acc[field] = 1;
		return acc;
	}, {} as Record<keyof typeof UserDisplayFields, number>);

	const result = await coll.find({ _id: { $in: Array.from(ids) } }, { projection }).toArray();
	const map: UserMap = new Map();
	for (const u of result) {
		map.set(u._id as unknown as string, {
			_id: u._id as unknown as string,
			avatar: u.avatar ?? undefined,
			email: u.email,
			first_name: u.first_name,
			last_name: u.last_name,
			phone: u.phone ?? undefined,
		});
	}
	return map;
}

export async function enrichUserRefs<T extends AnyDoc>(doc: T): Promise<T> {
	const ids = new Set<string>();
	collectUserIds(doc, ids);
	const map = await fetchUsersMap(ids);
	return replaceRefs(doc, map) as T;
}

export async function enrichUserRefsMany<T extends AnyDoc>(docs: T[]): Promise<T[]> {
	const ids = new Set<string>();
	for (const d of docs) collectUserIds(d, ids);
	const map = await fetchUsersMap(ids);
	return docs.map(d => replaceRefs(d, map) as T);
}
