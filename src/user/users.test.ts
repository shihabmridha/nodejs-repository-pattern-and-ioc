import { testPreparation, clearDatabase } from '../common/test.helper';
// import { UserDocument } from './user.repository';
import IUserService from './user.service.interface';
import container from '../core/inversify';
import TYPES from '../types';

describe('Users', () => {
  let userService: IUserService;

  beforeAll(async () => {
    await testPreparation();
    userService = container.get<IUserService>(TYPES.UserService);
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Create user', () => {
    it('should create new user', async () => {
      let users = await userService.getAll();
      expect(users.length).toBe(0);

      await userService.create({
        username: 'name',
        password: 'pass',
        email: 'name@email.com',
      });

      users = await userService.getAll();
      expect(users.length).toBe(1);
    });
  });

  describe('Get user', () => {
    beforeEach(async () => {
      await userService.create({
        username: 'name',
        password: 'pass',
        email: 'name@email.com',
      });
    });

    it('should return all user', async () => {
      const users = await userService.getAll();
      expect(users.length).toBe(1);
    });
  });
});
