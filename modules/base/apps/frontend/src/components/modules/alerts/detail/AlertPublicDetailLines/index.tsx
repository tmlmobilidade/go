'use client';
/* * */

import { useAlertDetailPublicContext } from '@/contexts/AlertPublicDetail.context';
import { TagGroup } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetailLines() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const alertDetailPublicContext = useAlertDetailPublicContext();
	//
	// B. Render components

	return (
		<>
			{ alertDetailPublicContext.data.linesIds.length > 0 && (
				<div className={styles.tagsRow}>
					<TagGroup
						limit={25}
						tags={alertDetailPublicContext.data.linesIds.map(line => ({
							label: line.label,
							onClick: () => router.push(`https://carrismetropolitana.pt/lines/${line.value}`),
							variant: 'danger',
						}))}
					/>
				</div>
			)}
		</>
	);

	//
}
