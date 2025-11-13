/* * */

import styles from './styles.module.css';

import { EnvironmentFlag } from '../../display/EnvironmentFlag';
import { Spacer } from '../../layout/Spacer';
import { TopbarExports } from '../TopbarExports';
import { TopbarGreeting } from '../TopbarGreeting';
import { TopbarNotifications } from '../TopbarNotifications';
import { TopbarOptions } from '../TopbarOptions';

/* * */

export function Topbar() {
	return (
		<div className={styles.container}>
			<TopbarGreeting />
			<Spacer />
			<EnvironmentFlag />
			<TopbarExports />
			<TopbarNotifications />
			<TopbarOptions />
		</div>
	);
}
