// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/constants';

class GetLivePollsRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST, false);
  }

  getPath (): string {
    return '/polls/live/';
  }

  async content (req: Request) {
    const codes = req.body.codes;

    if (!codes) throw new Error('Poll codes are missing!');

    const polls = await req.app.sessionManager.liveSessions(codes);
    return polls
      .filter(Boolean)
      .filter(function (s) {
        return !s.isGroup;
      })
      .map(poll => ({
        node: {
          id: poll.id,
          name: poll.name,
          code: poll.code
        }
      }));
  }
}

export default new GetLivePollsRouter().router;
