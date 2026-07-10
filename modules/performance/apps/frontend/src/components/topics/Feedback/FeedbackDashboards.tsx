/* * */

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

const DASHBOARD_LINKS = [
	{ href: '/feedback/lines', id: 'lines', labelKey: 'feedback.dashboards.all_lines' },
	{ href: '/feedback/stops', id: 'stops', labelKey: 'feedback.dashboards.all_stops' },
];

/* * */

export function FeedbackDashboards() {
	const t = useTranslations();

	return (
		<section className={styles.dashboardsSection}>
			<h2 className={styles.dashboardsTitle}>{t('feedback.dashboards.title')}</h2>

			<div className={styles.dashboardButtons}>
				{DASHBOARD_LINKS.map((link) => {
					if (link.href) {
						return (
							<Link key={link.id} className={styles.dashboardButton} href={link.href}>
								{t(link.labelKey)}
							</Link>
						);
					}

					return (
						<button key={link.id} className={styles.dashboardButton} type="button">
							{t(link.labelKey)}
						</button>
					);
				})}
			</div>
		</section>
	);
}
