'use client';

import { TypologyDetailHeader } from '@/components/typologies/detail/TypologyDetailHeader';
import { TypologyDetailSectionConfig } from '@/components/typologies/detail/TypologyDetailSectionConfig';
import { TypologyDetailSectionFares } from '@/components/typologies/detail/TypologyDetailSectionFares';
import { TypologyDetailSectionStyles } from '@/components/typologies/detail/TypologyDetailSectionStyles';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

import { useTypologiesDetailData } from '../use-typologies-detail-data';

/* * */

export function TypologyDetail() {
	//

	//
	// A. Setup variables

	const { error, isLoading } = useTypologiesDetailData();

	//
	// B. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (error) {
		return <ErrorDisplay message={error} />;
	}

	return (
		<Pane header={[<TypologyDetailHeader key="header" />]}>
			<TypologyDetailSectionConfig />
			<TypologyDetailSectionStyles />
			<TypologyDetailSectionFares />
		</Pane>
	);

	//
}
