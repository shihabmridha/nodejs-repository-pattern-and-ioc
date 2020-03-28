import { Document, Schema, model } from 'mongoose';

export interface NormalizedUser {
  username: string;
  email: string;
  lastLoggedIn?: Date;
}

export interface User extends NormalizedUser {
  password: string;
  role?: number;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  isValidPassword?(userGivenPassword: string): Promise<boolean>;
}

export interface UserDocument extends User, Document {}

/**
 * Mongoose specifig code
 */
const userSchema = new Schema({
  username: { type: String, default: null },
  email: { type: String, required: true, default: null },
  password: { type: String, default: null },
  role: { type: Number, default: 3 },
  deletedAt: { type: Date, default: null },
  lastLoggedIn: { type: Date, default: null },
},
  {
    timestamps: true
  });

/**
* Index
*/
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

export const UserModel = model<UserDocument>('User', userSchema);
