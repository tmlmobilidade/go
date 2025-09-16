'use client';

/* * */

import { QuickLinkButton } from '@/components/home/QuickLinkButton';
import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { QuickLink } from '@/types/quick-links';
import { IconChartBubble, IconEaseOutControlPointFilled, IconFileCertificate, IconFileInfo, IconFileTypeSql, IconFlag, IconListNumbers, IconMessageUser, IconPlant2, IconTicket, IconTransferIn, IconUmbrella } from '@tabler/icons-react';
import { Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function QuickLinks() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	const iconMap: Record<string, React.ReactNode> = {
		IconChartBubble: <IconChartBubble size={40} />,
		IconEaseOutControlPointFilled: <IconEaseOutControlPointFilled size={40} />,
		IconFileCertificate: <IconFileCertificate size={40} />,
		IconFileInfo: <IconFileInfo size={40} />,
		IconFileTypeSql: <IconFileTypeSql size={40} />,
		IconFlag: <IconFlag size={40} />,
		IconListNumbers: <IconListNumbers size={40} />,
		IconMessageUser: <IconMessageUser size={40} />,
		IconPlant2: <IconPlant2 size={40} />,
		IconTicket: <IconTicket size={40} />,
		IconTransferIn: <IconTransferIn size={40} />,
		IconUmbrella: <IconUmbrella size={40} />,
	};

	const quickLinks: QuickLink[] = organizationDetailContext.data?.home_links.map(item => ({
		href: item.href,
		icon: iconMap[item.icon as keyof typeof iconMap] || <IconFileInfo size={40} />,
		title: item.title,
	}));

	//

	// B. Transform data

	//
	// C. Render components
	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{quickLinks.map(item => (
					<QuickLinkButton key={`${item.title}-${item.href}`} item={item} />
				))}
			</Grid>
		</Section>
	);
}
