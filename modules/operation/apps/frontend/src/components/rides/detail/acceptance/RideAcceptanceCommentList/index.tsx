'use client';

import { IconAlertCircle, IconMessageCircle } from '@tabler/icons-react';
import { type ControllerRidesDetailRideItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type UserDisplay } from '@tmlmobilidade/go-types-core';
import { type RideAcceptance, RideAcceptanceStatusSchema, type RideJustification, RideJustificationSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { HasPermission, Label, Section, Surface, Text, UserTag } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import acceptanceStyles from '../RideAcceptance/styles.module.css';
import styles from './styles.module.css';

import { useRidesDetailRideAnalysesData } from '../../shared/use-rides-detail-ride-analyses-data';
import { RideAcceptanceCommentForm } from '../RideAcceptanceCommentForm';
import { RideAcceptanceJustificationReadOnly } from '../RideAcceptanceJustificationReadOnly';

/* * */

interface HistoryEvent {
	author?: ReactNode
	justification?: RideJustification
	kind?: 'alert' | 'current' | 'note'
	status?: RideAcceptance['acceptance_status']
	time?: number
	title: string
}

/* * */

export function RideAcceptanceCommentList({ acceptance, ride }: { acceptance: RideAcceptance, ride: ControllerRidesDetailRideItem }) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const { data: analyses } = useRidesDetailRideAnalysesData();
	const timeFormat = new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', hourCycle: 'h23', minute: '2-digit', timeZone: ride.timezone });
	const dateFormat = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short', timeZone: ride.timezone });

	//
	// B. Transform data

	const system = t('default:rides.acceptance.RideAcceptanceCommentList.system');
	const justification = acceptance.justification;
	const getAuthor = (createdBy: string | UserDisplay) => typeof createdBy === 'string'
		? (createdBy === 'system' ? system : <UserTag userId={createdBy} variant="inline" />)
		: [createdBy?.first_name, createdBy?.last_name].filter(Boolean).join(' ');
	const toJustificationEvent = (saved: RideJustification): HistoryEvent => saved.justification_source === 'alert'
		? { author: 'rides-acceptor', justification: saved, kind: 'alert', time: saved.created_at, title: t('default:rides.acceptance.RideAcceptanceCommentList.alert_linked') }
		: { author: getAuthor(saved.created_by), justification: saved, time: saved.created_at, title: t('default:rides.acceptance.RideAcceptanceCommentList.manual_submitted') };
	const recordedJustifications = new Set<string>();
	const recoveredJustifications = new Map<string, RideJustification>();
	const comments = acceptance.comments ?? [];
	const loggedEvents = comments.flatMap<HistoryEvent>((comment) => {
		const event = { author: getAuthor(comment.created_by), time: comment.created_at };

		if (comment.type === 'note') return [{ ...event, kind: 'note', title: comment.message }];
		if (comment.type === 'crud') return [{ ...event, title: t(`default:rides.acceptance.RideAcceptanceCommentList.crud.${comment.action}`) }];

		const changes = comment.field === 'multiple_fields' ? comment.metadata?.changes ?? [comment] : [comment];
		return changes.map<HistoryEvent>((change) => {
			if (change.field === 'acceptance_status') {
				const status = RideAcceptanceStatusSchema.safeParse(change.curr_value);
				if (status.success) return { ...event, status: status.data, title: t(`ride_status:acceptance_status.${status.data}`) };
			}
			if (change.field === 'is_locked') return { ...event, title: t(`default:rides.acceptance.RideAcceptanceCommentList.lock.${change.curr_value ? 'lock' : 'unlock'}`) };
			if (change.field === 'analysis_summary') return { ...event, title: t('default:rides.acceptance.RideAcceptanceCommentList.summary.performed') };
			if (change.field === 'justification') {
				const previous = RideJustificationSchema.safeParse(change.prev_value).data;
				if (previous) recoveredJustifications.set(JSON.stringify(previous), previous);

				const saved = RideJustificationSchema.safeParse(change.curr_value).data;
				if (saved) {
					recordedJustifications.add(JSON.stringify(saved));
					return toJustificationEvent(saved);
				}
				return { ...event, title: t('default:rides.acceptance.RideAcceptanceCommentList.justification.updated') };
			}
			return { ...event, title: t('default:rides.acceptance.RideAcceptanceCommentList.updated') };
		});
	});

	const events: HistoryEvent[] = [];

	if (!comments.some(comment => comment.type === 'crud' && comment.action === 'create')) {
		events.push({
			author: getAuthor(acceptance.created_by),
			time: acceptance.created_at,
			title: t('default:rides.acceptance.RideAcceptanceCommentList.crud.create'),
		});
	}

	if (ride.operational_status === 'ended' && ride.end_time_observed != null) {
		events.push({ author: system, time: ride.end_time_observed, title: t('default:rides.acceptance.RideAcceptanceCommentList.ride_ended') });
	}

	const check = analyses?.simple_three_vehicle_events;
	if (check) {
		events.push({
			author: 'rides-examiner',
			time: check.updated_at,
			title: t(`default:rides.acceptance.RideAcceptanceCommentList.check.${check.grade_status}`),
		});
	}

	events.push(...loggedEvents);

	const savedJustification = RideJustificationSchema.safeParse(justification).data;
	if (savedJustification) recoveredJustifications.set(JSON.stringify(savedJustification), savedJustification);
	for (const [key, saved] of recoveredJustifications) {
		if (!recordedJustifications.has(key)) events.push(toJustificationEvent(saved));
	}

	events.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));

	const lastStatusEvent = events.findLast(event => event.status !== undefined);
	const currentStatus = acceptance.acceptance_status;
	const currentStatusEvent = lastStatusEvent?.status === currentStatus ? lastStatusEvent : undefined;
	const justificationTime = currentStatus === 'under_review' ? justification?.created_at : undefined;
	const currentStatusTime = currentStatusEvent?.time ?? ((justificationTime ?? 0) >= (lastStatusEvent?.time ?? 0) ? justificationTime : undefined);
	const history = events.filter(event => event !== currentStatusEvent);
	history.push({
		author: currentStatusEvent?.author,
		kind: 'current',
		time: currentStatusTime,
		title: t(`ride_status:acceptance_status.${currentStatus}`),
	});

	//
	// C. Render components

	return (
		<Surface className={acceptanceStyles.card}>
			<Section className={styles.history} gap="lg" justifyContent="space-between" padding="lg">
				<Section padding="none">
					<Label size="lg">{t('default:rides.acceptance.RideAcceptanceCommentList.title')}</Label>
					<ol className={styles.timeline}>
						{history.map(({ author, justification, kind, time, title }, index) => (
							<li key={`${time}-${index}`} className={styles.event} data-kind={kind}>
								<span className={styles.marker} aria-hidden>
									{kind === 'alert' && <IconAlertCircle size={19} />}
									{kind === 'note' && <IconMessageCircle size={17} />}
								</span>
								<div className={styles.eventContent}>
									{time == null ? <span /> : (
										<time className={styles.time} dateTime={new Date(time).toISOString()} title={dateFormat.format(time)}>
											{timeFormat.format(time)}
										</time>
									)}
									<div className={styles.eventText}>
										<Text weight={kind === 'note' ? 'medium' : 'bold'}>{title}</Text>
										{(kind === 'current' || author) && (
											<Label size="sm">
												{kind === 'current' && t('default:rides.acceptance.RideAcceptanceCommentList.current_status')}
												{kind === 'current' && author && ' · '}
												{author}
											</Label>
										)}
										{justification && (
											<details>
												<summary>{t('default:rides.acceptance.RideAcceptanceCommentList.justification.details')}</summary>
												<Section gap="sm" padding="sm">
													<RideAcceptanceJustificationReadOnly justification={justification} />
												</Section>
											</details>
										)}
									</div>
								</div>
							</li>
						))}
					</ol>
				</Section>
				<HasPermission action={PermissionCatalog.all.rides.actions.acceptance_comment_activity} scope={PermissionCatalog.all.rides.scope}>
					<RideAcceptanceCommentForm isLocked={acceptance.is_locked} />
				</HasPermission>
			</Section>
		</Surface>
	);

	//
}
