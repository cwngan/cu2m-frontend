// utils/toast.ts
import toast from 'react-hot-toast';

export type UserException =
  | 'Unauthorized'
  | 'NotFound'
  | 'BadRequest'
  | 'DuplicateResource'
  | 'InternalError'
  | 'InvalidCredentials'
  | 'PreRegistrationNotFound'
  | 'InvalidLicenseKey'
  | 'UsernameTaken'
  | 'InvalidResetToken';

const exceptionMessages: Record<UserException, string> = {
  Unauthorized: 'Your session is invalid or has expired. Please log in again.',
  NotFound: 'The requested resource was not found.',
  BadRequest: 'The request was invalid. Please check your input.',
  DuplicateResource: 'This resource already exists.',
  InternalError: 'An unexpected error occurred. Please try again later.',
  InvalidCredentials: 'Incorrect username or password.',
  PreRegistrationNotFound: 'No valid license key found or it has already been used.',
  InvalidLicenseKey: 'The license key you entered is invalid.',
  UsernameTaken: 'This username is already taken.',
  InvalidResetToken: 'The password reset link is invalid or has expired.',
};

export function showErrorToast(exception: UserException) {
  toast.error(exceptionMessages[exception], {
    duration: 10000, // 10 seconds
    position: 'top-center',
    style: {
      background: '#fee2e2',
      color: '#b91c1c',
      border: '1px solid #b91c1c',
      padding: '16px',
      maxWidth: '500px',
    },
  });
}