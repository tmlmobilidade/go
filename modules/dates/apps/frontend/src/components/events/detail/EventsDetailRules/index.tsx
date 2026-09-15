'use client';

import { EventsDetailRuleCard } from '@/components/events/detail/EventsDetailRuleCard';
import { Button, Section, Text } from '@tmlmobilidade/ui';

import { useEventsDetailRules } from '../use-events-detail-rules';

/* * */

export function EventsDetailRules() {
	//

	//
	// A. Setup variables

	const { openRuleModal, rules } = useEventsDetailRules();

	//
	// B. Handle actions

	const handleNewRule = () => {
		openRuleModal();
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<Section gap="xs" padding="none">
				<Text size="lg">Regras de oferta</Text>
				<Text c="dimmed" size="sm">
					Definem como a oferta deve ser calculada nos dias do evento.
					Estas regras substituem o comportamento normal do calendário, permitindo que um dia específico funcione, por exemplo, como Sábado em Período Escolar, independentemente do dia real da semana.
				</Text>
			</Section>
			<Section gap="md" padding="none">
				{rules.map(rule => <EventsDetailRuleCard key={rule._id} rule={rule} />)}
				{rules.length === 0 && <Text c="dimmed" size="sm">Nenhuma regra definida</Text>}
			</Section>
			<Button label="Nova regra" onClick={handleNewRule} w="fit-content" />
		</Section>
	);
}
