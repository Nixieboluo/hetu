import { Elysia } from 'elysia';
import { version } from '../package.json';
import swagger from '@elysiajs/swagger';
import { AuthRoutes } from '~/auth/auth.routes';
import { TexturesRoutes } from '~/textures/textures.routes';
import { ProfilesRoutes } from '~/profiles/profiles.routes';
import { YggdrasilRoutes } from '~/yggdrasil/yggdrasil.routes';
import { FilesRoutes } from '~/files/files.routes';

const app = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: 'Hetu API',
					version,
				},
				servers: [
					{
						url: process.env.BASE_URL,
						description: 'Production server',
					},
					{
						url: 'http://localhost:3000',
						description: 'Local development server',
					},
				],
				components: {
					securitySchemes: {
						sessionId: {
							type: 'http',
							scheme: 'bearer',
							bearerFormat: 'Session ID',
						},
					},
				},
				tags: [
					{
						name: 'Authentication',
						description: 'Authentication related APIs.',
					},
					{
						name: 'General',
						description: 'API for general actions.',
					},
					{
						name: 'Textures',
						description: 'API for managing textures.',
					},
					{
						name: 'Profiles',
						description: 'API for managing player profiles.',
					},
					{
						name: 'Yggdrasil',
						description: 'API for authlib-injector.',
					},
					{
						name: 'Yggdrasil Custom',
						description: 'Our own extension for authlib-injector APIs.',
					},
				],
			},
		}),
	)
	.use(AuthRoutes)
	.use(FilesRoutes)
	.use(ProfilesRoutes)
	.use(TexturesRoutes)
	.use(YggdrasilRoutes)
	.listen(3000);

console.log(`Service is running at ${app.server?.hostname}:${app.server?.port}`);
