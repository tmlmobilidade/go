/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import ParametersListViewCard from '@/components/patterns/shape/parameters/list/ParametersListViewCard';
import { IconPlus } from '@tabler/icons-react';
import { Button, Section, Text } from '@tmlmobilidade/ui';

/* * */

export function ParametersListView() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	const defaultRule = patternDetailContext.data.stopsParameterRules?.find(rule => rule.kind === 'default');
	const overwriteRules = patternDetailContext.data.stopsParameterRules?.filter(rule => rule.kind === 'override') || [];

	//
	// B. Render components

	return (
		<Section gap="lg" padding="none">
			{/* Default Rule Section */}
			<Section gap="md" padding="none">
				<ParametersListViewCard parameter={defaultRule} />
			</Section>

			{/* Overwrite Rules Section */}
			<Section gap="md" padding="none">
				<Section gap="xs" padding="none">
					<Text size="lg">Configurações específicas</Text>
					<Text c="var(--color-system-text-200)">Substituem a configuração padrão em períodos, dias ou horários específicos.</Text>
				</Section>
				{overwriteRules.map((rule, index) => (
					<ParametersListViewCard key={rule._id || index} parameter={rule} />
				))}
			</Section>

			{/* Actions */}
			<Section flexDirection="row" gap="sm" padding="none">
				<Button
					label="Nova configuração"
					leftSection={<IconPlus size={16} />}
					onClick={() => patternDetailContext.actions.openStopsParameterModal()}
				/>
			</Section>

		</Section>
	);
}
