'use client';

/* * */

import { QuickLinkButton } from '@/components/home/QuickLink';
import { QuickLink } from '@/types/quick-links';
import { IconBrandGithub, IconChartBubble, IconEaseOutControlPointFilled, IconFileCertificate, IconFileTypeSql, IconFlag, IconUmbrella } from '@tabler/icons-react';
import { Grid, Pane, Section } from '@tmlmobilidade/ui';

/* * */

const QUICK_LINKS: QuickLink[] = [
	{ href: 'https://go.carrismetropolitana.pt', icon: <IconFlag size={50} />, title: 'GO v1' },
	{ href: 'https://eu.remix.com', icon: <IconEaseOutControlPointFilled size={50} />, title: 'Remix' },
	{ href: 'https://dados.tmlmobilidade.pt', icon: <IconFileTypeSql size={50} />, title: 'BDH' },
	{ href: 'http://filedoc.tmlmobilidade.pt', icon: <IconFileCertificate size={50} />, title: 'Filedoc' },
	{ href: 'https://consola.tmlmobilidade.pt/managementconsole/offer-manager/planned-offer', icon: <IconUmbrella size={50} />, title: 'PCGI' },
	{ href: 'https://app.eu.amplitude.com/analytics/tmlmobilidade/home', icon: <IconChartBubble size={50} />, title: 'Amplitude' },
	{ href: 'https://github.com/carrismetropolitana', icon: <IconBrandGithub size={50} />, title: 'Github' },
];

/* * */

export function HomePage() {
	return (
		<Pane>
			<Section padding="lg">
				<Grid columns="abcd" gap="md">
					{QUICK_LINKS.map(item => (
						<QuickLinkButton key={item.href} item={item} />
					))}
				</Grid>
			</Section>
		</Pane>
	);
}
