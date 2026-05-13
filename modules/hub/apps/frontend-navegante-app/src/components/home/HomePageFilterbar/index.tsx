'use client';

import { HomePageFilterbarAgencies } from '@/components/home/HomePageFilterbarAgencies';
import { HomePageFilterbarTransports } from '@/components/home/HomePageFilterbarTransports';
import { Grid } from '@/components/layout/Grid';
import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';
import { Drawer } from '@mantine/core';
import { useTranslations } from 'next-intl';

/* * */

interface HomePageFilterbarProps {
	close: () => void
	opened: boolean
}

/* * */

export function HomePageFilterbar({ close, opened }: HomePageFilterbarProps) {
	//

	//
	// A. Setup variables

	const t = useTranslations('home.HomePageFilterbar');

	//
	// B. Render Components

	return (
		<Drawer onClose={close} opened={opened} position="bottom" size="85%" title={t('heading')}>
			<Surface>
				<Section withPadding>
					<Grid columns="ab">
						<HomePageFilterbarTransports />
						<HomePageFilterbarAgencies />
					</Grid>
				</Section>
			</Surface>
		</Drawer>
	);

	//
}
