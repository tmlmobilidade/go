/* * */

import styles from './styles.module.css';

/* * */

const DASHBOARD_LINKS = [
	{ id: 'lines', label: 'Ver todas as linhas' },
	{ id: 'stops', label: 'Ver todas as paragens' },
];

/* * */

export function FeedbackDashboards() {
	return (
		<section className={styles.dashboardsSection}>
			<h2 className={styles.dashboardsTitle}>Dashboards</h2>

			<div className={styles.dashboardButtons}>
				{DASHBOARD_LINKS.map(link => (
					<button key={link.id} className={styles.dashboardButton} type="button">
						{link.label}
					</button>
				))}
			</div>
		</section>
	);
}

