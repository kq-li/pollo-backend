// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import SessionsRepo from '../../../repos/SessionsRepo';
import UsersRepo from '../../../repos/UsersRepo';

class GetSessionsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/sessions/all/member/';
    }

    async content(req: Request) {
        const sessions = await UsersRepo.getSessionsById(req.user.id, 'member');
        if (!sessions) throw LogUtils.logError('Can\'t find sessions for user!');
        const nodes = await sessions
            .filter(Boolean)
            .map(async session => ({
                node: {
                    id: session.id,
                    name: session.name,
                    code: session.code,
                    updatedAt: await SessionsRepo.latestActivityBySessionId(session.id),
                    isLive: await req.app.sessionManager.isLive(session.code),
                },
            }));
        return Promise.all(nodes).then(n => n);
    }
}

export default new GetSessionsRouter().router;
