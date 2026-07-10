/* * */

import type { Db, MongoClient } from '@tmlmobilidade/go-clients-mongo';
import type { Agency, CreateAgencyDto, CreateFileDto, CreateFileExportDto, CreateOrganizationDto, CreateRoleDto, CreateSessionDto, CreateUserDto, CreateVerificationTokenDto, File, FileExport, Organization, Role, Session, UpdateAgencyDto, UpdateFileDto, UpdateOrganizationDto, UpdateRoleDto, UpdateSessionDto, UpdateUserDto, UpdateVerificationTokenDto, User, VerificationToken } from '@tmlmobilidade/types';

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { CreateAgencySchema, CreateFileExportSchema, CreateFileSchema, CreateOrganizationSchema, CreateRoleSchema, CreateSessionSchema, CreateUserSchema, CreateVerificationTokenSchema, UpdateAgencySchema, UpdateFileExportSchema, UpdateFileSchema, UpdateOrganizationSchema, UpdateRoleSchema, UpdateSessionSchema, UpdateUserSchema, UpdateVerificationTokenSchema } from '@tmlmobilidade/types';

/* * */

export class CoreDatabase {
	//

	//
	// Collections
	public readonly agencies: MongoInterfaceTemplate<Agency, CreateAgencyDto, UpdateAgencyDto>;
	public readonly exports: MongoInterfaceTemplate<FileExport, CreateFileExportDto<any>, Partial<FileExport>>;
	public readonly files: MongoInterfaceTemplate<File, CreateFileDto, UpdateFileDto>;
	public readonly organizations: MongoInterfaceTemplate<Organization, CreateOrganizationDto, UpdateOrganizationDto>;
	public readonly roles: MongoInterfaceTemplate<Role, CreateRoleDto, UpdateRoleDto>;
	public readonly sessions: MongoInterfaceTemplate<Session, CreateSessionDto, UpdateSessionDto>;
	public readonly users: MongoInterfaceTemplate<User, CreateUserDto, UpdateUserDto>;
	public readonly verificationTokens: MongoInterfaceTemplate<VerificationToken, CreateVerificationTokenDto, UpdateVerificationTokenDto>;

	//
	private readonly database: Db;
	private readonly databaseName = 'core';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);

		// Create collection interfaces
		this.agencies = new MongoInterfaceTemplate<Agency, CreateAgencyDto, UpdateAgencyDto>('agencies', this.database, CreateAgencySchema, UpdateAgencySchema);
		this.exports = new MongoInterfaceTemplate<FileExport, CreateFileExportDto<any>, Partial<FileExport>>('exports', this.database, CreateFileExportSchema, UpdateFileExportSchema);
		this.organizations = new MongoInterfaceTemplate<Organization, CreateOrganizationDto, UpdateOrganizationDto>('organizations', this.database, CreateOrganizationSchema, UpdateOrganizationSchema);
		this.roles = new MongoInterfaceTemplate<Role, CreateRoleDto, UpdateRoleDto>('roles', this.database, CreateRoleSchema, UpdateRoleSchema);
		this.sessions = new MongoInterfaceTemplate<Session, CreateSessionDto, UpdateSessionDto>('sessions', this.database, CreateSessionSchema, UpdateSessionSchema);
		this.users = new MongoInterfaceTemplate<User, CreateUserDto, UpdateUserDto>('users', this.database, CreateUserSchema, UpdateUserSchema);
		this.verificationTokens = new MongoInterfaceTemplate<VerificationToken, CreateVerificationTokenDto, UpdateVerificationTokenDto>('verificationTokens', this.database, CreateVerificationTokenSchema, UpdateVerificationTokenSchema);
		this.files = new MongoInterfaceTemplate<File, CreateFileDto, UpdateFileDto>('files', this.database, CreateFileSchema, UpdateFileSchema);
	}
}
