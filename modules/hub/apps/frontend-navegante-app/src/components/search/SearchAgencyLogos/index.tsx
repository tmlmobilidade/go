import { getAgencyDisplayInfo, getAgencyLogo, getAgencyMapOperatorId } from '@/lib/agency-catalog';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

interface SearchAgencyLogosProps {
	agencyIds: string[]
}

/* * */

export function SearchAgencyLogos({ agencyIds }: SearchAgencyLogosProps) {
	const operatorIds = [...new Set(agencyIds.map(agencyId => getAgencyMapOperatorId(agencyId) ?? agencyId))];

	return (
		<em className={styles.agencyLogos}>
			{operatorIds.map((operatorId) => {
				const agency = getAgencyDisplayInfo(operatorId);
				const agencyLogo = getAgencyLogo(operatorId, '180x120', 'light');
				if (!agency || !agencyLogo) return null;

				return (
					<Image
						key={operatorId}
						alt={agency.fullName}
						height={22}
						src={agencyLogo}
						width={33}
					/>
				);
			})}
		</em>
	);
}
