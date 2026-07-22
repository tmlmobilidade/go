import { getAgencyLogo } from '@/lib/agency-logos-map';
import { AGENCY_NAMES_MAP } from '@/lib/agency-names-map';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

interface SearchStopAgencyLogosProps {
	agencyIds: string[]
}

/* * */

export function SearchStopAgencyLogos({ agencyIds }: SearchStopAgencyLogosProps) {
	return (
		<em className={styles.stopAgencyLogos}>
			{agencyIds.map((agencyId) => {
				const agency = AGENCY_NAMES_MAP[agencyId as keyof typeof AGENCY_NAMES_MAP];
				if (!agency) return null;

				return (
					<Image
						key={agencyId}
						alt={agency.full}
						height={24}
						src={getAgencyLogo(agencyId, '120x120', 'light')}
						width={24}
					/>
				);
			})}
		</em>
	);
}
