'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { AGENCY_LOGO_MAP } from '@/lib/agency-logos-map';
import { Section, Surface } from '@tmlmobilidade/ui';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

export function LinesDetailViewHeader() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();

	//
	// B. Render componentss

	return (
		<Surface variant="plain">
			<Section gap="sm">
				<div aria-hidden={true} className={styles.row}>
					<LineBadge lineData={linesDetailContext.data.line} size="lg" />
					<Image alt="" height={40} src={AGENCY_LOGO_MAP[linesDetailContext.data.line.agency_id]} width={60} />
				</div>
				<h1 aria-hidden={true} className={styles.lineName}>
					{linesDetailContext.data.line.long_name}
				</h1>
			</Section>
		</Surface>
	);
}
