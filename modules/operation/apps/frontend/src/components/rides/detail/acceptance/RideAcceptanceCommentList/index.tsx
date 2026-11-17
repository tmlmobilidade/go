'use client';

import { IconAlertCircle, IconMessageCircle } from '@tabler/icons-react';
import { type ControllerRidesDetailRideItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type UserDisplay } from '@tmlmobilidade/go-types-core';
import { type RideAcceptance, RideAcceptanceStatusSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { HasPermission, Label, Section, Surface, Text, UserTag } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import acceptanceStyles from '../RideAcceptance/styles.module.css';
import styles from './styles.module.css';

import { useRidesDetailRideAnalysesData } from '../../shared/use-rides-detail-ride-analyses-data';
import { RideAcceptanceCommentForm } from '../RideAcceptanceCommentForm';

/* * */

interface HistoryEvent {
	author?: ReactNode
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
	const loggedEvents = acceptance.comments.flatMap<HistoryEvent>((comment) => {
		const createdBy = comment.created_by as string | UserDisplay;
		const author = typeof createdBy === 'string'
			? (createdBy === 'system' ? system : <UserTag userId={createdBy} variant="inline" />)
			: [createdBy?.first_name, createdBy?.last_name].filter(Boolean).join(' ');
		const event = { author, time: comment.created_at };

		if (comment.type === 'note') return [{ ...event, kind: 'note', title: comment.message }];
		if (comment.type === 'crud') return [{ ...event, title: t(`default:rides.acceptance.RideAcceptanceCommentList.crud.${comment.action}`) }];

		if (comment.field === 'acceptance_status') {
			const status = RideAcceptanceStatusSchema.safeParse(comment.curr_value);
			if (status.success) return [{ ...event, status: status.data, title: t(`ride_status:acceptance_status.${status.data}`) }];
		}
		if (comment.field === 'is_locked') return [{ ...event, title: t(`default:rides.acceptance.RideAcceptanceCommentList.lock.${comment.curr_value ? 'lock' : 'unlock'}`) }];
		if (comment.field === 'analysis_summary') return [{ ...event, title: t('default:rides.acceptance.RideAcceptanceCommentList.summary.performed') }];
		if (comment.field === 'justification') {
			if (event.time === justification?.created_at) return [];
			return [{ ...event, title: t('default:rides.acceptance.RideAcceptanceCommentList.justification.updated') }];
		}
		return [{ ...event, title: t('default:rides.acceptance.RideAcceptanceCommentList.updated') }];
	});

	const events: HistoryEvent[] = [];

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

	if (justification) {
		events.push(justification.justification_source === 'alert'
			? { author: 'rides-acceptor', kind: 'alert', time: justification.created_at, title: t('default:rides.acceptance.RideAcceptanceCommentList.alert_linked') }
			: { time: justification.created_at, title: t('default:rides.acceptance.RideAcceptanceCommentList.manual_submitted') });
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
				<div>
					<Label size="lg">{t('default:rides.acceptance.RideAcceptanceCommentList.title')}</Label>
					<ol className={styles.timeline}>
						{history.map(({ author, kind, time, title }, index) => (
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
									</div>
								</div>
							</li>
						))}
					</ol>
				</div>
				<HasPermission action={PermissionCatalog.all.rides.actions.acceptance_comment_activity} scope={PermissionCatalog.all.rides.scope}>
					<RideAcceptanceCommentForm isLocked={acceptance.is_locked} />
				</HasPermission>
			</Section>
		</Surface>
	);

	//
}
