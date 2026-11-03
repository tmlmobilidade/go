'use client';

import { type EventRule } from '@tmlmobilidade/go-types-offer';
import { generateRandomString } from '@tmlmobilidade/strings';
import { Button, Divider, ErrorDisplay, Section, Text, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { RuleCard } from '../../rules/RuleCard';
import { openCreateRuleModal } from '../../rules/RuleCreate.modal';
import { useEventsLinesData } from '../../shared/use-events-lines-data';
import { useEventsDetailFormContext } from '../EventsDetailForm.context';

/* * */

export function EventsDetailRules() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useEventsDetailFormContext();
	const values = useStandardFormWatch({ control: form.control });
	const { data: lines, error } = useEventsLinesData();
	const rules = form.getValues('rules') ?? [];
	const eventLines = lines.filter(line => values.agency_ids?.includes(line.agency_id));
	// Modal callbacks outlive the click: respect current permissions/lock state and unmounts.
	const canEdit = useRef(false);
	canEdit.current = capabilities.editEnabled;
	useEffect(() => {
		canEdit.current = capabilities.editEnabled;
		return () => {
			canEdit.current = false;
		};
	}, [capabilities.editEnabled]);

	//
	// B. Handle actions

	const handleOpenRule = useCallback((rule?: EventRule) => {
		if (!canEdit.current) return;
		const onSubmit = (validatedRule: EventRule) => {
			if (!canEdit.current) return;
			const rules = form.getValues('rules') ?? [];
			const nextRule = { ...validatedRule, _id: rule?._id ?? generateRandomString({ length: 5 }) };
			form.setValue('rules', rule?._id ? rules.map(item => item._id === rule._id ? nextRule : item) : [...rules, nextRule], { shouldDirty: true, shouldValidate: true });
		};
		const onDelete = rule?._id ? () => {
			if (!canEdit.current) return;
			form.setValue('rules', (form.getValues('rules') ?? []).filter(item => item._id !== rule._id), { shouldDirty: true, shouldValidate: true });
		} : undefined;
		const current = form.getValues();
		openCreateRuleModal({ agency_ids: current.agency_ids ?? [], dates: current.dates ?? [] }, rule, onSubmit, onDelete);
	}, [form]);

	const handleCreateRule = () => handleOpenRule();

	//
	// C. Render components

	return (
		<Section gap="md" padding="none">
			<Divider />
			<Text size="lg">{t('default:events.rules.title')}</Text>
			<Text c="dimmed" size="sm">{t('default:events.rules.description')}</Text>
			{error && <ErrorDisplay message={error} />}
			<Section gap="md" padding="none">
				{rules.map(rule => (
					<RuleCard key={rule._id} disabled={!capabilities.editEnabled} lines={eventLines} onEdit={handleOpenRule} rule={rule} />
				))}
				{!rules.length && <Text c="dimmed" size="sm">{t('default:events.rules.empty')}</Text>}
			</Section>
			<Button disabled={!capabilities.editEnabled} label={t('default:events.rules.create')} onClick={handleCreateRule} w="fit-content" />
		</Section>
	);
}
