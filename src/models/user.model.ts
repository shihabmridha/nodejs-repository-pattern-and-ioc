import { Document, Schema, model } from 'mongoose';

// User without sensitive fields
export interface NormalizedUser {
  username: string;
  email: string;
  lastLoggedIn?: Date;
}

// User with all fields
export interface User extends NormalizedUser {
  password: string;
  role?: number;
  deletedAt?: Date;
  createdAt?: Date;
}

/**
 * Mongoose specifig code
 */

// User document
export type UserDocument = User & Document;

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
