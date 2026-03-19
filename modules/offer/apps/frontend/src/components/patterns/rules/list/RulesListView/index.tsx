/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import RulesListViewEventCard from '@/components/patterns/rules/list/RulesListViewEventCard';
import RulesListViewManualCard from '@/components/patterns/rules/list/RulesListViewManualCard';
import { Section, Text } from '@tmlmobilidade/ui';

/* * */

export function RulesListView() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
	const mergedRules = patternDetailContext.data.mergedRules || [];

	const includeRules = mergedRules.filter(rule =>
		rule.kind === 'manual' && rule.operating_mode === 'include',
	);
	const excludeRules = mergedRules.filter(rule =>
		(rule.kind === 'manual' && rule.operating_mode === 'exclude')
		|| rule.kind === 'event_restriction',
	);
	const overwriteRules = mergedRules.filter(rule =>
		rule.kind === 'event_replacement',
	);

	//
	// B. Render components

	return (
		<Section gap="lg" padding="none">
			{/* Include Rules Section */}
			<Section gap="md" padding="none">
				<Text size="xl" weight="bold">Incluem serviço</Text>
				{includeRules.length > 0
					? includeRules.map((rule, index) => (
						<RulesListViewManualCard key={rule._id || index} rule={rule} />
					))
					: (
						<Text c="dimmed" style={{ textAlign: 'center' }}>
							Nenhuma regra de inclusão.
						</Text>
					)}
			</Section>

			{/* Exclude Rules Section */}
			<Section gap="md" padding="none">
				<Text size="xl" weight="bold">Excluem serviço</Text>
				{excludeRules.length > 0
					? excludeRules.map((rule, index) => (
						rule.kind === 'event_restriction'
							? <RulesListViewEventCard key={rule._id || index} rule={rule} />
							: <RulesListViewManualCard key={rule._id || index} rule={rule} />
					))
					: (
						<Text c="dimmed" style={{ textAlign: 'center' }}>
							Nenhuma regra de exclusão.
						</Text>
					)}
			</Section>

			{/* Overwrite Rules Section (Event Replacements) */}
			{overwriteRules.length > 0 && (
				<Section gap="md" padding="none">
					<Text size="xl" weight="bold">Substituem oferta</Text>
					{overwriteRules.map((rule, index) => (
						<RulesListViewEventCard key={rule._id || index} rule={rule} />
					))}
				</Section>
			)}

		</Section>
	);
}
