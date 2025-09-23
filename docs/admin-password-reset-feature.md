# Admin Password Reset Feature

## Overview

This feature allows administrators to reset passwords for any user in the system. It's integrated into the Roles Management page and provides a convenient way for admins to help users who have forgotten their passwords.

## How to Use

1. Navigate to the Roles Management page (`/admin/roles`)
2. Find the user whose password needs to be reset
3. Click the "Reset Password" button next to the user's role dropdown
4. Enter a new password in the dialog that appears
5. Click "Reset Password" to confirm

## Password Requirements

- Minimum 8 characters long
- Can contain letters, numbers, and special characters
- Should be strong and secure

## Security Features

- Only administrators and superadmins can reset passwords
- All password reset actions are logged (in database)
- Passwords are securely hashed using bcrypt
- Tokens are validated before allowing password resets

## API Endpoint

### Reset User Password
- **URL**: `/api/admin/users/password`
- **Method**: `PUT`
- **Headers**: 
  - `Authorization: Bearer [token]` OR cookie with token
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "userId": 1,
    "newPassword": "new_secure_password"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password successfully reset for user John Doe (john.doe@example.com)",
    "userId": 1
  }
  ```

## Implementation Details

The password reset feature consists of:

1. **Frontend Component** (`components/admin/roles-management.tsx`):
   - Added "Reset Password" button for each user
   - Integrated with SweetAlert2 for user-friendly dialogs
   - Shows loading state during password reset
   - Displays success/error messages

2. **Backend API** (`app/api/admin/users/password/route.ts`):
   - Validates admin authentication
   - Checks user permissions
   - Verifies password strength
   - Hashes and stores new password securely
   - Returns success message with user details

## Error Handling

The system handles various error cases:
- Invalid or missing authentication tokens
- Insufficient permissions (non-admin users)
- Missing required fields (userId, newPassword)
- Password too short (< 8 characters)
- User not found
- Database errors
- Network issues

## Testing

The feature has been tested with:
- Valid admin credentials
- Various user accounts
- Different password inputs
- Error conditions
- Edge cases

All tests pass successfully.