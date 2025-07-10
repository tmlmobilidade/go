'use client';

import { fetchData, HttpResponse } from '@/lib/http';
import { Session } from '@tmlmobilidade/types';
import { useState } from 'react';

interface UsechangePasswordReturn {
	changePassword: (password: string) => Promise<HttpResponse<Session>>
	loading: boolean
}

export function usechangePassword(): UsechangePasswordReturn {
	const [loading, setLoading] = useState<boolean>(false);
	setLoading(true);
	const changePassword = async (password: string) => {
		const response = await fetchData<Session>(
			`/api/change-password`,
			'POST',
			{ password },
		);

		setLoading(false);

		return response;
	};

	return { changePassword, loading };
}
