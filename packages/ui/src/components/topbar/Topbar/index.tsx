/* * */

import styles from './styles.module.css';

import { Spacer } from '../../layout/Spacer';
import { ExportsMenu } from '../ExportsMenu';
import { NotificationsMenu } from '../NotificationsMenu';
import { OptionsMenu } from '../OptionsMenu';
import { TopbarGreeting } from '../TopbarGreeting';

/* * */

export function Topbar() {
	return (
		<div className={styles.container}>
			<TopbarGreeting />
			<Spacer />
			<ExportsMenu />
			<NotificationsMenu />
			<OptionsMenu />
		</div>
	);
}
