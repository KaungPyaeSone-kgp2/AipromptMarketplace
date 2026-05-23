# Upload Storage

Store uploaded image files in these folders and save the relative file path in the database.

## User profile image

- Folder: `backend/uploads/users/profile/`
- Database column: `users.profile_image`
- Example database value: `backend/uploads/users/profile/user_1_20260522.jpg`

## Creator profile image

- Folder: `backend/uploads/creators/profile/`
- Database column: `users.profile_image`
- Example database value: `backend/uploads/creators/profile/creator_1_20260522.jpg`

Creator statistics stay in `creator_data`. The profile image is still stored on the related `users` row because the SQL schema only has `users.profile_image`.

## Creator prompt thumbnail

- Folder: `backend/uploads/prompts/thumbnail/`
- Database column: `prompts.thumbnail`
- Example database value: `backend/uploads/prompts/thumbnail/prompt_10_20260522.jpg`

