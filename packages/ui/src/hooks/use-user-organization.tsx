'use client';
import { getModuleConfig, HttpException } from '@tmlmobilidade/consts';
import { type Organization } from '@tmlmobilidade/types';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { useMeContext } from '../contexts/Me.context';

/* * */

/*
 * A hook to get user organization as state.
 * @returns The current organization value.
 */

export function useUserOrganization(): [Organization | undefined, (value: Organization | undefined) => void] {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const { data: raw, error: error, isLoading: loading } = useSWR<Organization[], HttpException>(`${getModuleConfig('auth', 'api_url')}/organizations`);
	const [orgData, setOrgData] = useState<Organization | undefined>(undefined);

	//
	// B. Handle actions

	useEffect(() => {
		if (!raw || !meContext.data.user?.organization_id || error) return;
		(async () => {
			const org = await getOrganizationByID(meContext.data.user?.organization_id || '');
			setOrgData(org);
		})();
	}, [raw, meContext.data.user, loading]);

	const getOrganizationByID = async (id: string) => {
		if (!raw) return undefined;

		const foundOrg: Organization | undefined = raw.find(org => org._id === id);

		if (foundOrg) setOrgData(foundOrg);
		return foundOrg;
	};

	//
	// C. Render components

	return [orgData, setOrgData];

	//
}
