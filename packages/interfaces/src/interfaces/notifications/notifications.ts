/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { roles } from '@/interfaces/auth/roles.js';
import { users } from '@/interfaces/auth/users.js';
import { getModuleConfig } from '@tmlmobilidade/consts';
import { type CreateNotificationDto, CreateNotificationSchema, type Notification, NotificationPermission, Permission, Role, UpdateNotificationDto, UpdateNotificationSchema, User } from '@tmlmobilidade/types';
import { asyncSingletonProxy, mergeObjects } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class NotificationsClass extends MongoCollectionClass<Notification, CreateNotificationDto, UpdateNotificationDto> {
	private static _instance: NotificationsClass;

	protected override createSchema: z.ZodSchema = CreateNotificationSchema;
	protected override updateSchema: z.ZodSchema = UpdateNotificationSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!NotificationsClass._instance) {
			const instance = new NotificationsClass();
			await instance.connect();
			NotificationsClass._instance = instance;
		}
		return NotificationsClass._instance;
	}

	public async sendNotification(
		scope: string,
		topic: string,
		user: User,
		id: string,
		title: string,
		description: string,
	): Promise<void> {
		// Fetch roles and users that have access to this topic
		const rolesWithTopic = await roles.findMany({ 'permissions.action': topic });
		const roleIdsWithTopic = rolesWithTopic.map(r => r._id);

		const usersWithTopic = await users.findMany({
			$or: [
				{ 'permissions.action': topic },
				{ role_ids: { $in: roleIdsWithTopic } },
			],
		});

		if (usersWithTopic.length === 0) return;

		// Base notification template
		const baseNotification: CreateNotificationDto = {
			created_by: user?._id,
			is_read: false,
			payload: {
				body: description,
				href: `${getModuleConfig(scope, 'frontend_url')}/${scope}/${id}`,
				icon: scope,
				title,
			},
			priority: 'normal',
			scope,
			topic,
			updated_by: user?._id,
		};

		// Iterate over eligible users (excluding creator)
		for (const recipient of usersWithTopic.filter(u => u._id !== baseNotification.created_by)) {
			const permissions = this.collectUserPermissions(recipient, rolesWithTopic);
			const canReceiveEmail = this.getNotificationPermission(permissions, topic);

			const newNotification: CreateNotificationDto = { ...baseNotification, user_id: recipient._id };

			const result = await notifications.insertOne(newNotification);

			// // Send email if permission allows
			// if (canReceiveEmail) {
			// 	await sendGenericNotificationEmail({
			// 		data: {
			// 			body: result.payload.body,
			// 			notificationId: result._id,
			// 			notificationUrl: result.payload.href ?? '',
			// 			title: result.payload.title,
			// 		},
			// 		to: recipient.email,
			// 	});
			// }
		}
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { name: 1 }, unique: true },
		];
	}

	protected getCollectionName(): string {
		return 'notifications';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}

	/**
	 * Collects all effective permissions of a user (direct + via roles),
	 * merging duplicates by (scope:action).
	 */
	private collectUserPermissions(user: User, rolesWithTopic: Role[]): Map<string, Permission> {
		const rolePermissions = rolesWithTopic
			.filter(role => user.role_ids?.includes(role._id))
			.flatMap(role => role.permissions ?? []);

		const allPermissions = [...rolePermissions, ...(user.permissions ?? [])];

		const map = new Map<string, Permission>();

		for (const permission of allPermissions) {
			const key = `${permission.scope}:${permission.action}`;
			const existing = map.get(key);

			map.set(key, existing ? mergeObjects(existing, permission as Permission) : permission as Permission);
		}

		return map;
	}

	/**
	 * Determines whether a user can receive email notifications for a topic.
	 */
	private getNotificationPermission(
		permissions: Map<string, Permission>,
		topic: string,
	): boolean {
		const permission = permissions.get(`notifications:${topic}`);
		return (permission['resource'] as NotificationPermission)?.send_mail ?? false;
	}
}

/* * */

export const notifications = asyncSingletonProxy(NotificationsClass);
