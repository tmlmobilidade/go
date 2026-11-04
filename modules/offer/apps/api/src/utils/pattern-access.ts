/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Line, type Pattern, type Route } from '@tmlmobilidade/go-types-offer';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

interface PatternAccessOptions {
	action: 'create' | 'delete' | 'lock' | 'read' | 'update'
	pattern: Pick<Pattern, 'is_locked' | 'line_id' | 'route_id'>
	permissions: Permission[]
}

type PatternAccessResult = { error: string, status_code: '403' | '404' | '409', success: false } | { line: Line, route: Route, success: true };

/** Authorize a pattern through its persisted parent hierarchy; creation uses validated parent IDs. */
export async function authorizePatternAccess({ action, pattern, permissions }: PatternAccessOptions): Promise<PatternAccessResult> {
	//
	// Resolve both parents before using the line's operator to authorize access.

	const [line, route] = await Promise.all([
		goDb.offer.lines.findById(pattern.line_id),
		goDb.offer.routes.findById(pattern.route_id),
	]);
	if (!line || !route) {
		return { error: 'Pattern parent line or route not found', status_code: '404', success: false };
	}
	if (!PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.lines.actions[action],
		permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.lines.scope,
		value: [line.agency_id],
	})) {
		return { error: 'You are not authorized to access patterns for this agency', status_code: '403', success: false };
	}
	if (route.line_id !== line._id) {
		return { error: 'Pattern route does not belong to its line', status_code: '409', success: false };
	}

	//
	// Locks never prevent reads. Only the dedicated action may toggle an own lock.

	if (action !== 'read' && (line.is_locked || route.is_locked)) {
		return {
			error: line.is_locked ? 'The parent line is locked. Unlock the line first.' : 'The parent route is locked. Unlock the route first.',
			status_code: '409',
			success: false,
		};
	}
	if (action !== 'read' && action !== 'lock' && pattern.is_locked) {
		return { error: 'Pattern is locked. Unlock it first.', status_code: '409', success: false };
	}

	return { line, route, success: true };
}
