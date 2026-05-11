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
			<Section gap="md" padding="none">

				{/* Summary:
				Total: 32 min 09 sec
				Travel: 27 min 39 sec
				Dwell: 4 min 30 sec
				Distance: 14.2 km
				Average commercial speed: 26.5 km/h */}

				{/* Como queres criar esta configuração?

				( ) Copiar da configuração padrão
				( ) Começar em branco
				( ) Aplicar fator de ajuste */}

				<Section gap="xs" padding="none">
					<Text size="lg">{parameter?.name || 'Regra sem nome'}</Text>
					{parameter?.kind === 'default' && <Text c="var(--color-system-text-200)">Usada por defeito quando nenhuma configuração específica se aplica.</Text>}
				</Section>

				<Section gap="xs" padding="none">
					{parameter?.travelTimes && <Text size="sm" style={{ fontFamily: 'monospace' }}>Duração total: {parameter?.travelTimes?.totalTripSecondsWithStops?.formatted}</Text>}
				</Section>
			</Section>

			<IconButton
				icon={<IconArrowRight size={20} />}
				onClick={handleEdit}
			/>

		</div>
	);
}
