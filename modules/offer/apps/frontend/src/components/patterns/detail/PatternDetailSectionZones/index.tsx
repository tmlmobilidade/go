'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { StopsTable } from '@/components/patterns/table/StopsTable';
import { Collapsible, Section, Text } from '@tmlmobilidade/ui';

/* * */

export function PatternDetailSectionZones() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title="Afetação">
			<Section>
				{patternDetailContext.data.form.values.path?.length ? (
					<StopsTable />
				) : (
					<Text c="var(--color-system-text-200)" size="sm">
						Adicione paragens ao percurso para configurar a afetação por zona.
					</Text>
				)}
			</Section>
		</Collapsible>
	);

	//
}
