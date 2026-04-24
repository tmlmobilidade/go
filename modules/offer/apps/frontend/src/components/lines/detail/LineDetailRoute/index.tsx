'use client';

/* * */

import { IconChevronRight } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { RouteSimplified } from '@tmlmobilidade/types';
import { keepUrlParams, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export default function LineDetailRoute({ lineId, routeData }: { lineId: string, routeData: RouteSimplified }) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// C. Handle actions

	const handleClick = () => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.ROUTE_DETAIL(lineId, routeData._id)));
	};

	//
	// D. Render components

	return (
		<div className={styles.container} onClick={handleClick}>
			<div className={styles.routeInfo}>
				<Text size="sm">
					{routeData.code || '...'}
				</Text>
				<Text size="xl">
					{routeData.name || '...'}
				</Text>
			</div>
			<IconChevronRight size="20px" />
		</div>
	)

	;

	//
}
