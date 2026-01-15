'use client';

/* * */

import { Radio, Section, Text, TextInput } from '@tmlmobilidade/ui';

import { useRuleCreateContext } from '../RuleCreate.context';

/* * */

export function RuleCreateHolidays() {
	//
	// A. Setup variables

	const { form } = useRuleCreateContext().data;
	const holidays = form.values.holidays;

	//
	// B. Handlers

	const handleModeChange = (mode: 'all' | 'ignore' | 'specific') => {
		if (mode === 'ignore') {
			form.setFieldValue('holidays', undefined);
			return;
		}

		if (mode === 'all') {
			form.setFieldValue('holidays', { mode: 'all' });
			return;
		}

		form.setFieldValue('holidays', { ids: [], mode: 'specific' });
	};

	const handleSpecificChange = (value: string) => {
		const ids = value
			.split(',')
			.map(s => s.trim())
			.filter(Boolean);

		form.setFieldValue(
			'holidays',
			ids.length > 0
				? { ids, mode: 'specific' }
				: { ids: [], mode: 'specific' },
		);
	};

	//
	// C. Render

	return (
		<Section gap="md">

			<Text weight="medium">Feriados</Text>

			<Radio.Group
				onChange={handleModeChange}
				value={holidays?.mode ?? 'ignore'}
			>
				<Radio
					label="Ignorar feriados"
					value="ignore"
				/>

				<Radio
					label="Aplicar a todos os feriados"
					value="all"
				/>

				<Radio
					label="Apenas a feriados específicos"
					value="specific"
				/>
			</Radio.Group>

			{holidays?.mode === 'specific' && (
				<TextInput
					description="IDs de feriados separados por vírgula (ex: feriado1, feriado2)"
					label="Feriados específicos"
					onChange={e => handleSpecificChange(e.currentTarget.value)}
					placeholder="Introduza IDs de feriados"
					value={holidays.ids?.join(', ') ?? ''}
					w="100%"
				/>
			)}

		</Section>
	);
}
