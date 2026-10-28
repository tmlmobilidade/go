'use client';

import { Pane, Section, Select } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StopsExtractHeader } from '../StopsExtractHeader';
import { StopsExtractV1 } from '../versions/infrastructure-stops-v1/StopsExtractV1';

/* * */

export function StopsExtract() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [selectedVersion, setSelectedVersion] = useState<string>('infrastructure-stops-v1');

	//
	// B. Render components

	return (
		<Pane header={[<StopsExtractHeader key="header" />]}>
			<Section>
				<Select
					label={t('default:rides.extract.RidesExtract.fields.version.label')}
					onChange={setSelectedVersion}
					value={selectedVersion}
					data={[
						{ label: t('shared:extractions.versions.infrastructure-stops-v1.title'), value: 'infrastructure-stops-v1' },
					]}
				/>
			</Section>

			{selectedVersion === 'infrastructure-stops-v1' && <StopsExtractV1 />}

		</Pane>
	);
}
