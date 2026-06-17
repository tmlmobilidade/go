'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { IconCalendarCancel, IconCalendarCheck, IconCopy, IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { ManualRule, ScheduleRule } from '@tmlmobilidade/types';
import { DayPeriodsTimepoints, Menu, MenuDivider, MenuItem, openConfirmModal, Section, Tag, Text, Tooltip } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { MouseEvent } from 'react';

import styles from './styles.module.css';

/* * */

interface RulesListViewCardProps {
	rule: ScheduleRule
}

/* * */

export default function RulesListViewCard({ rule }: RulesListViewCardProps) {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	const isOffTime = rule.kind === 'manual' && rule.operating_mode === 'exclude';
	const isEventRule = rule.kind === 'manual' && rule.event_id !== undefined;
	const times = rule?.timepoints ?? [];
	const name = rule?.name || 'Regra sem nome';

	//
	// B. Handle actions

	const handleOpen = () => {
		patternDetailContext.actions.openRuleModal(rule as ManualRule);
	};

	const handleDuplicate = () => {
		patternDetailContext.actions.duplicateRule(rule as ManualRule);
	};

	const handleDelete = () => {
		if (!rule._id) return;

		openConfirmModal({
			centered: true,
			children: <Text>{`Tem a certeza que pretende eliminar a regra "${name}"?`}</Text>,
			closeOnClickOutside: true,
			confirmProps: { variant: 'danger' },
			labels: { cancel: 'Cancelar', confirm: 'Eliminar' },
			onConfirm: () => {
				if (!rule._id) return;

				patternDetailContext.actions.deleteRule(rule._id);
			},
			title: <Text size="xl">Eliminar regra</Text>,
			w: 500,
		});
	};

	const handleActionsClick = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
	};

	//
	// C. Render components

	return (
		<div className={styles.container} onClick={handleOpen}>
			<Section gap="md" justifyContent="space-between" padding="none">

				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					{isOffTime
						? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
						: <IconCalendarCheck color="var(--color-status-success-primary)" size={20} />}

					{isEventRule && (
						<Tag label="Evento" variant="muted" />
					)}

					{isEventRule ? (
						<Tooltip label="Ir para detalhes do evento" position="bottom" withArrow>
							<Link
								className={styles.eventName}
								href={PAGE_ROUTES.dates.EVENTS_DETAIL(rule.event_id)}
								onClick={event => event.stopPropagation()}
								rel="noopener noreferrer"
								target="_blank"
							>
								<Text size="lg">{name}</Text>
							</Link>
						</Tooltip>
					) : (
						<Text size="lg">{name}</Text>
					)}

					<Text>·</Text>

					<Text className={styles.timesCount}>{times.length} {times.length > 1 ? 'horários' : 'horário'}</Text>
				</Section>

				<DayPeriodsTimepoints timepoints={times} variant="compact" />
			</Section>

			<div className={styles.actions} onClick={handleActionsClick}>
				<Menu icon={IconDots} label="Ações da regra" menuPosition="bottom-end">
					<MenuItem
						leftSection={<IconPencil size={20} />}
						onClick={handleOpen}
						title="Abrir"
					/>
					<MenuItem
						leftSection={<IconCopy size={20} />}
						onClick={handleDuplicate}
						title="Duplicar"
					/>
					<MenuDivider />
					<MenuItem
						color="var(--color-status-danger-primary)"
						leftSection={<IconTrash size={20} />}
						onClick={handleDelete}
						title="Eliminar"
					/>
				</Menu>
			</div>

		</div>
	);
}
