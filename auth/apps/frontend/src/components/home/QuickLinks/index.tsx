'use client';

/* * */

import { QuickLinkButton } from '@/components/home/QuickLinkButton';
import { QuickLink } from '@/types/quick-links';
import { IconChartBubble, IconEaseOutControlPointFilled, IconFileCertificate, IconFileInfo, IconFileTypeSql, IconFlag, IconListNumbers, IconMessageUser, IconPlant2, IconTicket, IconTransferIn, IconUmbrella } from '@tabler/icons-react';
import { Grid, Section } from '@tmlmobilidade/ui';

/* * */

const QUICK_LINKS: QuickLink[] = [
	{ href: 'https://go.carrismetropolitana.pt', icon: <IconFlag size={40} />, title: 'GO v1' },
	{ href: 'https://eu.remix.com', icon: <IconEaseOutControlPointFilled size={40} />, title: 'Remix' },
	{ href: 'https://dados.tmlmobilidade.pt', icon: <IconFileTypeSql size={40} />, title: 'BDH' },
	{ href: 'https://app.powerbi.com/groups/a314fe73-6989-4d83-b8c9-81812e4eab7d/reports/8f1e0f02-cf87-45ce-9b12-9b0515be2e19?experience=power-bi', icon: <IconPlant2 size={40} />, title: 'PBI Reclamações' },
	{ href: 'https://github.com/carrismetropolitana/datasets', icon: <IconListNumbers size={40} />, title: 'Datasets' },
	{ href: 'https://app.eu.amplitude.com/analytics/tmlmobilidade/home', icon: <IconChartBubble size={40} />, title: 'Amplitude' },
	{ href: '#', icon: <IconFileInfo size={40} />, title: 'Loop' },
	{ href: 'http://filedoc.tmlmobilidade.pt', icon: <IconFileCertificate size={40} />, title: 'Filedoc' },
	{ href: 'https://consola.tmlmobilidade.pt/managementconsole/offer-manager/planned-offer', icon: <IconUmbrella size={40} />, title: 'PCGI' },
	{ href: 'https://intranet.tmlmobilidade.pt', icon: <IconTransferIn size={40} />, title: 'Intranet' },
	{ href: 'https://helpdesk.tmlmobilidade.pt', icon: <IconTicket size={40} />, title: 'Helpdesk ITS' },
	{ href: 'https://crm.tmlmobilidade.pt', icon: <IconMessageUser size={40} />, title: 'CRM' },
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
