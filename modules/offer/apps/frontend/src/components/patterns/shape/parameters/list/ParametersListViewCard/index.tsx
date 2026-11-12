'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { StopsParameterExtended } from '@/utils/stops-parameters';
import { IconArrowRight } from '@tabler/icons-react';
import { StopsParameter } from '@tmlmobilidade/go-types-offer';
import { IconButton, Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

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

	const { t } = useTranslation();
	const patternDetailContext = usePatternDetailContext();

	//
	// B. Handle actions

	const handleEdit = () => {
		if (!patternDetailContext.capabilities.editEnabled) return;
		patternDetailContext.actions.openStopsParameterModal(parameter as StopsParameter);
	};

	//
	// C. Render components

	return (
		<div className={styles.container} data-read-only={!patternDetailContext.capabilities.editEnabled || undefined} onClick={!patternDetailContext.capabilities.editEnabled ? undefined : handleEdit}>
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
					<Text size="lg">{parameter?.name || t('default:scheduling.copy.unnamedRule')}</Text>
					{parameter?.kind === 'default' && <Text c="var(--color-system-text-200)">{t('default:scheduling.copy.defaultConfigurationHint')}</Text>}
				</Section>

				<Section gap="xs" padding="none">
					{parameter?.travelTimes && <Text className={styles.duration} size="sm">{t('default:scheduling.copy.totalDurationLabel')}{parameter?.travelTimes?.totalTripSecondsWithStops?.formatted}</Text>}
				</Section>
			</Section>

			<IconButton
				icon={<IconArrowRight size={20} />}
				isDisabled={!patternDetailContext.capabilities.editEnabled}
				onClick={handleEdit}
			/>

		</div>
	);
}
