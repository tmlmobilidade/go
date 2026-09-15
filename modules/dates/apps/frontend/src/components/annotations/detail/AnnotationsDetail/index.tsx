'use client';

import { AnnotationsDetailBasicInfo } from '@/components/annotations/detail/AnnotationsDetailBasicInfo';
import { AnnotationsDetailDates } from '@/components/annotations/detail/AnnotationsDetailDates';
import { AnnotationsDetailHeader } from '@/components/annotations/detail/AnnotationsDetailHeader';
import { ErrorDisplay, Pane } from '@tmlmobilidade/ui';

import { useAnnotationsDetailData } from '../use-annotations-detail-data';

/* * */

export function AnnotationsDetail() {
	//

	//
	// A. Setup variables

	const { error, isLoading } = useAnnotationsDetailData();

	//
	// B. Render components

	return (
		<Pane header={[<AnnotationsDetailHeader key="header" />]} isLoading={isLoading}>
			{error && <ErrorDisplay message={error} />}
			<AnnotationsDetailBasicInfo />
			<AnnotationsDetailDates />
		</Pane>
	);
}
