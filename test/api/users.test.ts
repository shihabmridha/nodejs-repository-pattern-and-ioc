import * as assert from 'assert';
import * as request from 'supertest';
import app from '../../src/app';
import * as helper from '../index';
import { UserDocument } from '../../src/models/user.model';

describe('Users', () => {
  describe('Create user', () => {
    it('password 400 if password field is empty', async () => {
      const body = { username: 'user', password: 'password' };
      const res = await request(app).post('/users').send(body).expect(400);
      assert.deepEqual(res.text, 'email is required');
    });

    it('response 400 if password field is empty', async () => {
      const body = { username: 'user', email: 'name@gmail.com' };
      const res = await request(app).post('/users').send(body).expect(400);
      assert.deepEqual(res.text, 'password is required');
    });

    it('response 400 if username field is empty', async () => {
      const body = { password: 'user', email: 'name@gmail.com' };
      const res = await request(app).post('/users').send(body).expect(400);
      assert.deepEqual(res.text, 'username is required');
    });

    it('response 400 if email is invalid', async () => {
      const body = { username: 'name', password: 'user', email: 'name' };
      const res = await request(app).post('/users').send(body).expect(400);
      assert.deepEqual(res.text, 'Invalid email');
    });

    it('response 400 if password is less than 4 letter', async () => {
      const body = { username: 'name', password: 'usr', email: 'name@email.com' };
      const res = await request(app).post('/users').send(body).expect(400);
      assert.deepEqual(res.text, 'Invalid password');
    });

    it('response 400 if password is greater than 20 letter', async () => {
      const body = { username: 'name', password: 'thisisaverylargepassword', email: 'name@email.com' };
      const res = await request(app).post('/users').send(body).expect(400);
      assert.deepEqual(res.text, 'Invalid password');
    });

    it('response 400 if email not available', async () => {
      const body = { username: 'name', password: 'pass', email: 'name@email.com' };
      await request(app).post('/users').send(body).expect(201);

      body.username = 'another';
      const res = await request(app).post('/users').send(body).expect(400);
      assert.deepEqual(res.text, 'Try another email');
    });

    it('response 400 if username not available', async () => {
      const body = { username: 'name', password: 'pass', email: 'name@email.com' };
      await request(app).post('/users').send(body).expect(201);

      body.email = 'another@email.com';
      const res = await request(app).post('/users').send(body).expect(400);
      assert.deepEqual(res.text, 'Try another username');
    });

    it('response 201 if success', async () => {
      const body = { username: 'name', password: 'pass', email: 'name@email.com' };
      await request(app).post('/users').send(body).expect(201);
    });

  });

  describe('Users Get', () => {
    let user: UserDocument;
    beforeEach(async () => {
      user = await helper.createUser() as UserDocument;
    });

    it('response 200 if successfully get user by id', async () => {
      const res = await request(app).get(`/users/${user._id}`).expect(200);
      assert.equal(typeof res.body, 'object');
      assert.equal(res.body.username, user.username);
      assert.equal(res.body.email, user.email);
    });

    it('response 200 with normalized user if successfully get user by id', async () => {
      const res = await request(app).get(`/users/${user._id}`).expect(200);
      assert.equal(typeof res.body, 'object');
      assert.equal(res.body.username, user.username);
      assert.deepEqual(res.body.password, undefined);
      assert.deepEqual(res.body._id, undefined);
    });

    it('response 400 if invalid id provided when get user by id', async () => {
      const res = await request(app).get(`/users/invalidId`).expect(400);
      assert.equal(res.text, 'Invalid user id');
    });

    it('response 200 with list of users when get all users', async () => {
      const res = await request(app).get(`/users`).expect(200);
      assert.deepEqual(Array.isArray(res.body.users), true);
      assert.deepEqual(res.body.users.length, 1);
    });

    it('response 200 with N of users when get all users', async () => {
      await helper.createNUsers(5);
      const res = await request(app).get(`/users?perPage=3`).expect(200);
      assert.deepEqual(Array.isArray(res.body.users), true);
      assert.deepEqual(res.body.users.length, 3);
    });

    it('response 200 with N of users from 2nd page when get all users', async () => {
      await helper.createNUsers(5);
      const res = await request(app).get(`/users?perPage=3&page=2`).expect(200);
      assert.deepEqual(Array.isArray(res.body.users), true);
      assert.deepEqual(res.body.users.length, 3);
    });

  });
});
