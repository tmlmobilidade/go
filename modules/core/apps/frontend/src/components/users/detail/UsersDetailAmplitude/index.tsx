'use client';

import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { UsersDetailSessionReplay } from '../UsersDetailSessionReplay';

/* * */

export function UsersDetailAmplitude() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible description={t('default:users.detail.Amplitude.description')} title={t('default:users.detail.Amplitude.title')}>
			<Section>
				<Grid columns="ab" gap="md">
					<UsersDetailSessionReplay />
				</Grid>
			</Section>
		</Collapsible>
	);
}
