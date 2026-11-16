/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UserSessionReplayAuthorization, UserSessionReplayAuthorizationSchema } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { randomUUID } from 'node:crypto';

import { isSessionReplayAuthorized } from './session-replay-state.js';

/* * */

/** Read fresh authorization instead of the authentication snapshot. */
export async function getUserSessionReplay(userId: string): Promise<null | UserSessionReplayAuthorization> {
	const user = await goDb.core.users.findById(userId, { projection: { session_replay: 1 } });

	if (!user) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');

	return user.session_replay ? UserSessionReplayAuthorizationSchema.parse(user.session_replay) : null;
}

/* * */

/** Concurrent requests reuse valid authorization without renewing its deadline. */
export async function authorizeUserSessionReplay(userId: string, requestedBy: string): Promise<UserSessionReplayAuthorization> {
	//
	// Prepare authorization

	const collection = await goDb.core.users.getCollection();
	const now = Dates.now('Europe/Lisbon');

	const authorization = UserSessionReplayAuthorizationSchema.parse({
		activation_id: randomUUID(),
		pending_expires_at: now.plus({ days: 1 }).startOf('day').unix_milliseconds,
		requested_at: now.unix_milliseconds,
		requested_by: requestedBy,
	});

	//
	// Create authorization

	const user = await collection.findOneAndUpdate({
		_id: userId,
		$or: [
			{ session_replay: null },
			{ 'session_replay.cancelled_at': { $ne: null } },
			{ 'session_replay.pending_expires_at': { $lte: now.unix_milliseconds }, 'session_replay.started_at': null },
			{ 'session_replay.expires_at': { $lte: now.unix_milliseconds } },
		],
	}, { $set: { session_replay: authorization, updated_at: now.unix_milliseconds } }, {
		includeResultMetadata: false,
		projection: { session_replay: 1 },
		returnDocument: 'after',
	});

	if (user?.session_replay) return UserSessionReplayAuthorizationSchema.parse(user.session_replay);

	//
	// Return current authorization

	const current = await getUserSessionReplay(userId);

	if (current && isSessionReplayAuthorized(current, Dates.now('utc').unix_milliseconds)) return current;

	throw new HttpException(HTTP_STATUS.CONFLICT, 'Session replay authorization changed; retry the request');
}

/* * */

/** The first accepted start sets a deadline shared by all subsequent starts. */
export async function startUserSessionReplay(userId: string, activationId: string): Promise<UserSessionReplayAuthorization> {
	//
	// Start capture

	const collection = await goDb.core.users.getCollection();
	const now = Dates.now('utc');

	const user = await collection.findOneAndUpdate({
		'_id': userId,
		'session_replay.activation_id': activationId,
		'session_replay.cancelled_at': null,
		'session_replay.pending_expires_at': { $gt: now.unix_milliseconds },
		'session_replay.started_at': null,
	}, { $set: {
		'session_replay.expires_at': now.plus({ minutes: 5 }).unix_milliseconds,
		'session_replay.started_at': now.unix_milliseconds,
		'updated_at': now.unix_milliseconds,
	} }, { includeResultMetadata: false, projection: { session_replay: 1 }, returnDocument: 'after' });

	if (user?.session_replay) return UserSessionReplayAuthorizationSchema.parse(user.session_replay);

	//
	// Return current authorization

	const current = await getUserSessionReplay(userId);

	if (
		current?.activation_id === activationId
		&& current.started_at !== null
		&& isSessionReplayAuthorized(current, Dates.now('utc').unix_milliseconds)
	) return current;

	throw new HttpException(HTTP_STATUS.CONFLICT, 'Session replay authorization is expired, cancelled or replaced');
}

/* * */

/** Match the activation ID so delayed requests cannot cancel a newer authorization. */
export async function cancelUserSessionReplay(userId: string, activationId: string): Promise<void> {
	//
	// Cancel authorization

	const collection = await goDb.core.users.getCollection();
	const now = Dates.now('utc').unix_milliseconds;

	const user = await collection.findOneAndUpdate({
		'_id': userId,
		'$or': [
			{ 'session_replay.pending_expires_at': { $gt: now }, 'session_replay.started_at': null },
			{ 'session_replay.expires_at': { $gt: now }, 'session_replay.started_at': { $ne: null } },
		],
		'session_replay.activation_id': activationId,
		'session_replay.cancelled_at': null,
	}, { $set: { 'session_replay.cancelled_at': now, 'updated_at': now } }, { includeResultMetadata: false, projection: { session_replay: 1 }, returnDocument: 'after' });

	if (user) return;

	//
	// Check current authorization

	const current = await getUserSessionReplay(userId);

	if (current?.activation_id === activationId && !isSessionReplayAuthorized(current, Dates.now('utc').unix_milliseconds)) return;

	throw new HttpException(HTTP_STATUS.CONFLICT, 'Session replay authorization changed; reload before cancelling');
}
