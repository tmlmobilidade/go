'use client';

import { BackButton } from '@/components/common/BackButton';
import { Section } from '@tmlmobilidade/ui';

/* * */

export function StopsDetailNavigation() {
	return (
		<Section padding="md">
			<BackButton href="/?section=stops" />
		</Section>
	);
}
