/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import PatternDetailSectionOpRuleCard from '@/components/patterns/detail/PatternDetailSectionOpRuleCard';
import { Section } from '@tmlmobilidade/ui';

/* * */

export function RulesListView() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
	const rules = patternDetailContext.data.form.values.rules || [];
	const includeRules = rules.filter(rule => rule.operatingMode === 'include');
	const excludeRules = rules.filter(rule => rule.operatingMode === 'exclude');

	//
	// B. Render components

	return (
		<Section gap="lg" padding="none">
			{/* Include Rules Section */}
			<Section gap="md" padding="none">
				<h4 style={{ margin: 0 }}>Incluem serviço</h4>
				{includeRules.length > 0 ? (
					includeRules.map((rule, index) => (
						<PatternDetailSectionOpRuleCard key={rule._id || index} rule={rule} />
					))
				) : (
					<Section padding="none">
						<p style={{ color: 'var(--color-system-text-300)', textAlign: 'center' }}>
							Nenhuma regra de inclusão.
						</p>
					</Section>
				)}
			</Section>

			{/* Exclude Rules Section */}
			<Section gap="md" padding="none">
				<h4 style={{ margin: 0 }}>Excluem serviço</h4>
				{excludeRules.length > 0 ? (
					excludeRules.map((rule, index) => (
						<PatternDetailSectionOpRuleCard key={rule._id || index} rule={rule} />
					))
				) : (
					<Section padding="none">
						<p style={{ color: 'var(--color-system-text-300)', textAlign: 'center' }}>
							Nenhuma regra de exclusão.
						</p>
					</Section>
				)}
			</Section>

		</Section>
	);

	//
}
