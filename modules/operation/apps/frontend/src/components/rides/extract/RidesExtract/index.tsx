'use client';

import { Pane, Section, Select } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RidesExtractHeader } from '../RidesExtractHeader';
import { RidesExtractV1 } from '../versions/v1/RidesExtractV1';
import { RidesExtractV2 } from '../versions/v2/RidesExtractV2';

/* * */

export function RidesExtract() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [selectedVersion, setSelectedVersion] = useState<string>('operation-rides-v1');

	//
	// B. Render components

	return (
		<Pane header={[<RidesExtractHeader key="header" />]}>
			<Section>
				<Select
					label={t('default:rides.extract.RidesExtract.fields.version.label')}
					onChange={setSelectedVersion}
					value={selectedVersion}
					data={[
						{ label: t('shared:extractions.versions.operation-rides-v1.title'), value: 'operation-rides-v1' },
						{ label: t('shared:extractions.versions.operation-rides-v2.title'), value: 'operation-rides-v2' },
					]}
				/>
			</Section>

			{selectedVersion === 'operation-rides-v1' && <RidesExtractV1 />}
			{selectedVersion === 'operation-rides-v2' && <RidesExtractV2 />}

		</Pane>
	);
}
