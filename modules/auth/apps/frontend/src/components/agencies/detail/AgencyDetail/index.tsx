'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { AgencyDetailHeader } from '@/components/agencies/detail/AgencyDetailHeader';
import { AgencySectionAlertsMap } from '@/components/agencies/detail/AgencySectionAlertsMap';
import { AgencyDetailBasicInfo } from '@/components/agencies/detail/AgencySectionBasicInfo';
import { AgencySectionContacts } from '@/components/agencies/detail/AgencySectionContacts';
import { AgencySectionFinancials } from '@/components/agencies/detail/AgencySectionFinancials';
import { AgencySectionValidationRules } from '@/components/agencies/detail/AgencySectionValidationRules';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function AgencyDetail() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	if (agencyDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (agencyDetailContext.flags.error) {
		return <ErrorDisplay message={agencyDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<AgencyDetailHeader key="header" />]}>
			<AgencyDetailBasicInfo />
			<AgencySectionFinancials />
			{/* <AgencySectionContacts /> */}
			{/* <AgencySectionValidationRules /> */}
			{/* <AgencySectionAlertsMap /> */}
		</Pane>
	);

	//
}
