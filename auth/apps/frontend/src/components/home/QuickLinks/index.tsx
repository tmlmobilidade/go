'use client';

/* * */

import { QuickLinkButton } from '@/components/home/QuickLinkButton';
import { QuickLink } from '@/types/quick-links';
import { IconChartBubble, IconEaseOutControlPointFilled, IconFileCertificate, IconFileInfo, IconFileTypeSql, IconFlag, IconListNumbers, IconPlant2, IconTicket, IconTransferIn, IconUmbrella } from '@tabler/icons-react';
import { Grid, Section } from '@tmlmobilidade/ui';

/* * */

const QUICK_LINKS: QuickLink[] = [
	{ href: 'https://go.carrismetropolitana.pt', icon: <IconFlag size={40} />, title: 'GO v1' },
	{ href: 'https://eu.remix.com', icon: <IconEaseOutControlPointFilled size={40} />, title: 'Remix' },
	{ href: 'https://dados.tmlmobilidade.pt', icon: <IconFileTypeSql size={40} />, title: 'BDH' },
	{ href: '#', icon: <IconPlant2 size={40} />, title: 'PBI Reclamações' },
	{ href: 'https://github.com/carrismetropolitana/datasets', icon: <IconListNumbers size={40} />, title: 'Datasets' },
	{ href: 'https://app.eu.amplitude.com/analytics/tmlmobilidade/home', icon: <IconChartBubble size={40} />, title: 'Amplitude' },
	{ href: '#', icon: <IconFileInfo size={40} />, title: 'Loop' },
	{ href: 'http://filedoc.tmlmobilidade.pt', icon: <IconFileCertificate size={40} />, title: 'Filedoc' },
	{ href: 'https://consola.tmlmobilidade.pt/managementconsole/offer-manager/planned-offer', icon: <IconUmbrella size={40} />, title: 'PCGI' },
	{ href: '#', icon: <IconTransferIn size={40} />, title: 'Intranet' },
	{ href: 'https://helpdesk.tmlmobilidade.pt', icon: <IconTicket size={40} />, title: 'Helpdesk ITS' },
];

/* * */

export function QuickLinks() {
	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{QUICK_LINKS.map(item => (
					<QuickLinkButton key={`${item.title}-${item.href}`} item={item} />
				))}
			</Grid>
		</Section>
	);
}
