import PollsRepo from '../src/repos/PollsRepo';
import QuestionsRepo from '../src/repos/QuestionsRepo';
import dbConnection from '../src/db/DbConnection';

var poll;
var id;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });

  poll = await PollsRepo.createPoll('Poll', PollsRepo.createCode());
});

test('Create Question', async () => {
  const question = await QuestionsRepo.createQuestion('Question', poll, {});
  expect(question.text).toBe('Question');
  expect(question.poll.id).toBe(poll.id);
  expect(question.results).toEqual({});
  id = question.id;
});

test('Get Question', async () => {
  const question = await QuestionsRepo.getQuestionById(id);
  expect(question.text).toBe('Question');
  // expect(question.poll.id).toBe(poll.id);
  expect(question.results).toEqual({});
});

test('Update Question', async () => {
  const question = await QuestionsRepo.updateQuestionById(id, 'New Question');
  expect(question.text).toBe('New Question');
});

test('Get Questions from Poll', async () => {
  const questions = await QuestionsRepo.getQuestionsFromPollId(poll.id);
  expect(questions.length).toEqual(1);
  expect(questions[0].text).toBe('New Question');
});

test('Delete Question', async () => {
  await QuestionsRepo.deleteQuestionById(id);
  expect(await QuestionsRepo.getQuestionById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await PollsRepo.deletePollById(poll.id);
  console.log('Passed all tests');
});
