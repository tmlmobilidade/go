'use client';

import { useMemo } from 'react';

import { useAgenciesOrganizationsData } from '../shared/use-agencies-organizations-data';
import { useAgenciesDetailAgencyId } from './use-agencies-detail-agency-id';

/* * */

/**
 * Fetches organizations associated with the current agency.
 */
export function useAgenciesDetailOrganizationsData() {
	//

	//
	// A. Setup variables

	const { agencyId } = useAgenciesDetailAgencyId();
	const organizationsData = useAgenciesOrganizationsData();

	//
	// B. Transform data

	const organizations = useMemo(() => organizationsData.data.filter(organization => organization.agency_ids?.includes(agencyId)), [agencyId, organizationsData.data]);

	//
	// C. Return data

	return useMemo(() => ({ ...organizationsData, data: organizations }), [organizations, organizationsData]);
}
