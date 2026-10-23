'use client';

import { ErrorDisplay, Grid, Pane, Section } from '@tmlmobilidade/ui';

import { AnnotationsDatesSelector } from '../AnnotationsDatesSelector';
import { AnnotationsDetailBasicInfo } from '../AnnotationsDetailBasicInfo';
import { AnnotationsDetailHeader } from '../AnnotationsDetailHeader';
import { useAnnotationsDetailData } from '../use-annotations-detail-data';

/* * */

export function AnnotationsDetail() {
	//

	//
	// A. Fetch data

	const { error, isLoading } = useAnnotationsDetailData();

	//
	// B. Render components

	return (
		<Pane header={[<AnnotationsDetailHeader key="header" />]} isLoading={isLoading}>
			{error ? (
				<ErrorDisplay message={error} />
			) : (
				<Section>
					<Grid columns="a" gap="lg">
						<AnnotationsDetailBasicInfo />
						<AnnotationsDatesSelector />
					</Grid>
				</Section>
			)}
		</Pane>
	);

	//
}
