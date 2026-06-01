'use client';

import useSWR from 'swr';

const HUB_FAQS_URL = 'https://carrismetropolitana.pt/admin/public-api/faqs-navegante';

export interface NaveganteFaq {
	answer: string
	id: string
	question: string
}

interface UseFaqsNaveganteReturnType {
	faqs: NaveganteFaq[]
	flags: {
		isLoading: boolean
	}
}

async function fetchFaqs(url: string): Promise<NaveganteFaq[]> {
	const res = await fetch(url, { credentials: 'omit' });

	if (!res.ok) {
		throw new Error(`Failed to fetch FAQs: ${res.status}`);
	}

	const data = await res.json();

	return data.map(({ answer, id, question }) => ({
		answer,
		id,
		question,
	}));
}

/**
 * A hook that provides the FAQs for the Navegante app.
 * @returns An object with the FAQs and loading flags.
 */
export function useFaqsNavegante(): UseFaqsNaveganteReturnType {
	//

	//
	// A. Setup variables

	const { data: faqsData, isLoading: faqsLoading } = useSWR<NaveganteFaq[], Error>(HUB_FAQS_URL, fetchFaqs);

	//
	// D. Return data

	return {
		faqs: faqsData ?? [],
		flags: {
			isLoading: faqsLoading,
		},
	};
}
