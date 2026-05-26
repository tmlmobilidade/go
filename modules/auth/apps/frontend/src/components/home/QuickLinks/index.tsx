'use client';

import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { iconMap } from '@/lib/icons';
import { IconFileInfo } from '@tabler/icons-react';
import { Grid, LargeButton, Section, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function QuickLinks() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const organizationsContext = useOrganizationsContext();

	//
	// B. Transform data

	const quickLinks = useMemo(() => {
		// Skip if no links
		if (!organizationsContext.data.raw) return [];
		// Find the organization detail
		const foundOrganizationData = organizationsContext.data.raw.find(org => org._id === meContext.data.user.organization_id);
		if (!foundOrganizationData) return [];
		// Return mapped links
		return foundOrganizationData.home_links.map(item => ({
			href: item.href,
			icon: iconMap[item.icon] || <IconFileInfo />,
			title: item.title,
		}));
	}, [organizationsContext.data.raw, meContext.data.user.organization_id]);

	//
	// C. Render components

	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{quickLinks?.map(item => (
					<LargeButton
						key={`${item.title}-${item.href}`}
						href={item.href}
						icon={item.icon}
						title={item.title}
					/>
				))}
			</Grid>
		</Section>
	);

	//
}
