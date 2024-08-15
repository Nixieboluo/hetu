import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { jsonb, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { VerificationMetadata } from '~/models/auth';
import { SessionMetadata } from '~/models/session';

export const userAuthTypeEnum = pgEnum('auth_type', ['password']);
export const sessionScopeEnum = pgEnum('session_scope', ['default', 'yggdrasil']);
export const verificationMethodEnum = pgEnum('verification_method', ['email']);

export const userTable = pgTable('user', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	name: varchar('name').unique().notNull(),
	email: varchar('email').unique().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

export const userAuthTable = pgTable(
	'user_auth',
	{
		id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
		userId: varchar('user_id', { length: 24 })
			.notNull()
			.references(() => userTable.id),
		type: userAuthTypeEnum('type').notNull(),
		credential: varchar('credential').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
	},
	(t) => ({
		// Only one password for each user
		uniquePassword: uniqueIndex('unique_password')
			.on(t.userId)
			// Workaround for drizzle-orm #2506
			.where(sql`"user_auth"."type" = 'password'`),
	}),
);

export const sessionTable = pgTable('session', {
	id: varchar('id', { length: 24 }).primaryKey(),
	uid: varchar('uid', { length: 24 }).notNull(),
	userId: varchar('user_id', { length: 24 })
		.notNull()
		.references(() => userTable.id),
	scope: sessionScopeEnum('scope').notNull(),
	metadata: jsonb('metadata').$type<SessionMetadata>().notNull().default({}),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const verificationTable = pgTable('verification', {
	id: varchar('id', { length: 24 }).primaryKey().$defaultFn(createId),
	userId: varchar('user_id', { length: 24 })
		.notNull()
		.references(() => userTable.id),
	method: verificationMethodEnum('method').notNull(),
	secret: varchar('secret').notNull(),
	metadata: jsonb('metadata').$type<VerificationMetadata>().notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
