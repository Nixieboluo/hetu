import { Static, t } from 'elysia';
import { AuthRepository } from '~/auth/auth.repository';
import { PasswordService } from '~/services/auth/password';
import { sessionSchema, SessionScope, SessionService } from '~/services/auth/session';

export const changePasswordBodySchema = t.Object({
	oldPassword: t.String(),
	newPassword: t.String({
		minLength: 8,
		maxLength: 120,
	}),
});
export const changePasswordResponseSchema = t.Object({
	session: sessionSchema,
});

export async function changePassword(
	body: Static<typeof changePasswordBodySchema>,
	userId: string,
): Promise<Static<typeof changePasswordResponseSchema>> {
	const oldPasswordHash = await AuthRepository.getPassword(userId);

	// If the user does not have a password, we set a password here.
	const oldPasswordCorrect = oldPasswordHash
		? await PasswordService.compare(body.oldPassword, oldPasswordHash)
		: true;
	if (!oldPasswordCorrect) {
		throw new Error('Invalid old password.');
	}

	const hashedNewPassword = await PasswordService.hash(body.newPassword);
	await AuthRepository.upsertPassword({ userId, passwordHash: hashedNewPassword });

	await SessionService.revokeAll(userId);
	const session = await SessionService.create(userId, {
		scope: SessionScope.DEFAULT,
		metadata: {},
	});

	return { session };
}
