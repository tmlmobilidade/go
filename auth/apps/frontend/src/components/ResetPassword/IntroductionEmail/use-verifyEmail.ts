'use client';

import { fetchData, HttpResponse } from '@/lib/http';
import { Session } from '@tmlmobilidade/types';
import { useState } from 'react';

interface UseverifyEmailReturn {
	loading: boolean
	verifyEmail: (email: string) => Promise<HttpResponse<Session>>
}

export function useVerifyEmail(): UseverifyEmailReturn {
	const [loading, setLoading] = useState<boolean>(false);

	const verifyEmail = async (email: string) => {
		setLoading(true);

		const response = await fetchData<Session>(
			`/api/verify-email`,
			'POST',
			{ email },
		);

		setLoading(false);

		return response;
	};

	return { loading, verifyEmail };
}
