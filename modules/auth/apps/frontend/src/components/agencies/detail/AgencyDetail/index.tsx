'use client';

/* * */

import { AgencyDetailHeader } from '@/components/agencies/detail/AgencyDetailHeader';
import { AgencyDetailBasicInfo } from '@/components/agencies/detail/AgencySectionBasicInfo';
import { AgencySectionContacts } from '@/components/agencies/detail/AgencySectionContacts';
import { AgencySectionFinacial } from '@/components/agencies/detail/AgencySectionFinacial';
import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function AgencyDetail() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	if (agencyDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (agencyDetailContext.flags.error) {
		return <ErrorDisplay message={agencyDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<AgencyDetailHeader />]}>
			<AgencyDetailBasicInfo />
			<AgencySectionFinacial />
			<AgencySectionContacts />
		</Pane>
	);

	//
}
