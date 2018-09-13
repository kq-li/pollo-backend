// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/constants';
import UsersRepo from '../../../repos/UsersRepo';

class GetSessionsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/sessions/all/admin/';
    }

    async content(req: Request) {
        const sessions = await UsersRepo.getSessionsById(req.user.id, 'admin');
        if (!sessions) throw new Error('Can\'t find sessions for user!');
        return sessions
            .filter(Boolean)
            .map(session => ({
                node: {
                    id: session.id,
                    name: session.name,
                    code: session.code,
                },
            }));
    }
}

export default new GetSessionsRouter().router;
