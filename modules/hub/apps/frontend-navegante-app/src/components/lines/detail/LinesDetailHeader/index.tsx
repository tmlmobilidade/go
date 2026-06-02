'use client';

// import { BackButton } from '@/components/common/BackButton';
import { LineBadge } from '@/components/lines/common/LineBadge';
import { SelectOperationalDate } from '@/components/lines/common/SelectOperationalDate';
import { LineDisplayTts } from '@/components/lines/detail/LineDisplayTts';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { SelectActivePatternGroup } from '@/components/lines/detail/SelectActivePatternGroup';
import { Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

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

				<Section>
					{/* <BackButton href="/?section=lines" /> */}
				</Section>

				<Section>
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

				<Section>
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
