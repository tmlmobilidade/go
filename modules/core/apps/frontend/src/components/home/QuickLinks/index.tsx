'use client';

import { iconMap } from '@/lib/icons';
import { IconFileInfo } from '@tabler/icons-react';
import { Grid, LargeButton, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useQuickLinksData } from '../use-quick-links-data';

/* * */

export function QuickLinks() {
	//

	//
	// A. Setup variables

	const { data } = useQuickLinksData();

	//
	// B. Transform data

	const quickLinks = useMemo(() => {
		return data.map(item => ({
			href: item.href,
			icon: iconMap[item.icon] || <IconFileInfo />,
			title: item.title,
		}));
	}, [data]);

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
}
