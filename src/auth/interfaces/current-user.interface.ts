import { Types } from 'mongoose';
import { UserRoles } from 'src/users/schemas/user.const';

export interface CurrentUserPayload {
  _id: string;
  userId: Types.ObjectId;
  email: string;
  role: UserRoles;
  isAuthenticated: boolean;
}
