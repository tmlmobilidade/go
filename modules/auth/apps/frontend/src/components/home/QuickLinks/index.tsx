'use client';

/* * */

import { QuickLinkButton } from '@/components/home/QuickLinkButton';
import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { iconMap } from '@/lib/icons';
import { HomeLink } from '@/types/quick-links';
import { IconFileInfo } from '@tabler/icons-react';
import { Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function QuickLinks() {
	//

	//
	// A. Setup variables

	const organizationDetailContext = useOrganizationsDetailContext();

	const quickLinks: HomeLink[] = organizationDetailContext.data?.form.values.home_links.map(item => ({
		href: item.href,
		icon: iconMap[item.icon] || <IconFileInfo size={40} />,
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
