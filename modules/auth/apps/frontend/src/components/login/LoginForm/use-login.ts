'use client';

import { LoginDto, Session } from '@tmlmobilidade/go-types';
import { fetchData, HttpResponse } from '@tmlmobilidade/go-utils';
import { useState } from 'react';

interface UseLoginReturn {
	loading: boolean
	login: (credentials: LoginDto) => Promise<HttpResponse<Session>>
}

export function useLogin(): UseLoginReturn {
	const [loading, setLoading] = useState<boolean>(false);

	const login = async (credentials: LoginDto) => {
		setLoading(true);

		const response = await fetchData<Session>(
			`/api/login`,
			'POST',
			credentials,
		);

		setLoading(false);

		return response;
	};

	return { loading, login };
}
