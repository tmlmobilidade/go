'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { useLinesContext } from '@/components/lines/Lines.context';
import { formatMotisPlanDuration, formatMotisPlanDurationMinutes, formatMotisPlanTime, getMotisItineraryDurationSeconds, getMotisItineraryEnd, getMotisItineraryStart, getMotisItineraryWalkMinutes, getMotisLegDetail, getMotisLegDurationSeconds, getMotisLegMode, getMotisLegModeKind, getMotisLegRouteLabel, getMotisTransfersCount, isMotisWalkingLeg, type MotisItinerary, type MotisPlanLeg } from '@/utils/route-planner-motis';
import { IconBike, IconBus, IconCar, IconChevronRight, IconElevator, IconFerry, IconPlane, IconRefresh, IconRoute, IconScooter, IconTrain, IconWalk } from '@tabler/icons-react';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface RoutePlannerItineraryCardProps {
	index: number
	itinerary: MotisItinerary
}

/* * */

export function RoutePlannerItineraryCard({ index, itinerary }: RoutePlannerItineraryCardProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const linesContext = useLinesContext();
	const [isExpanded, setIsExpanded] = useState(false);

	//
	// B. Transform data

	const legs = Array.isArray(itinerary.legs) ? itinerary.legs : [];
	const start = getMotisItineraryStart(itinerary);
	const end = getMotisItineraryEnd(itinerary);
	const duration = formatMotisPlanDuration(getMotisItineraryDurationSeconds(itinerary));
	const transfers = getMotisTransfersCount(itinerary.transfers, legs);
	const walkingMinutes = getMotisItineraryWalkMinutes(legs);
	const fallbackLegOrigin = t('default:routes.RoutePlanner.results.origin');
	const fallbackLegDestination = t('default:routes.RoutePlanner.results.destination');

	const lineByShortName = useMemo(() => {
		return new Map(linesContext.data.lines.map(line => [line.short_name, line]));
	}, [linesContext.data.lines]);

	//
	// C. Handle actions

	const handleToggleDetails = () => {
		setIsExpanded(current => !current);
	};

	//
	// D. Render components

	return (
		<article className={styles.card} data-recommended={index === 0}>
			<div className={styles.header}>
				<div className={styles.summaryRow}>
					<div className={styles.duration}>
						<strong>{duration || t('default:routes.RoutePlanner.results.duration_unavailable')}</strong>
					</div>

					{index === 0 && (
						<span className={styles.recommended}>
							{t('default:routes.RoutePlanner.results.recommended')}
						</span>
					)}
				</div>

				<div className={styles.headerMeta}>
					<span>{formatMotisPlanTime(start)}{' -> '}{formatMotisPlanTime(end)}</span>
					<span className={styles.metric}>
						<IconRefresh size={16} />
						{t('default:routes.RoutePlanner.results.transfers', '', { count: transfers })}
					</span>
					<span className={styles.metric}>
						<IconWalk size={16} />
						{t('default:routes.RoutePlanner.results.walking_time', '', { count: walkingMinutes })}
					</span>
				</div>
			</div>

			<div aria-label={t('default:routes.RoutePlanner.results.route_summary')} className={styles.routeStrip}>
				{legs.map((leg, legIndex) => (
					<RoutePlannerLegStripItem
						key={`${getMotisLegMode(leg)}-${legIndex}`}
						leg={leg}
						lineByShortName={lineByShortName}
						showConnector={legIndex < legs.length - 1}
					/>
				))}
			</div>

			{isExpanded && (
				<div className={styles.legList}>
					{legs.map((leg, legIndex) => (
						<div key={`${getMotisLegDetail(leg, fallbackLegOrigin, fallbackLegDestination)}-${legIndex}`} className={styles.legRow}>
							<div className={styles.legIcon} data-mode={getMotisLegModeKind(leg)}>
								<RoutePlannerModeIcon leg={leg} size={18} />
							</div>
							<div className={styles.legContent}>
								<div className={styles.legTitle}>
									<RoutePlannerLinePill leg={leg} lineByShortName={lineByShortName} />
									{!isMotisWalkingLeg(leg) && leg.headsign && <span className={styles.headsign}>{leg.headsign}</span>}
									<RoutePlannerLegDurationChip leg={leg} />
								</div>
								<span className={styles.legDetail}>
									{getMotisLegDetail(leg, fallbackLegOrigin, fallbackLegDestination)}
								</span>
							</div>
						</div>
					))}
				</div>
			)}

			<button
				aria-expanded={isExpanded}
				className={styles.detailsButton}
				onClick={handleToggleDetails}
				type="button"
			>
				{isExpanded ? t('default:routes.RoutePlanner.results.hide_details') : t('default:routes.RoutePlanner.results.view_details')}
				<IconChevronRight size={18} />
			</button>
		</article>
	);

	//
}

/* * */

interface RoutePlannerLegStripItemProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
	showConnector: boolean
}

function RoutePlannerLegStripItem({ leg, lineByShortName, showConnector }: RoutePlannerLegStripItemProps) {
	//

	//
	// A. Transform data

	const durationMinutes = formatMotisPlanDurationMinutes(getMotisLegDurationSeconds(leg));

	//
	// B. Render components

	return (
		<div className={styles.stripItem}>
			{isMotisWalkingLeg(leg) ? (
				<div className={styles.walkPill}>
					<IconWalk size={15} />
					{durationMinutes ? `${durationMinutes}'` : null}
				</div>
			) : (
				<>
					<div className={styles.modeIcon} data-mode={getMotisLegModeKind(leg)}>
						<RoutePlannerModeIcon leg={leg} size={16} />
					</div>
					<RoutePlannerLinePill leg={leg} lineByShortName={lineByShortName} />
				</>
			)}
			{showConnector && <span className={styles.connector}>•••</span>}
		</div>
	);

	//
}

/* * */

interface RoutePlannerLinePillProps {
	leg: MotisPlanLeg
	lineByShortName: Map<string, HubLine>
}

function RoutePlannerLinePill({ leg, lineByShortName }: RoutePlannerLinePillProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const label = isMotisWalkingLeg(leg) ? t('default:routes.RoutePlanner.results.walk_label') : getMotisLegRouteLabel(leg);
	const modeKind = getMotisLegModeKind(leg);
	const lineData = lineByShortName.get(label);

	//
	// C. Render components

	if (!isMotisWalkingLeg(leg) && lineData) {
		return <LineBadge lineData={lineData} size="md" />;
	}

	return (
		<span className={styles.linePill} data-mode={modeKind}>
			{label}
		</span>
	);

	//
}

/* * */

interface RoutePlannerLegDurationChipProps {
	leg: MotisPlanLeg
}

function RoutePlannerLegDurationChip({ leg }: RoutePlannerLegDurationChipProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const durationMinutes = formatMotisPlanDurationMinutes(getMotisLegDurationSeconds(leg));

	//
	// C. Render components

	if (durationMinutes === null) return null;

	return (
		<span className={styles.legDuration}>
			{t('default:routes.RoutePlanner.results.leg_duration', '', { count: durationMinutes })}
		</span>
	);

	//
}

/* * */

interface RoutePlannerModeIconProps {
	leg: MotisPlanLeg
	size: number
}

function RoutePlannerModeIcon({ leg, size }: RoutePlannerModeIconProps) {
	const modeKind = getMotisLegModeKind(leg);

	if (modeKind === 'walk') return <IconWalk size={size} />;
	if (modeKind === 'bus') return <IconBus size={size} />;
	if (modeKind === 'bike') return <IconBike size={size} />;
	if (modeKind === 'car') return <IconCar size={size} />;
	if (modeKind === 'ferry') return <IconFerry size={size} />;
	if (modeKind === 'plane') return <IconPlane size={size} />;
	if (modeKind === 'scooter') return <IconScooter size={size} />;
	if (modeKind === 'elevator') return <IconElevator size={size} />;
	if (modeKind === 'transit') return <IconRoute size={size} />;

	return <IconTrain size={size} />;
}
