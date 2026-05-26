'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { StopsParameterExtended } from '@/utils/stops-parameters';
import { IconArrowRight } from '@tabler/icons-react';
import { StopsParameter } from '@tmlmobilidade/types';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface ParametersListViewCardProps {
	parameter: StopsParameterExtended
}

/* * */

export default function ParametersListViewCard({ parameter }: ParametersListViewCardProps) {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Handle actions

	const handleEdit = () => {
		patternDetailContext.actions.openStopsParameterModal(parameter as StopsParameter);
	};

	//
	// C. Render components

	return (
		<div className={styles.container} onClick={handleEdit}>
			<Section gap="md" justifyContent="space-between" padding="none">

				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					<Text size="lg">{parameter?.name || 'Regra sem nome'}</Text>
				</Section>

				{parameter?.travelTimes && <Text className={styles.timesCount}>Estas viagens tem a duração de {parameter?.travelTimes?.totalTripSecondsWithStops?.formatted}</Text>}
			</Section>

			<IconButton
				icon={<IconArrowRight size={20} />}
				onClick={handleEdit}
			/>

		</div>
	);
}
