/* * */

import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface NoDataLabelProps {
	fill?: boolean
	text?: string
	withMinHeight?: boolean
}

/* * */

export function NoDataLabel({ fill, text, withMinHeight }: NoDataLabelProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return <div className={`${styles.container} ${fill && styles.fill} ${withMinHeight && styles.withMinHeight}`}>{text || t('default:layout.NoDataLabel.no_data')}</div>;

	//
}
