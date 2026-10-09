'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/BottomSheet';
import { useRoutesData } from '@/components/lines/use-routes-data';
import { useStopsData } from '@/components/stops/use-stops-data';
import { formatStopLocation } from '@/utils/transit/format-stop-location';
import { IconAlertTriangle, IconArrowBarToRight, IconCheck, IconChevronDown } from '@tabler/icons-react';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface SelectPatternProps {
	date_filter?: OperationalDateInt
	onChange: (value: string) => void
	patterns: HubV1ApiPattern[]
	value: null | string
}

interface PatternOption {
	disabled: boolean
	firstStopLocation: string
	pattern: HubV1ApiPattern
	title: string
}

interface PatternOptionGroup {
	label: string
	options: PatternOption[]
}

const PLACEHOLDER_HEADSIGN = 'HeadSign to be defined';

function getPatternTitle(pattern: HubV1ApiPattern, routeLongName?: string) {
	if (pattern.headsign && pattern.headsign !== PLACEHOLDER_HEADSIGN) return pattern.headsign;
	return routeLongName || pattern.headsign;
}

/* * */

export function SelectPattern({ date_filter, onChange, patterns, value }: SelectPatternProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: routes } = useRoutesData();
	const { data: stops } = useStopsData();
	const [isOpen, setIsOpen] = useState(false);
	const panelId = useId();

	//
	// B. Transform data

	const patternsForSelect = useMemo(() => {
		const withPath = patterns.filter(pattern => pattern.path.length > 0);
		const base = withPath.length > 0 ? withPath : patterns;
		const selected = value ? patterns.find(pattern => pattern.version_id === value) : undefined;
		return selected && !base.some(pattern => pattern.version_id === value) ? [...base, selected] : base;
	}, [patterns, value]);

	const optionGroups = useMemo<PatternOptionGroup[]>(() => {
		const groups = new Map<string, PatternOption[]>();

		for (const pattern of patternsForSelect) {
			const route = routes.find(candidate => candidate._id === pattern.route_id);
			const firstStop = stops.find(stop => String(stop._id) === String(pattern.path[0]?.stop_id));
			const options = groups.get(pattern.route_id) ?? [];
			options.push({
				disabled: (date_filter ? !pattern.valid_on.includes(date_filter) : false) || !pattern.path.length,
				firstStopLocation: formatStopLocation(firstStop?.locality_name, firstStop?.municipality_name) ?? '',
				pattern,
				title: getPatternTitle(pattern, route?.long_name),
			});
			groups.set(pattern.route_id, options);
		}

		return Array.from(groups, ([routeId, options], index) => {
			const route = routes.find(candidate => candidate._id === routeId);
			return {
				label: String.fromCharCode(65 + index) + ' | ' + (route?.long_name ?? routeId),
				options: options.sort((a, b) => a.pattern.direction_id.localeCompare(b.pattern.direction_id, undefined, { numeric: true })),
			};
		});
	}, [date_filter, patternsForSelect, routes, stops]);

	const selectedOption = optionGroups.flatMap(group => group.options).find(option => option.pattern.version_id === value);

	//
	// C. Handle actions

	const handleOpen = () => {
		setIsOpen(true);
	};

	const handleSelect = (patternVersionId: string) => {
		onChange(patternVersionId);
		setIsOpen(false);
	};

	//
	// D. Render components

	return (
		<>
			<button
				aria-controls={isOpen ? panelId : undefined}
				aria-expanded={isOpen}
				className={styles.trigger}
				onClick={handleOpen}
				type="button"
			>
				<IconArrowBarToRight aria-hidden="true" size={20} />
				<span className={styles.triggerLabel}>
					{selectedOption
						? t('default:lines.SelectPattern.destination', '', { destination: selectedOption.title })
						: t('default:lines.SelectActivePatternGroup.placeholder')}
				</span>
				<IconChevronDown aria-hidden="true" size={18} />
			</button>

			<BottomSheet
				accessibleTitle={t('default:lines.SelectActivePatternGroup.placeholder')}
				initialSnap={1}
				layer="foreground"
				modality="modal"
				onClose={() => setIsOpen(false)}
				opened={isOpen}
				size="half"
				syncSnapState={false}
				title={t('default:lines.SelectActivePatternGroup.placeholder')}
			>
				<div className={styles.panel} id={panelId}>
					{optionGroups.map(group => (
						<section key={group.label} className={styles.group}>
							<h2 className={styles.groupTitle}>{group.label}</h2>
							{group.options.map(option => (
								<button
									key={option.pattern.version_id}
									aria-pressed={option.pattern.version_id === value}
									className={styles.option}
									data-selected={option.pattern.version_id === value}
									disabled={option.disabled}
									onClick={() => handleSelect(option.pattern.version_id)}
									type="button"
								>
									<span className={styles.optionText}>
										<span className={styles.optionTitle}>{option.title}</span>
										<span className={styles.optionSubtitle}>
											{option.pattern.path.length
												? t('default:lines.SelectPattern.option_label', '', { locality: option.firstStopLocation })
												: t('default:lines.SelectPattern.invalid_option_label', '', { message: t('default:lines.SelectPattern.invalid_option', '', { pattern_id: option.pattern._id }) })}
										</span>
									</span>
									{!option.pattern.path.length && <IconAlertTriangle aria-hidden="true" size={18} />}
									{option.pattern.version_id === value && <IconCheck aria-hidden="true" size={20} />}
								</button>
							))}
						</section>
					))}
					{optionGroups.length === 0 && <p className={styles.empty}>{t('default:lines.SelectPattern.no_results')}</p>}
				</div>
			</BottomSheet>
		</>
	);
}
