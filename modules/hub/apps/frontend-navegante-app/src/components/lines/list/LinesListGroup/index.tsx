/* * */

import { getAgencyLogo } from '@/lib/agency-logos-map';
import { AGENCY_NAMES_MAP } from '@/lib/agency-names-map';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LinesListGroupProps {
	agencyId: string
	children: React.ReactNode
	onShowMoreLines: () => void
	withShowMoreButton?: boolean
}
/* * */

export function LinesListGroup({ agencyId, children, onShowMoreLines, withShowMoreButton }: LinesListGroupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.container}>
			<Image
				alt={t(`default:lines.LinesListGroup.logo.alt`, '', { agency_name: AGENCY_NAMES_MAP[agencyId].full })}
				className={styles.logo}
				height={40}
				src={getAgencyLogo(agencyId, '180x120', 'light')}
				width={60}
			/>
			{children}
			{withShowMoreButton && <div className={styles.showMoreButton} onClick={onShowMoreLines}>{t('default:lines.LinesListGroup.show_more')}</div>}
		</div>
	);
}
