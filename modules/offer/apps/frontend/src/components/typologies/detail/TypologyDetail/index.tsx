'use client';

import { useTypologyDetailContext } from '@/components/typologies/detail/TypologyDetail.context';
import { TypologyDetailHeader } from '@/components/typologies/detail/TypologyDetailHeader';
import { TypologyDetailSectionConfig } from '@/components/typologies/detail/TypologyDetailSectionConfig';
import { TypologyDetailSectionFares } from '@/components/typologies/detail/TypologyDetailSectionFares';
import { TypologyDetailSectionStyles } from '@/components/typologies/detail/TypologyDetailSectionStyles';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function TypologyDetail() {
	//

	//
	// A. Setup variables

	const typologyDetailContext = useTypologyDetailContext();

	//
	// B. Render components

	if (typologyDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (typologyDetailContext.flags.error) {
		return <ErrorDisplay message={typologyDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<TypologyDetailHeader />]}>
			<TypologyDetailSectionConfig />
			<TypologyDetailSectionStyles />
			<TypologyDetailSectionFares />
		</Pane>
	);

	//
}
