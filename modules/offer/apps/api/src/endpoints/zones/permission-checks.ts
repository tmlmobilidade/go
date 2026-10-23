/* * */

import { PermissionCatalog, type PermissionResourceCheck } from '@tmlmobilidade/go-types-permissions';

/* * */

export const ZONES_READ_PERMISSION_CHECKS: PermissionResourceCheck[] = [
	{ action: PermissionCatalog.all.lines.actions.read, scope: PermissionCatalog.all.lines.scope },
	{ action: PermissionCatalog.all.lines.actions.update, scope: PermissionCatalog.all.lines.scope },
	{ action: PermissionCatalog.all.zones.actions.nav, scope: PermissionCatalog.all.zones.scope },
];
