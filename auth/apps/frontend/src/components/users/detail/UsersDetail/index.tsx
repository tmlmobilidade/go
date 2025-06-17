'use client';

/* * */

import { PermissionsAgencies } from '@/components/users/detail/PermissionsAgencies';
import { PermissionsAlerts } from '@/components/users/detail/PermissionsAlerts';
import { PermissionsFiles } from '@/components/users/detail/PermissionsFiles';
import { PermissionsHashedShapes } from '@/components/users/detail/PermissionsHashedShapes';
import { PermissionsHashedTrips } from '@/components/users/detail/PermissionsHashedTrips';
import { PermissionsMunicipalities } from '@/components/users/detail/PermissionsMunicipalities';
import { PermissionsOrganizations } from '@/components/users/detail/PermissionsOrganizations';
import { PermissionsPlans } from '@/components/users/detail/PermissionsPlans';
import { PermissionsRides } from '@/components/users/detail/PermissionsRides';
import { PermissionsRoles } from '@/components/users/detail/PermissionsRoles';
import { PermissionsSessions } from '@/components/users/detail/PermissionsSessions';
import { PermissionsStops } from '@/components/users/detail/PermissionsStops';
import { PermissionsUsers } from '@/components/users/detail/PermissionsUsers';
import { PermissionsValidations } from '@/components/users/detail/PermissionsValidations';

/* * */

import { UsersDetailBasicInfo } from '@/components/users/detail/UsersDetailBasicInfo';
import { UsersDetailHeader } from '@/components/users/detail/UsersDetailHeader';
import { UsersDetailRoles } from '@/components/users/detail/UsersDetailRoles';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function UsersDetail() {
	return (
		<Pane header={[<UsersDetailHeader />]}>
			<UsersDetailBasicInfo />
			<UsersDetailRoles />
			<PermissionsAgencies />
			<PermissionsAlerts />
			<PermissionsFiles />
			<PermissionsHashedShapes />
			<PermissionsHashedTrips />
			<PermissionsMunicipalities />
			<PermissionsOrganizations />
			<PermissionsPlans />
			<PermissionsRides />
			<PermissionsRoles />
			<PermissionsSessions />
			<PermissionsStops />
			<PermissionsUsers />
			<PermissionsValidations />
		</Pane>
	);
}
