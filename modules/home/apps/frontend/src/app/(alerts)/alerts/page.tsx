/* * */

import AlertsPublicList from '@/components/alerts/list/AlertsPublicList';
import { AlertsPublicListHeader } from '@/components/alerts/list/AlertsPublicListHeader';

import styles from './styles.module.css';

/* * */

export default function Page() {
	return (
		<div className={styles.viewport}>
			<AlertsPublicListHeader />
			<AlertsPublicList />
		</div>
	);
}
