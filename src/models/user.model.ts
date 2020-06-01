import { ObjectID } from 'mongodb';

// User without sensitive fields
export interface NormalizedUser {
  id: ObjectID;
  username: string;
  email: string;
  lastLoggedIn?: Date;
}

// User with all fields
export interface User extends NormalizedUser {
  _id: ObjectID;
  password: string;
  role?: number;
  deletedAt?: Date;
  createdAt?: Date;
}

// export class User {

//   getUser() {

//   }
// }
