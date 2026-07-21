import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import type { IUser, IUserMethods } from '../interfaces/user.interface.js';
import { ALL_ROLES, Role } from '../constants/roles.js';
import { auditFields } from './plugins/auditFields.js';

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        'Please provide a valid phone',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    profileImage: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: Role.CUSTOMER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    specialization: {
      type: [String],
      default: [],
    },
    rating: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, default: 0 },
    },
    availability: {
      type: Map,
      of: [
        {
          start: String,
          end: String,
        },
      ],
      default: new Map(),
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    lastLogin: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    ...auditFields,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

userSchema.method('comparePassword', async function comparePassword(candidatePassword: string) {
  return bcryptjs.compare(candidatePassword, this.password);
});

userSchema.method('getFullName', function getFullName() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', {
  // Destructuring (rather than `delete ret.password`) sidesteps TS's rule
  // that `delete` only applies to optional properties — these fields are
  // required on the schema, so `delete` doesn't type-check here.
  transform: (
    _doc,
    {
      password: _password,
      verificationToken: _v,
      passwordResetToken: _prt,
      passwordResetExpires: _pre,
      ...safe
    }
  ) => safe,
});

// email/phone already get a unique index from `unique: true` above —
// redeclaring `schema.index({ email: 1 })` here would just be a duplicate.
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

export const User = model<IUser, UserModel>('User', userSchema);
export type UserDocument = HydratedDocument<IUser, IUserMethods>;
