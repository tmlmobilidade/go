'use client';
/* * */

import { HomePageFilterbarAgencies } from '@/components/home/HomePageFilterbarAgencies';
import { HomePageFilterbarTransports } from '@/components/home/HomePageFilterbarTransports';
import { Grid } from '@/components/layout/Grid';
import { Modal } from '@mantine/core';
import { useTranslations } from 'next-intl';

/* * */

interface HomePageFilterProps {
	close: () => void
	opened: boolean
}
/* * */

export function HomePageFilterbar({ close, opened }: HomePageFilterProps) {
	//

	//
	// A. Setup variables

	const t = useTranslations('home.HomePageFilterbar');

	//
	// B. Render Components

	return (
		<Modal onClose={close} opened={opened} size="lg" title={t('modal.title')}>
			<Grid columns="a" withGap>
				<HomePageFilterbarTransports />
				<HomePageFilterbarAgencies />
			</Grid>
		</Modal>
	);

	//
}
