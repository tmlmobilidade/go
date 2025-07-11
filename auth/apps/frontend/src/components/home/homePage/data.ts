import { ReactNode } from "react";

export interface QuickLink {
	icon: ReactNode
	href: string
	title: string
}


export const quickLinks: QuickLink[] = [
	{ icon: '👤', href: 'https://carrismetropolitana.pt/', title: 'Carris Metropolitana' },
	{ icon: '⚠️', href: 'http://localhost:51001', title: 'Alertas' },
	{ icon: '📊', href: 'http://localhost:51002', title: 'Monitorização' },
	{ icon: '🚌', href: 'http://localhost:51003', title: 'Paragens' },
];
