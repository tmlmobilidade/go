'use client';

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { RuleTimepointCount } from '@/components/patterns/rules/shared/RuleTimepointCount';
import { RuleLabelTag } from '@/components/shared/rules/RuleLabelTag';
import { IconCalendarCancel, IconCalendarCheck, IconCopy, IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type ManualRule, type ScheduleRule } from '@tmlmobilidade/go-types-offer';
import { DayPeriodsTimepoints, Menu, MenuDivider, MenuItem, openConfirmModal, Section, Tag, Text } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

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

	const { t } = useTranslation();
	const patternDetailContext = usePatternDetailContext();

	const isOffTime = rule.kind === 'manual' && rule.operating_mode === 'exclude';
	const isEventRule = rule.kind === 'manual' && rule.event_id !== undefined;
	const times = rule?.timepoints ?? [];
	const name = rule?.name || t('default:scheduling.copy.unnamedRule');

	//
	// B. Handle actions

	const handleOpen = () => {
		if (!patternDetailContext.capabilities.editEnabled) return;
		patternDetailContext.actions.openRuleModal(rule as ManualRule);
	};

	const handleDuplicate = () => {
		if (!patternDetailContext.capabilities.editEnabled) return;
		patternDetailContext.actions.duplicateRule(rule as ManualRule);
	};

	const handleDelete = () => {
		if (!patternDetailContext.capabilities.editEnabled || !rule._id) return;

		openConfirmModal({
			centered: true,
			children: <Text>{t('default:scheduling.copy.deleteNamedRule', '', { name })}</Text>,
			closeOnClickOutside: true,
			confirmProps: { variant: 'danger' },
			labels: { cancel: t('default:scheduling.copy.cancel'), confirm: t('default:scheduling.copy.delete') },
			onConfirm: () => {
				if (!patternDetailContext.capabilities.editEnabled || !rule._id) return;

				patternDetailContext.actions.deleteRule(rule._id);
			},
			title: <Text size="xl">{t('default:scheduling.copy.deleteRule')}</Text>,
			w: 500,
		});
	};

	const handleActionsClick = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
	};

	//
	// C. Render components

	return (
		<div className={styles.container} data-read-only={!patternDetailContext.capabilities.editEnabled || undefined} onClick={!patternDetailContext.capabilities.editEnabled ? undefined : handleOpen}>
			<Section justifyContent="space-between" padding="none">

				<div className={styles.header}>
					<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm" padding="none">
						{isOffTime
							? <IconCalendarCancel color="var(--color-status-danger-primary)" size={20} />
							: <IconCalendarCheck color="var(--color-status-success-primary)" size={20} />}

						{isEventRule && (
							<Tag label={t('default:scheduling.copy.event')} variant="muted" />
						)}

						{isEventRule ? (
							<Link
								className={styles.eventName}
								href={PAGE_ROUTES.offer.EVENTS_DETAIL(rule.event_id)}
								onClick={event => event.stopPropagation()}
								rel="noopener noreferrer"
								target="_blank"
							>
								<RuleLabelTag label={name} tooltip={`${t('default:scheduling.copy.eventDetails')}: ${name}`} />
							</Link>
						) : (
							<RuleLabelTag label={name} />
						)}

						<RuleTimepointCount count={times.length} />
					</Section>
				</div>

				<div className={styles.schedules}>
					<DayPeriodsTimepoints timepoints={times} variant="compact" />
				</div>
			</Section>

			{patternDetailContext.capabilities.editEnabled && (
				<div className={styles.actions} onClick={handleActionsClick}>
					<Menu icon={IconDots} label={t('default:scheduling.copy.ruleActions')} menuPosition="bottom-end">
						<MenuItem
							leftSection={<IconPencil size={20} />}
							onClick={handleOpen}
							title={t('default:scheduling.copy.open')}
						/>
						<MenuItem
							leftSection={<IconCopy size={20} />}
							onClick={handleDuplicate}
							title={t('default:scheduling.copy.duplicate')}
						/>
						<MenuDivider />
						<MenuItem
							color="var(--color-status-danger-primary)"
							leftSection={<IconTrash size={20} />}
							onClick={handleDelete}
							title={t('default:scheduling.copy.delete')}
						/>
					</Menu>
				</div>
			)}

		</div>
	);
}
