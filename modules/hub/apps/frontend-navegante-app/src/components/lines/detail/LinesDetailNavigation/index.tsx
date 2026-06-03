'use client';

import { BackButton } from '@/components/common/BackButton';
import { Section } from '@tmlmobilidade/ui';

/* * */

export function LinesDetailNavigation() {
	return (
		<Section padding="md">
			<BackButton href="/?section=lines" />
		</Section>
	);
}
