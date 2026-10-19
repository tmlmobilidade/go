'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

const RoutePlannerAnnouncerContext = createContext<(message: string) => void>(() => undefined);

/* * */

export function RoutePlannerAnnouncerProvider({ children }: { children: ReactNode }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routePlannerContext = useRoutePlannerContext();
	const [message, setMessage] = useState('');

	//
	// B. Handle effects

	useEffect(() => {
		if (!routePlannerContext.flags.is_planning) return;
		setMessage(t('default:routes.RoutePlanner.actions.planning'));
	}, [routePlannerContext.flags.is_planning, t]);

	//
	// C. Render components

	return (
		<RoutePlannerAnnouncerContext.Provider value={setMessage}>
			{children}
			<div aria-atomic="true" aria-live="assertive" className={styles.announcer} role="status">{message}</div>
		</RoutePlannerAnnouncerContext.Provider>
	);

	//
}

/* * */

export function useRoutePlannerAnnouncer() {
	return useContext(RoutePlannerAnnouncerContext);
}
