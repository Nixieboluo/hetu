import { textureTable } from '~/db/schema/texture';
import { ProfilesService } from '../profiles/profiles.service';
import { YggdrasilProfile, YggdrasilProfileTextures, YggdrasilTexture } from './common';
import { eq } from 'drizzle-orm';
import { db } from '~/db/connection';
import { TexturesService } from '../textures/textures.service';
import { Profile } from '~/models/profile';

export abstract class CommonService {
	static getUnsignedUUID(uuid: string): string {
		return uuid.replaceAll('-', '');
	}

	static async getYggdrasilTexture(id: string): Promise<YggdrasilTexture | null> {
		const texture = await TexturesService.getTextureById(id);
		if (!texture) return null;

		return {
			url: TexturesService.getTextureUrlByHash(texture.hash),
			...(texture.type !== 'cape'
				? { metadata: { model: texture.type === 'skin_slim' ? 'slim' : 'default' } }
				: {}),
		};
	}

	static async profileToYggdrasil(
		profile: Profile,
		fullProfile: boolean = false,
		signed: boolean = false,
	): Promise<YggdrasilProfile> {
		const partialProfile = {
			id: this.getUnsignedUUID(profile.id),
			name: profile.name,
		};
		if (!fullProfile) return partialProfile;

		// [TODO] Merge profile quries into one
		const skinTexture = profile.skinTextureId
			? await this.getYggdrasilTexture(profile.skinTextureId)
			: null;

		const capeTexture = profile.capeTextureId
			? await this.getYggdrasilTexture(profile.capeTextureId)
			: null;

		const yggTextures: YggdrasilProfileTextures = {
			timestamp: new Date().getTime(),
			profileId: this.getUnsignedUUID(profile.id),
			profileName: profile.name,
			textures: {
				...(skinTexture ? { SKIN: skinTexture } : {}),
				...(capeTexture ? { CAPE: capeTexture } : {}),
			},
		};

		return {
			...partialProfile,
			properties: [
				{
					name: 'textures',
					value: btoa(JSON.stringify(yggTextures)),
					// [TODO] Support signature in future
				},
				{
					// [TODO] Make this configurable in player profile metadata
					name: 'uploadableTextures',
					value: 'skin,cape',
				},
			],
		};
	}

	/**
	 * Get complete profile by player UUID
	 * @param id player UUID
	 * @returns Yggdrasil profile if exists
	 */
	static async getProfileById(
		id: string,
		signed: boolean = false,
	): Promise<YggdrasilProfile | null> {
		const profile = await ProfilesService.getProfileById(id);
		if (!profile) return null;

		return this.profileToYggdrasil(profile, true, signed);
	}

	/**
	 * Get complete profile by player name
	 * @param name player name
	 * @returns Yggdrasil profile if exists
	 */
	static async getProfileByName(
		name: string,
		signed: boolean = false,
	): Promise<YggdrasilProfile | null> {
		const profile = await ProfilesService.getProfileByName(name);
		if (!profile) return null;

		return this.profileToYggdrasil(profile, true, signed);
	}

	/**
	 * Get all (partial) profiles for a user
	 * @param userId user id
	 * @returns All Yggdrasil profiles for the user
	 */
	static async getProfilesByUser(
		userId: string,
		signed: boolean = false,
	): Promise<YggdrasilProfile[]> {
		// [TODO] Limit query amount
		// [TODO] Merge profile quries into one
		return ProfilesService.getProfilesByUser(userId).then((profiles) =>
			Promise.all(profiles.map((profile) => this.profileToYggdrasil(profile, false, signed))),
		);
	}
}
