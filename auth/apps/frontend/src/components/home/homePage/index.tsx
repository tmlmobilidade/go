/* * */

import { Grid, Pane, Section } from '@tmlmobilidade/ui';

import { QuickLinkButton } from '../QuickLink';

export function HomePage() {
	return (

		<Pane>
			<Section padding="lg">
				<p>teste</p>
				{/* <Grid columns="abcd" gap="md">
					{quickLinks.map(item => (
						<QuickLinkButton key={item.href} item={item} />
					))}
				</Grid> */}

			</Section>
		</Pane>
	);
}
