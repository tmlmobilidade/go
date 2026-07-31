/* * */

import { exportsIndexes } from '@/indexes/index.js';
import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type CreateFileExportDto, CreateFileExportSchema, type FileExport, UpdateFileExportSchema } from '@tmlmobilidade/go-types-downloads';
import { type Agency, type AppConfig, type Attachment, type CreateAgencyDto, CreateAgencySchema, type CreateAttachmentDto, CreateAttachmentSchema, type CreateOrganizationDto, CreateOrganizationSchema, type CreateRoleDto, CreateRoleSchema, type CreateSessionDto, CreateSessionSchema, type CreateUserDto, CreateUserSchema, type CreateVerificationTokenDto, CreateVerificationTokenSchema, type Organization, type Role, type Session, type UpdateAgencyDto, UpdateAgencySchema, type UpdateAttachmentDto, UpdateAttachmentSchema, type UpdateOrganizationDto, UpdateOrganizationSchema, type UpdateRoleDto, UpdateRoleSchema, type UpdateSessionDto, UpdateSessionSchema, type UpdateUserDto, UpdateUserSchema, type UpdateVerificationTokenDto, UpdateVerificationTokenSchema, type User, type VerificationToken } from '@tmlmobilidade/types';

/* * */

export class CoreDatabase {
	//

	public readonly agencies: MongoInterfaceTemplate<Agency, CreateAgencyDto, UpdateAgencyDto>;
	public readonly appConfigs: MongoInterfaceTemplate<AppConfig, null, null>;
	public readonly attachments: MongoInterfaceTemplate<Attachment, CreateAttachmentDto, UpdateAttachmentDto>;
	public readonly exports: MongoInterfaceTemplate<FileExport, CreateFileExportDto<any>, Partial<FileExport>>;
	public readonly organizations: MongoInterfaceTemplate<Organization, CreateOrganizationDto, UpdateOrganizationDto>;
	public readonly roles: MongoInterfaceTemplate<Role, CreateRoleDto, UpdateRoleDto>;
	public readonly sessions: MongoInterfaceTemplate<Session, CreateSessionDto, UpdateSessionDto>;
	public readonly users: MongoInterfaceTemplate<User, CreateUserDto, UpdateUserDto>;
	public readonly verificationTokens: MongoInterfaceTemplate<VerificationToken, CreateVerificationTokenDto, UpdateVerificationTokenDto>;

	private readonly database: Db;
	private readonly databaseName = 'core';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);
		// Create collection interfaces
		this.agencies = new MongoInterfaceTemplate<Agency, CreateAgencyDto, UpdateAgencyDto>('agencies', this.database, CreateAgencySchema, UpdateAgencySchema);
		this.appConfigs = new MongoInterfaceTemplate<AppConfig, null, null>('app-configs', this.database, null, null);
		this.exports = new MongoInterfaceTemplate<FileExport, CreateFileExportDto<any>, Partial<FileExport>>('exports', this.database, CreateFileExportSchema, UpdateFileExportSchema, exportsIndexes);
		this.organizations = new MongoInterfaceTemplate<Organization, CreateOrganizationDto, UpdateOrganizationDto>('organizations', this.database, CreateOrganizationSchema, UpdateOrganizationSchema);
		this.roles = new MongoInterfaceTemplate<Role, CreateRoleDto, UpdateRoleDto>('roles', this.database, CreateRoleSchema, UpdateRoleSchema);
		this.sessions = new MongoInterfaceTemplate<Session, CreateSessionDto, UpdateSessionDto>('sessions', this.database, CreateSessionSchema, UpdateSessionSchema);
		this.users = new MongoInterfaceTemplate<User, CreateUserDto, UpdateUserDto>('users', this.database, CreateUserSchema, UpdateUserSchema);
		this.verificationTokens = new MongoInterfaceTemplate<VerificationToken, CreateVerificationTokenDto, UpdateVerificationTokenDto>('verification-tokens', this.database, CreateVerificationTokenSchema, UpdateVerificationTokenSchema);
		this.attachments = new MongoInterfaceTemplate<Attachment, CreateAttachmentDto, UpdateAttachmentDto>('attachments', this.database, CreateAttachmentSchema, UpdateAttachmentSchema);
	}
}
