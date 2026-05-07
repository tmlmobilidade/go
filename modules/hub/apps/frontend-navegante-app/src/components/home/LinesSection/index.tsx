'use client';

/* * */

import { Section } from '@/components/layout/Section';
import { LinesList } from '@/components/lines/LinesList';

/* * */

export function LinesSection() {
	//

	//
	// A. Render components

	return (
		<Section href="/?section=lines" withGap>
			<LinesList />
		</Section>
	);

	//
}
