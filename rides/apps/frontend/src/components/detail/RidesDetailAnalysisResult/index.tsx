'use client';

/* * */

import { type RidesDetailAnalysisResultItem } from '@/components/detail/RidesDetailAnalysisResultItem';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';

/* * */

export function RidesDetailAnalysisResult() {
	//

	//
	// A. Setup variables

	const t = useTranslations('detail.RidesDetailAnalysisResult');

	const ridesDetailContext = useRidesDetailContext();

	//
	// C. Render components

	if (!ridesDetailContext.data.ride?.analysis) {
		return (
			<Collapsible description="Eventos dos veículos mapeados" title="Resultado das Análises">
				<Section>
					<Label size="lg" caps>Sem Dados</Label>
				</Section>
			</Collapsible>
		);
	}

	return (
		<Collapsible description="Eventos dos veículos mapeados" title="Resultado das Análises">
			<Section>
				<Grid columns="abcd" gap="md">
					{ridesDetailContext.data.ride?.analysis?.map(item => (
						<RidesDetailAnalysisResultItem
							key={item._id}
							_id={item._id}
							description={t(`${item._id}.description`)}
							grade={item.grade}
							title={t(`${item._id}.title`)}
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
