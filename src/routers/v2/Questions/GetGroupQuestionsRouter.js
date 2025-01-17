// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

class GetGroupQuestionsRouter extends AppDevRouter<Object[]> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/sessions/:id/questions/date/';
  }

  async content(req: Request) {
    const { id } = req.params;
    const questions = await GroupsRepo.getQuestions(id);
    if (!questions) {
      throw LogUtils.logErr(`Problem getting questions from group id: ${id}`);
    }
    // Array of all dates
    const datesArray = [];
    // Array of objects with a date and the date's questions
    const questionsByDate = [];
    questions.filter(Boolean).forEach((question) => {
      // date is in Unix time in seconds
      const date = question.createdAt;
      const q = {
        id: question.id,
        text: question.text,
      };
      const ind = datesArray.indexOf(date);
      if (ind === -1) { // date not found
        datesArray.push(date);
        questionsByDate.push({ date, questions: [q] });
      } else { // date found
        questionsByDate[ind].questions.push(q);
      }
    });
    return questionsByDate;
  }
}

export default new GetGroupQuestionsRouter().router;
