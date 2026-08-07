'use client';

/* * */

import { AGENCY_INFO, type AgencyId, type AgencyInfo } from '@/agencies/config';
import { Compliance } from '@/components/common/Compliance';
import { getAgencyLogo } from '@/lib/agency-logo';
import { Dates } from '@tmlmobilidade/dates';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

type Props =
  | { agency: AgencyInfo, areaNumber: number, scope: 'agency' }
  | { agency: AgencyInfo, scope: 'standalone' }
  | { scope: 'aggregate' };

interface CurrentTime {
	date: Date
	hours: string
	minutes: string
	seconds: string
}

/* * */

function getCurrentTime(): CurrentTime {
	const date = Dates.now('Europe/Lisbon');

	return {
		date: date.js_date,
		hours: date.toFormat('HH'),
		minutes: date.toFormat('mm'),
		seconds: date.toFormat('ss'),
	};
}

/* * */

export function VideowallHeader(props: Props) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const [currentTime, setCurrentTime] = useState<CurrentTime>();
	const dateFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, {
		day: '2-digit',
		month: 'long',
		timeZone: 'Europe/Lisbon',
		weekday: 'long',
	}), [i18n.language]);
	const formattedDate = currentTime ? dateFormatter.format(currentTime.date) : '—';
	const agencyName = props.scope === 'aggregate'
		? t('default:videowall.header.aggregate_title')
		: props.agency.name;
	const secondaryLabel = props.scope === 'agency'
		? t('default:videowall.header.secondary_label', '', { area: props.areaNumber })
		: props.scope === 'aggregate'
			? t('default:videowall.header.aggregate_secondary_label')
			: props.agency.short_name;
	const logoAgencyId: AgencyId = props.scope === 'aggregate'
		? AGENCY_INFO.CM.agency_id
		: props.agency.agency_id;

	useEffect(() => {
		setCurrentTime(getCurrentTime());
		const timer = setInterval(() => setCurrentTime(getCurrentTime()), 1_000);

		return () => clearInterval(timer);
	}, []);

	//
	// F. Render components

	return (
		<header className={styles.container}>
			<div className={styles.identity}>
				<div className={styles.operatorLogo}>
					<Image
						alt={agencyName}
						height={120}
						src={getAgencyLogo(logoAgencyId, '180x120', 'light')}
						width={180}
						priority
					/>
				</div>
				<div className={styles.agency}>
					<h1>{agencyName}</h1>
					<p>{secondaryLabel}</p>
				</div>
			</div>

			<div className={styles.context}>
				<Compliance variant="header" />
				<div aria-label={t('default:videowall.header.current_time')} className={styles.clock}>
					<div className={styles.time}>
						<span>{currentTime?.hours ?? '--'}</span>
						<span>:</span>
						<span>{currentTime?.minutes ?? '--'}</span>
						<small>{currentTime?.seconds ?? '--'}</small>
					</div>
					<p>{formattedDate}</p>
				</div>
			</div>
		</header>
	);

	//
}
