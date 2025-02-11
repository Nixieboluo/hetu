import { Elysia } from 'elysia';
import { middlewares } from '~backend/shared/middlewares';
import { AuthRoutes } from '~backend/auth/auth.routes';
import { FilesRoutes } from '~backend/files/files.routes';
import { UsersRoutes } from '~backend/users/users.routes';
import { ProfilesRoutes } from '~backend/profiles/profiles.routes';
import { TexturesRoutes } from '~backend/textures/textures.routes';
import { YggdrasilRoutes } from '~backend/yggdrasil/yggdrasil.routes';

const app = new Elysia()
	// Putting yggdrasil routes here avoids the error being handled twice
	//  [TODO] I'm Looking for solutions better than this.
	.use(YggdrasilRoutes)
	.use(middlewares)
	.use(AuthRoutes)
	.use(FilesRoutes)
	.use(UsersRoutes)
	.use(ProfilesRoutes)
	.use(TexturesRoutes)
	.listen(3000);

export type App = typeof app;
