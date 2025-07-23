/* * */

import { QuickLink } from '@/types/quick-links';
import { Grid, Pane, Section } from '@tmlmobilidade/ui';

import { QuickLinkButton } from '../QuickLink';
import { quickLinks } from '../QuickLink/data';
import { WikiTable } from '../wikiTable';

export function HomePage() {
	return (

		<Pane>
			<Section padding="lg">
				<Grid columns="abcd" gap="md">
					{quickLinks.map((item: QuickLink) => (
						<QuickLinkButton key={item.href} item={item} />
					))}
				</Grid>
			</Section>

			<WikiTable />
		</Pane>
	);
}
