'use client';

import { IconChevronRight } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PatternSimplified } from '@tmlmobilidade/types';
import { keepUrlParams, Text } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export default function RouteDetailPattern({ patternData }: { patternData: PatternSimplified }) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// C. Handle actions

	const handleClick = () => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.PATTERN_DETAIL(patternData.line_id, patternData._id, patternData.route_id)));
	};

	//
	// D. Render components

	return (
		<div className={styles.container} onClick={handleClick}>
			<div className={styles.routeInfo}>
				<Text size="sm">
					{patternData.code || '...'}
				</Text>
				<Text size="xl">
					{patternData.headsign || '...'}
				</Text>
			</div>
			<IconChevronRight size="20px" />
		</div>
	)

	;

	//
}
