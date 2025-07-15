/* * */

import { PermissionsAgencies } from '@/components/permissions/agencies';
import { PermissionsAlerts } from '@/components/permissions/alerts';
import { PermissionsFiles } from '@/components/permissions/files';
import { PermissionsHashedShapes } from '@/components/permissions/hashed-shapes';
import { PermissionsHashedTrips } from '@/components/permissions/hashed-trips';
import { PermissionsMunicipalities } from '@/components/permissions/municipalities';
import { PermissionsOrganizations } from '@/components/permissions/organizations';
import { PermissionsPlans } from '@/components/permissions/plans';
import { PermissionsRides } from '@/components/permissions/rides';
import { PermissionsRoles } from '@/components/permissions/roles';
import { PermissionsSessions } from '@/components/permissions/sessions';
import { PermissionsStops } from '@/components/permissions/stops';
import { PermissionsUsers } from '@/components/permissions/users';
import { PermissionsValidations } from '@/components/permissions/validations';

/* * */

import { Permission } from '@tmlmobilidade/types';

import { PermissionSectionInputProps, WithResourceToggle } from '../PermissionSection';

/* * */

export function PermissionSectionGroup({ onResourceToggle, onToggle, permissions }: WithResourceToggle<PermissionSectionInputProps, Permission<unknown>>) {
	return (
		<>
			<PermissionsAgencies onToggle={onToggle} permissions={permissions} />
			<PermissionsAlerts onToggle={onToggle} permissions={permissions} />
			<PermissionsFiles onToggle={onToggle} permissions={permissions} />
			<PermissionsHashedShapes onToggle={onToggle} permissions={permissions} />
			<PermissionsHashedTrips onToggle={onToggle} permissions={permissions} />
			<PermissionsMunicipalities onToggle={onToggle} permissions={permissions} />
			<PermissionsOrganizations onToggle={onToggle} permissions={permissions} />
			{/* @ts-expect-error - Infered type */}
			<PermissionsPlans onResourceToggle={onResourceToggle} onToggle={onToggle} permissions={permissions} />
			<PermissionsRides onToggle={onToggle} permissions={permissions} />
			<PermissionsRoles onToggle={onToggle} permissions={permissions} />
			<PermissionsSessions onToggle={onToggle} permissions={permissions} />
			<PermissionsStops onToggle={onToggle} permissions={permissions} />
			<PermissionsUsers onToggle={onToggle} permissions={permissions} />
			{/* @ts-expect-error - Infered type */}
			<PermissionsValidations onResourceToggle={onResourceToggle} onToggle={onToggle} permissions={permissions} />
		</>
	);
}
