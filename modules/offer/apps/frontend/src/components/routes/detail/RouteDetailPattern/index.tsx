'use client';

/* * */

import { IconChevronRight } from '@tabler/icons-react';
import { PatternSimplified } from '@tmlmobilidade/types';
import { Text } from '@tmlmobilidade/ui';
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
		router.push(`/lines/${patternData.line_id}/${patternData.route_id}/${patternData._id}`);
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
