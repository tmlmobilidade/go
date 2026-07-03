/* * */

import type { Db, MongoClient } from '@tmlmobilidade/go-clients-mongo';

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { Agency, CreateAgencyDto, CreateAgencySchema, CreateFileDto, CreateFileExportDto, CreateFileExportSchema, CreateFileSchema, CreateOrganizationDto, CreateOrganizationSchema, CreateRoleDto, CreateRoleSchema, CreateSessionDto, CreateSessionSchema, CreateUserDto, CreateUserSchema, CreateVerificationTokenDto, CreateVerificationTokenSchema, FileExport, Organization, Role, Session, UpdateAgencyDto, UpdateAgencySchema, UpdateFileDto, UpdateFileExportSchema, UpdateFileSchema, UpdateOrganizationDto, UpdateOrganizationSchema, UpdateRoleDto, UpdateRoleSchema, UpdateSessionDto, UpdateSessionSchema, UpdateUserDto, UpdateUserSchema, UpdateVerificationTokenDto, UpdateVerificationTokenSchema, User, VerificationToken } from '@tmlmobilidade/types';

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
