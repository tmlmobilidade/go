'use client';

import { fetchData, HttpResponse } from '@/lib/http';
import { LoginDto, Session } from '@tmlmobilidade/core-types';
import { useState } from 'react';

interface UseLoginReturn {
	loading: boolean
	login: (credentials: LoginDto) => Promise<HttpResponse<Session>>
}

export function useLogin(authUrl: string): UseLoginReturn {
	const [loading, setLoading] = useState<boolean>(false);

	const login = async (credentials: LoginDto) => {
		setLoading(true);

		console.log(`${authUrl}/login`);

		const response = await fetchData<Session>(
			`${authUrl}/login`,
			'POST',
			credentials,
		);

		setLoading(false);

		return response;
	};

	return { loading, login };
}
