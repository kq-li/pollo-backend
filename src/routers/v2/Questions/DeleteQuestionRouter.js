// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';
import QuestionsRepo from '../../../repos/QuestionsRepo';

import type { NoResponse } from '../../../utils/AppDevRouter';

class DeleteQuestionRouter extends AppDevRouter<NoResponse> {
  constructor() {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath(): string {
    return '/questions/:id/';
  }

  async content(req: Request) {
    const questionID = req.params.id;
    const { user } = req;

    const group = await QuestionsRepo.getGroupFromQuestionID(questionID);
    if (!group) {
      throw LogUtils.logErr(`Couldn't find group with question ${questionID}`);
    }
    if (!await GroupsRepo.isAdmin(group.id, user)
          && !await QuestionsRepo.isOwnerByID(questionID, user)) {
      throw LogUtils.logErr(
        'You are not authorized to delete this question', {}, { questionID, user },
      );
    }
    await QuestionsRepo.deleteQuestionByID(questionID);
    return null;
  }
}

export default new DeleteQuestionRouter().router;
