'use client';

import { useValidationDetailContext } from '@/contexts/ValidationDetail.context';
import { Loader, Pane } from '@tmlmobilidade/ui';

import { ValidationDetailHeader } from '../ValidationDetailHeader';
import { ValidationDetailSectionFiles } from '../ValidationDetailSectionFiles';
import { ValidationDetailSectionInfo } from '../ValidationDetailSectionInfo';
import { ValidationDetailSectionSummary } from '../ValidationDetailSectionSummary';
/* * */

export function ValidationDetail() {
	//

	//
	// A. Render components

	const { flags: { loading } } = useValidationDetailContext();
	if (loading) return <Loader />;

	return (
		<Pane header={[<ValidationDetailHeader />]}>
			<ValidationDetailSectionInfo />
			<ValidationDetailSectionFiles />
			<ValidationDetailSectionSummary />
		</Pane>
	);
}
