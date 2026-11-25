'use client';

import { IconArrowsMaximize } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingStats } from '../../stats/LandingStats';
import { LandingMap } from '../LandingMap';
import { openLandingMapModal } from '../LandingMapModal';

/* * */

export function LandingMapPreview() {
	//

	const { t } = useTranslation();

	return (
		<LandingSection>
			<div className={styles.container}>
				<LandingMap />
				<button className={styles.overlay} onClick={openLandingMapModal} type="button">
					<span className={styles.hoverLayer}>
						<span className={styles.hoverIcon}>
							<IconArrowsMaximize size={36} stroke={2} />
						</span>
					</span>
					<span className={styles.action}>
						<IconArrowsMaximize size={18} />
						{t('landing:LandingMap.explore')}
					</span>
				</button>
				<div className={styles.stats}>
					<LandingStats />
				</div>
			</div>
		</LandingSection>
	);

	//
}
