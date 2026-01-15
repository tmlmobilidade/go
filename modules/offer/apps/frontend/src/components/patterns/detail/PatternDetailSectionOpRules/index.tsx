/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import PatternDetailSectionOpRuleCard from '@/components/patterns/detail/PatternDetailSectionOpRuleCard';
import { IconCalendar, IconPlus } from '@tabler/icons-react';
import { Button, Collapsible, Section } from '@tmlmobilidade/ui';

/* * */

export function PatternDetailSectionOpRules() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
	const rules = patternDetailContext.data.form.values.rules || [];

	//
	// B. Render components

	return (
		<Collapsible title="Regras de funcionamento" defaultOpen>
			<Section gap="lg">
				{rules.map((rule, index) => (
					<PatternDetailSectionOpRuleCard key={rule._id || index} rule={rule} />
				))}

				{rules.length === 0 && (
					<Section padding="none">
						<p style={{ color: 'var(--color-system-text-300)', textAlign: 'center' }}>
							Nenhuma regra definida. Clique em "Nova regra" para começar.
						</p>
					</Section>
				)}

				<Section flexDirection="row" gap="sm" padding="none">
					<Button
						label="Nova regra"
						leftSection={<IconPlus size={16} />}
						onClick={() => patternDetailContext.actions.openRuleModal()}
					/>

					{/* TODO: Preview do calendário com o merge das regras */}
					<Button
						label="Prever calendário"
						leftSection={<IconCalendar size={16} />}
						variant="secondary"
						onClick={() => {
							console.log('Preview calendar clicked');
						}}
						disabled
					/>
				</Section>
			</Section>
		</Collapsible>
	);

	//
}
