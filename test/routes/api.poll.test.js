import request from 'request-promise-native';
import dbConnection from '../../src/db/DbConnection';
import GroupsRepo from '../../src/repos/GroupsRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';

const {
  get, post, del, put,
} = require('./lib');

// Polls
// Must be running server to test

const googleID = 'usertest';
let group;
let session;
let poll;
let userID;
let token;

beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });
  const user = await UsersRepo.createDummyUser(googleID);
  userID = user.id;
  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  token = session.sessionToken;

  // Create a group
  const opts = { name: 'Test group', code: GroupsRepo.createCode() };
  const result = await request(post('/sessions/', opts, token));
  group = result.data;

  poll = await PollsRepo.createPoll('Poll text', group, [{ letter: 'A', text: 'Saturn' }],
    'multiplechoice', 'A', null, 'ended');

  expect(result.success).toBe(true);
});

test('Get poll by id', async () => {
  await request(get(`/polls/${poll.id}`, token)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(poll.id).toBe(getres.data.id);
  });
});

test('Get polls by group', async () => {
  await request(get(`/sessions/${group.id}/polls`, token)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(poll.id).toBe(getres.data[0].polls[0].id);
  });
});

test('Update poll', async () => {
  const opts = {
    text: 'Updated text',
    answerChoices: { letter: 'A', text: 'Mars' },
    state: 'ended',
  };
  await request(put(`/polls/${poll.id}`, opts, token)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(getres.data.text).toBe('Updated text');
    expect(getres.data.state).toBe('ended');
    expect(getres.data.answerChoices).toMatchObject({ letter: 'A', text: 'Mars' });
  });
});

test('Update poll with invalid token', async () => {
  const opts = {
    text: 'Updated text',
    results: { A: 1 },
  };
  await request(put(`/polls/${poll.id}`, opts, 'invalid'))
    .catch((e) => {
      expect(e.statusCode).toBe(401);
    });
});

test('Delete poll with invalid token', async () => {
  await request(del(`/polls/${poll.id}`, 'invalid'))
    .catch((e) => {
      expect(e.statusCode).toBe(401);
    });
});

test('Delete poll', async () => {
  await request(del(`/polls/${poll.id}`, token)).then((result) => {
    expect(result.success).toBe(true);
  });
});

afterAll(async () => {
  await request(del(`/sessions/${group.id}`, token)).then((result) => {
    expect(result.success).toBe(true);
  });
  await UsersRepo.deleteUserByID(userID);
  await UserSessionsRepo.deleteSession(session.id);
  // eslint-disable-next-line no-console
  console.log('Passed all poll route tests');
});
