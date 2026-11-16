'use client';

import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

import { BannersDetailContent } from '../BannersDetailContent';
import { useBannersDetailFormContext } from '../BannersDetailForm.context';
import { BannersDetailHeader } from '../BannersDetailHeader';
import { BannersDetailSchedule } from '../BannersDetailSchedule';

/* * */

export function BannersDetail() {
	//

	//
	// A. Setup variables

	const { data, error, status } = useBannersDetailFormContext();

	//
	// B. Render components

	if (status.isLoading) return <LoadingOverlay />;
	if (error) return <ErrorDisplay message={error} />;
	if (!data) return null;

	return (
		<Pane header={[<BannersDetailHeader key="header" />]}>
			<BannersDetailContent />
			<BannersDetailSchedule />
		</Pane>
	);
}
