'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { AGENCY_LOGO_MAP } from '@/lib/agency-logos-map';
import { Section } from '@tmlmobilidade/ui';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

export function LinesDetailHeader() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();

	//
	// B. Render componentss

	return (
		<Section>
			<div className={styles.row}>
				<LineBadge
					lineData={linesDetailContext.data.line}
					size="lg"
				/>
				<Image
					alt=""
					className={styles.logo}
					height={60}
					src={AGENCY_LOGO_MAP[linesDetailContext.data.line.agency_id]}
					width={90}
				/>
			</div>
			<div className={styles.lineName}>
				{linesDetailContext.data.line.long_name}
			</div>
		</Section>
	);
}
