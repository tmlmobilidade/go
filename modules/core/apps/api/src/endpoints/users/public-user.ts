import { type User } from '@tmlmobilidade/go-types-core';

/** Remove credentials before serializing a user outside the authentication layer. */
export function toPublicUser(user: User): Omit<User, 'password_hash'> {
	const { password_hash: _passwordHash, ...publicUser } = user;
	return publicUser;
}
