'use client';

import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

import { ChangelogDetailContent } from '../ChangelogDetailContent';
import { useChangelogDetailFormContext } from '../ChangelogDetailForm.context';
import { ChangelogDetailHeader } from '../ChangelogDetailHeader';
import { ChangelogDetailItems } from '../ChangelogDetailItems';

/* * */

export function ChangelogDetail() {
	//

	//
	// A. Setup variables

	const { data, error, status } = useChangelogDetailFormContext();

	//
	// B. Render components

	if (status.isLoading) return <LoadingOverlay />;
	if (error) return <ErrorDisplay message={error} />;
	if (!data) return null;

	return (
		<Pane header={[<ChangelogDetailHeader key="header" />]}>
			<ChangelogDetailContent />
			<ChangelogDetailItems />
		</Pane>
	);
}
