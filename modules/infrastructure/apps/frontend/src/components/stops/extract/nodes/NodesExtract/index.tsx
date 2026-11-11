'use client';

import { Pane, Section, Select } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NodesExtractHeader } from '../NodesExtractHeader';
import { NodesExtractV1 } from '../versions/infrastructure-nodes-v1/NodesExtractV1';

/* * */

export function NodesExtract() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [selectedVersion, setSelectedVersion] = useState<string>('infrastructure-nodes-v1');

	//
	// B. Render components

	return (
		<Pane header={[<NodesExtractHeader key="header" />]}>
			<Section>
				<Select
					label={t('stops:extract.NodesExtract.label')}
					onChange={setSelectedVersion}
					value={selectedVersion}
					data={[
						{ label: t('shared:extractions.versions.infrastructure-nodes-v1.title'), value: 'infrastructure-nodes-v1' },
					]}
				/>
			</Section>

			{selectedVersion === 'infrastructure-nodes-v1' && <NodesExtractV1 />}

		</Pane>
	);
}
