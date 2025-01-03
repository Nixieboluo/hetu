import { Static, t } from 'elysia';
import { UsersRepository } from '~backend/users/users.repository';
import { PasswordService } from '~backend/services/auth/password';
import { sessionSchema, SessionScope, SessionService } from '~backend/services/auth/session';

export const signupBodySchema = t.Object({
	name: t.String({
		minLength: 3,
		maxLength: 16,
	}),
	email: t.String({ format: 'email' }),
	password: t.String({
		minLength: 8,
		maxLength: 120,
	}),
});
export const signupResponseSchema = t.Object({
	session: sessionSchema,
});

export async function signup(
	body: Static<typeof signupBodySchema>,
): Promise<Static<typeof signupResponseSchema>> {
	const passwordHash = await PasswordService.hash(body.password);

	if (await UsersRepository.emailOrNameExists(body.email, body.name))
		throw new Error('User already exists.');

	const user = await UsersRepository.createWithPassword({
		name: body.name,
		email: body.email,
		passwordHash,
	});

	const session = await SessionService.create(user.id, {
		scope: SessionScope.DEFAULT,
		metadata: {},
	});

	return { session };
}
