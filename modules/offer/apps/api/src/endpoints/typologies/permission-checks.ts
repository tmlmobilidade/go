/* * */

import { PermissionCatalog, type PermissionResourceCheck } from '@tmlmobilidade/go-types-permissions';

/* * */

export const TYPOLOGIES_READ_PERMISSION_CHECKS: PermissionResourceCheck[] = [
	{ action: PermissionCatalog.all.lines.actions.read, scope: PermissionCatalog.all.lines.scope },
	{ action: PermissionCatalog.all.lines.actions.update, scope: PermissionCatalog.all.lines.scope },
	{ action: PermissionCatalog.all.typologies.actions.nav, scope: PermissionCatalog.all.typologies.scope },
];
