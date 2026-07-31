/* * */

import { type PassengerDemandValue } from '@tmlmobilidade/go-types-public-info';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	currentValue: number
	referenceValue: number
	typicalRange: PassengerDemandTypicalRange
}

type PassengerDemandTypicalRange = NonNullable<PassengerDemandValue['typical_range']>;

/* * */

export function DemandRangeGauge({ currentValue, referenceValue, typicalRange }: Props) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const numberFormatter = useMemo(() => new Intl.NumberFormat(i18n.language, {
		compactDisplay: 'short',
		maximumFractionDigits: 1,
		notation: 'compact',
	}), [i18n.language]);

	//
	// B. Transform data

	const typicalWidth = Math.max(1, typicalRange.upper - typicalRange.lower);
	const padding = Math.max(1, typicalWidth * 0.75, typicalRange.upper * 0.05);
	const scaleMinimum = Math.max(0, Math.min(currentValue, referenceValue, typicalRange.lower) - padding);
	const scaleMaximum = Math.max(currentValue, referenceValue, typicalRange.upper) + padding;
	const scaleRange = Math.max(1, scaleMaximum - scaleMinimum);
	const toPosition = (value: number) => Math.min(100, Math.max(0, (value - scaleMinimum) / scaleRange * 100));
	const currentPosition = toPosition(currentValue);
	const lowerPosition = toPosition(typicalRange.lower);
	const referencePosition = toPosition(referenceValue);
	const upperPosition = toPosition(typicalRange.upper);
	const toSvgPosition = (position: number) => position * 10;

	//
	// F. Render components

	return (
		<section aria-label={t('default:videowall.demand_chart.reference_range')} className={styles.container}>
			<div className={styles.header}>
				<p>{t('default:videowall.demand_chart.reference_range')}</p>
			</div>

			<svg
				aria-hidden="true"
				className={styles.gauge}
				preserveAspectRatio="none"
				viewBox="0 0 1000 60"
			>
				<rect className={styles.belowRange} height="12" width={toSvgPosition(lowerPosition)} x="0" y="22" />
				<rect
					className={styles.typicalRange}
					height="12"
					width={toSvgPosition(upperPosition - lowerPosition)}
					x={toSvgPosition(lowerPosition)}
					y="22"
				/>
				<rect
					className={styles.aboveRange}
					height="12"
					width={toSvgPosition(100 - upperPosition)}
					x={toSvgPosition(upperPosition)}
					y="22"
				/>
				<line
					className={styles.referenceMarker}
					x1={toSvgPosition(referencePosition)}
					x2={toSvgPosition(referencePosition)}
					y1="18"
					y2="38"
				/>
				<text
					className={styles.referenceValue}
					textAnchor="middle"
					x={toSvgPosition(referencePosition)}
					y="14"
				>
					{t('default:videowall.demand_chart.reference_value', '', {
						value: numberFormatter.format(referenceValue),
					})}
				</text>
				<line
					className={styles.currentMarker}
					x1={toSvgPosition(currentPosition)}
					x2={toSvgPosition(currentPosition)}
					y1="18"
					y2="38"
				/>
				<text
					className={styles.rangeValue}
					textAnchor="middle"
					x={toSvgPosition(lowerPosition)}
					y="56"
				>
					{numberFormatter.format(typicalRange.lower)}
				</text>
				<text
					className={styles.rangeValue}
					textAnchor="middle"
					x={toSvgPosition(upperPosition)}
					y="56"
				>
					{numberFormatter.format(typicalRange.upper)}
				</text>
			</svg>
		</section>
	);

	//
}
