// ! THIS IS A TEMPORARY FIX FOR THE ML API CERTIFICATE ISSUE

import { exec } from 'child_process';

export async function curlFetcher<T>(url: string, options?: {
	body?: unknown
	headers?: Record<string, string>
	method?: string
}): Promise<T> {
	const method = options?.method ?? 'GET';
	const headers = options?.headers ?? {};

	const curlArgs = [
		'curl',
		'-sSLf',
		'-X', method,
		...Object.entries(headers).map(([key, value]) => `-H "${key}: ${value}"`),
	];

	if (options?.body !== undefined) {
		const bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
		curlArgs.push('--data-raw', `"${bodyStr}"`);
	}

	curlArgs.push(`"${url}"`);

	const curlCommand = curlArgs.join(' ');

	return await new Promise<T>((resolve, reject) => {
		exec(curlCommand, (error, stdout, stderr) => {
			if (error) {
				console.error(`curl error: ${error.message}`);
				reject(new Error(`curl error: ${error.message}`));
				return;
			}
			if (stderr) {
				console.error(`curl stderr: ${stderr}`);
			}
			try {
				const data = JSON.parse(stdout) as T;
				resolve(data);
			} catch (parseError) {
				reject(new Error(`Failed to parse curl response: ${parseError.message}`));
			}
		});
	});
}
