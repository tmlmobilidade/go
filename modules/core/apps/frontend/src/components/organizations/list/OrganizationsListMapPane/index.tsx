'use client';

import { ErrorDisplay, Pane } from '@tmlmobilidade/ui';

import { OrganizationsListMap } from '../OrganizationsListMap';
import { useOrganizationsListData } from '../use-organizations-list-data';

/* * */

export function OrganizationsListMapPane() {
	//

	//
	// A. Fetch data

	const { data, error } = useOrganizationsListData();

	//
	// B. Render components

	return (
		<Pane>
			{error && <ErrorDisplay message={error} />}
			<OrganizationsListMap organizations={data} />
		</Pane>
	);
}
