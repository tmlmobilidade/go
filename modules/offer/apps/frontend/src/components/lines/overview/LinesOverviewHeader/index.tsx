'use client';

import { Section, Text, Toolbar } from '@tmlmobilidade/ui';

import { useLinesOverviewContext } from '../LinesOverview.context';

/* * */

export function LinesOverviewHeader() {
	//

	//
	// A. Setup variables

	const linesOverviewContext = useLinesOverviewContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Section alignItems="center" flexDirection="row" gap="md" padding="none">
				<Text c="var(--color-system-text-200)" size="sm" weight="semibold">
					{linesOverviewContext.data.patternsLoading ? 'A carregar patterns...' : `${linesOverviewContext.data.patternsData.length} patterns`}
				</Text>
			</Section>
		</Toolbar>
	);

	//
}
