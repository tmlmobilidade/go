'use client';

import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { StopsDetailUpdateCoordinates } from '../coordinates/StopsDetailUpdateCoordinates';
import { StopsDetailUpdateName } from '../name/StopsDetailUpdateName';

/* * */

export function StopsDetailSectionGeneral() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:stops.detail.SectionGeneral.description')}
			title={t('default:stops.detail.SectionGeneral.title')}
		>

			<Section>
				<Grid columns="ab" gap="md" placeItems="start">
					<StopsDetailUpdateCoordinates />
					<StopsDetailUpdateName />
				</Grid>
			</Section>

		</Collapsible>
	);
}
