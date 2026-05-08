'use client';

import { BackButton } from '@/components/common/BackButton';
import { SelectOperationalDate } from '@/components/common/SelectOperationalDate';
import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';
import { LineBadge } from '@/components/lines/LineBadge';
import { SelectActivePatternGroup } from '@/components/lines/SelectActivePatternGroup';
import { useLinesDetailContext } from '@/contexts/LinesDetail.context';

import styles from './styles.module.css';

import { LineDisplayTts } from '../LineDisplayTts';

/* * */

export function LinesDetailHeader() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();
	const lineData = linesDetailContext.data.line;
	const normalizedLineName = lineData?.long_name;

	//
	// B. Render componentss

	if (!linesDetailContext.data.line) {
		return null;
	}

	return (
		<>
			<Surface>

				<Section withBottomDivider withPadding>
					<BackButton href="/?section=lines" />
				</Section>

				<Section withBottomDivider withPadding>
					<div className={styles.headingSection}>
						<div className={styles.headingSectionRow}>
							<LineBadge lineData={linesDetailContext.data.line} size="lg" />
							<LineDisplayTts patternId={linesDetailContext.data.active_pattern?.id} />
						</div>
						<div className={styles.lineName}>
							{normalizedLineName}
						</div>
					</div>
				</Section>

				<Section withPadding>
					<div className={styles.container}>
						<div className={styles.operationalDateSelectorWrapper}>
							<SelectOperationalDate />
						</div>
						<div className={styles.patternSelectorWrapper}>
							<SelectActivePatternGroup />
						</div>

					</div>
				</Section>
			</Surface>

		</>
	);

	//
}
