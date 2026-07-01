/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

export type OfferCatalogScope = 'fares' | 'typologies' | 'zones';

/* * */

type AgencyScopedPermission = Permission & {
	resources?: {
		agency_ids?: string[]
	}
};

interface OfferCatalogAgencyAccess {
	agencyIds: string[]
	allowAll: boolean
}

/* * */

function getAgencyIdsFromPermission(permission: Permission | undefined): string[] {
	return (permission as AgencyScopedPermission | undefined)?.resources?.agency_ids ?? [];
}

function findPermission(permissionEntries: Permission[], scope: Permission['scope'], action: string): Permission | undefined {
	return permissionEntries.find(permission => permission.scope === scope && permission.action === action);
}

export function getOfferCatalogAgencyAccess(permissionEntries: Permission[], catalogScope: OfferCatalogScope): OfferCatalogAgencyAccess {
	//
	// A. Setup variables

	const permissions = [
		findPermission(permissionEntries, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read),
		findPermission(permissionEntries, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update),
		findPermission(permissionEntries, catalogScope, PermissionCatalog.all[catalogScope].actions.nav),
	];

	const agencyIds = new Set<string>();

	//
	// B. Collect agency ids

	for (const permission of permissions) {
		const permissionAgencyIds = getAgencyIdsFromPermission(permission);

		if (permissionAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			return { agencyIds: [], allowAll: true };
		}

		for (const agencyId of permissionAgencyIds) {
			agencyIds.add(agencyId);
		}
	}

	//
	// C. Return access

	return {
		agencyIds: [...agencyIds],
		allowAll: false,
	};
}

export function hasOfferCatalogReadAccess(permissionEntries: Permission[], catalogScope: OfferCatalogScope): boolean {
	const agencyAccess = getOfferCatalogAgencyAccess(permissionEntries, catalogScope);
	return agencyAccess.allowAll || agencyAccess.agencyIds.length > 0;
}

export function getOfferCatalogAgencyFilter(
	permissionEntries: Permission[],
	catalogScope: OfferCatalogScope,
): { agency_ids?: { $in: string[] } } {
	const agencyAccess = getOfferCatalogAgencyAccess(permissionEntries, catalogScope);

	if (agencyAccess.allowAll) {
		return {};
	}

	if (!agencyAccess.agencyIds.length) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, `You are not authorized to read ${catalogScope}`);
	}

	return { agency_ids: { $in: agencyAccess.agencyIds } };
}

export function hasOfferCatalogResourceReadAccess(
	permissionEntries: Permission[],
	catalogScope: OfferCatalogScope,
	agencyIds: string[],
): boolean {
	const agencyAccess = getOfferCatalogAgencyAccess(permissionEntries, catalogScope);

	if (agencyAccess.allowAll) {
		return true;
	}

	return agencyIds.some(agencyId => agencyAccess.agencyIds.includes(agencyId));
}
