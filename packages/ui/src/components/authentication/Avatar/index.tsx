'use client';

/* * */

import { User } from '@go/types';
import { isUrl } from '@go/strings';
import { Avatar as MantineAvatar } from '@mantine/core';

/* * */

export interface AvatarProps {
	user: User
}

export function Avatar({ user }: AvatarProps) {
	//

	//
	// User has an avatar and it is a valid URL
	if (user.avatar && isUrl(user.avatar)) {
		return <MantineAvatar src={user.avatar} />;
	}

	// User does not have an avatar or the avatar is not a valid URL
	return <MantineAvatar>{user.first_name.charAt(0) + user.last_name.charAt(0)}</MantineAvatar>;
}
