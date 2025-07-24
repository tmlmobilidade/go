'use client';

/* * */

import { useStopListContext } from '@/contexts/StopList.context';
import { Routes } from '@/lib/routes';
import { Pane, Section, Tag, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data, flags } = useStopListContext();

	//
	// B. Render components

	if (flags.error) {
		return <div>Error: {flags.error.message}</div>;
	}

	return (
		<Pane>
			{data.filtered.map(stop => (
				<div
					key={stop._id}
					className={styles.root}
					defaultValue={stop._id}
					onClick={() => { router.push(Routes.STOPS_DETAIL(stop._id)); }}
				>
					<Section alignItems="center" flexDirection="row" flexWrap="nowrap" gap="sm">
						<Tag label={stop._id} variant="muted" />
						<Text size="lg">{stop.new_name}</Text>
					</Section>
				</div>
			))}
		</Pane>
	);

	//
}
