'use client';

/* * */

import { Section, Text, TextInput } from '@tmlmobilidade/ui';

import { useRuleCreateContext } from '../RuleCreate.context';

/* * */

export function RuleCreateEvents() {
	//
	// A. Setup variables

	const { form } = useRuleCreateContext().data;

	//
	// B. Handlers

	//
	// C. Render

	return (
		<Section gap="md">

			<Text weight="medium">Eventos especiais</Text>

			<TextInput
				placeholder="Introduza IDs de eventos"
				value={form.values.events?.join(', ') || ''}
				w="100%"
				onChange={(e) => {
					const events = e.currentTarget.value
						.split(',')
						.map(s => s.trim())
						.filter(Boolean);
					form.setFieldValue('events', events.length > 0 ? events : undefined);
				}}
			/>

		</Section>
	);
}
