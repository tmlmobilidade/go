'use client';

/* * */

import { QuickLinks } from '@/components/home/QuickLinks';
import { WikiList } from '@/components/home/WikiList';
import { Divider, Pane } from '@tmlmobilidade/ui';

/* * */

export function HomePage() {
	return (
		<Pane>
			<QuickLinks />
			<Divider />
			<WikiList />
		</Pane>
	);
}
