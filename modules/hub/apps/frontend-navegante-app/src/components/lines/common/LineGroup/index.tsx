/* * */

import { AGENCY_LOGO_MAP } from '@/lib/agency-logos-map';
import { AGENCY_NAMES_MAP } from '@/lib/agency-names-map';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

export function LineGroup({ agencyId, children }: { agencyId: string, children: React.ReactNode }) {
	return (
		<div className={styles.container}>
			<Image alt={`${AGENCY_NAMES_MAP[agencyId].full} Logo`} className={styles.logo} height={32} src={AGENCY_LOGO_MAP[agencyId]} width={32} />
			{children}
		</div>
	);
}
