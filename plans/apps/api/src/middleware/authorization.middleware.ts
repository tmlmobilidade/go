import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { Permission } from '@tmlmobilidade/types';
import { fetchData, hasPermissionResource } from '@tmlmobilidade/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
	export interface FastifyRequest {
		permissions?: Permission<unknown> // Changed T to unknown to resolve the error
	}
}

export default function authorizationMiddleware<T = unknown>( // Added default type for T
	scope: string,
	action: string,
	resources?: (keyof T)[],
) {
	return async (
		request: FastifyRequest,
		reply: FastifyReply,
	): Promise<void> => {
		const token = request.cookies.session_token;

		if (!token) {
			throw new HttpException(
				HttpStatus.UNAUTHORIZED,
				'Invalid authorization token',
			);
		}

		try {
			const res = await fetchData<Permission<T>>(
				`${process.env.NEXT_PUBLIC_AUTH_URL}/api/permissions?resource=${scope}&action=${action}`,
				'GET',
				undefined,
				{
					Cookie: `session_token=${token}`,
				},
			);

			if (res.status !== HttpStatus.OK) {
				throw new HttpException(
					res.status,
					res.error,
				);
			}

			// Set the permissions
			request.permissions = res.data;

			// Check if the resource is in the permissions
			if (resources) {
				for (const resource of resources) {
					const resource_key = resource as string;
					const hasPermission = hasPermissionResource<T>({
						action,
						permissions: [res.data],
						resource_key: resource,
						scope,
						value: request.permissions?.resource?.[resource_key] as unknown,
					});

					if (!hasPermission) {
						throw new HttpException(
							HttpStatus.FORBIDDEN,
							'You are not authorized to access this resource',
						);
					}
				}
			}
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send({
					message: error.message || 'An unexpected error occurred',
				});
		}
	};
}
