# Upload Storage

Store uploaded image files in these folders and save the relative file path in the database.

---

## Directory Structure

```
uploads/
├── users/
│   └── profile/                ← User profile images
├── creators/
│   └── profile/                ← Creator profile images
├── prompts/
│   └── thumbnail/              ← Prompt thumbnail images
├── prompt/                     ← Prompt-related files
├── payment_method_info/        ← Payment QR codes (admin-managed)
├── exchange_receipts/          ← User payment receipt screenshots
└── image_evidence_report/
    ├── prompt_image_evidence/       ← Evidence for reported prompts
    ├── user_account_image_evidence/ ← Evidence for reported users/creators
    └── review_image_evidence/       ← Evidence for reported reviews
```

---

## User Profile Image

| Item             | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Folder**       | `uploads/users/profile/`                               |
| **Database**     | `users.profile_image`                                  |
| **Naming**       | `user_{userId}_{timestamp}.{ext}`                      |
| **Example path** | `uploads/users/profile/user_1_1779960728.png`          |
| **Max size**     | 5 MB                                                   |
| **Allowed MIME** | `image/jpeg`, `image/png`, `image/gif`, `image/webp`   |
| **Source file**  | `updateUser.php`                                       |

The profile image is uploaded via `updateUser.php`. The `{timestamp}` portion uses PHP `time()` (Unix epoch seconds) so each upload creates a unique filename.

---

## Creator Profile Image

| Item             | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| **Folder**       | `uploads/creators/profile/`                                   |
| **Database**     | `users.profile_image`                                         |
| **Naming**       | `creator_{userId}_{timestamp}.{ext}`                          |
| **Example path** | `uploads/creators/profile/creator_2_1780290173.png`           |
| **Max size**     | 5 MB                                                          |
| **Allowed MIME** | `image/jpeg`, `image/png`, `image/gif`, `image/webp`          |
| **Source file**  | `updateUser.php` · `updatecreatormode.php`                    |

### How the folder is chosen

- In `updateUser.php` the user's `creator_mode` flag is checked:
  - `creator_mode = 1` → image is saved to `uploads/creators/profile/`
  - `creator_mode = 0` → image is saved to `uploads/users/profile/`
- When a user **activates creator mode** (`updatecreatormode.php`), the existing user profile image is **moved** from `uploads/users/profile/` to `uploads/creators/profile/` and renamed with the `creator_` prefix.

> **Note:** Creator statistics stay in the `creator_data` table. The profile image is still stored on the related `users` row because the SQL schema only has `users.profile_image`.

---

## Prompt Thumbnail

| Item             | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Folder**       | `uploads/prompts/thumbnail/`                                       |
| **Database**     | `prompts.thumbnail`                                                |
| **Naming**       | `{timestamp}_{originalFilename}`                                   |
| **Example path** | `uploads/prompts/thumbnail/1780031820_photo_2026-05-29_11-12-38.jpg` |

---

## Report Image Evidence

Evidence images attached to reports use **descriptive filenames** that encode who filed the report, the report type, and the target.

### Filename format

```
{timestamp}_{reporterName}_id{reporterId}_{reportType}_{targetLabel}{targetId}.{ext}
```

The `{reporterName}` is the reporter's `user_name` sanitised to lowercase with special characters replaced by underscores.

### Examples by report type

| Report target type | Subdirectory               | Example filename                                       | Database table & column              |
| ------------------ | -------------------------- | ------------------------------------------------------ | ------------------------------------ |
| `prompt`           | `prompt_image_evidence/`   | `1781496185_john_id5_promptreport_promptid12.png`      | `prompt_reports.image_evidence`      |
| `creator` / `user` | `user_account_image_evidence/`     | `1781496185_mary_id3_userreport_reporteduser7.png`     | `user_reports.image_evidence`        |
| `comment`          | `review_image_evidence/`   | `1781496185_alex_id10_reviewreport_reviewid22.jpg`     | `bad_review_reports.image_evidence`  |

### Common details

| Item             | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Root folder**  | `uploads/image_evidence_report/`                                                       |
| **Source file**  | `submitReport.php`                                                                     |

### How it works (in `submitReport.php`)

1. The DB connection opens **before** the upload to query the reporter's `user_name`.
2. The username is sanitised: lowercased, special characters → `_`, collapsed underscores.
3. A `$_FILES["image_evidence"]` upload is checked.
4. The `$targetType` (`prompt`, `creator`, `user`, `comment`) selects the subdirectory **and** the descriptive filename pattern.
5. The file is saved to `uploads/image_evidence_report/{subDir}/`.
6. The **relative path** stored in the database starts with `users/uploads/image_evidence_report/...`.

---

## Exchange Payment Receipts

When a user submits a coin exchange request, the uploaded receipt screenshot uses a **descriptive filename** with the user's name and payment method.

### Filename format

```
{userName}_id{userId}_{paymentMethodSlug}_receipt_{timestamp}.{ext}
```

The `{paymentMethodSlug}` is derived from the `account_name` in `payment_method_info` (e.g. `KBZ Pay` → `kbzpay`).

### Details

| Item             | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Folder**       | `uploads/exchange_receipts/`                                       |
| **Database**     | `exchange_requests.receipt_image`                                  |
| **Max size**     | 5 MB                                                               |
| **Allowed MIME** | `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf` |
| **Source file**  | `insertexchange.php`                                               |

### Examples

| Payment method | Example filename                             |
| -------------- | -------------------------------------------- |
| KBZ Pay        | `john_id5_kbzpay_receipt_1781496185.png`     |
| AYA Pay        | `mary_id3_ayapay_receipt_1781496185.jpg`     |
| Wave Pay       | `alex_id10_wavepay_receipt_1781496185.png`   |

---

## Payment Method Info (admin-managed)

| Item             | Value                                      |
| ---------------- | ------------------------------------------ |
| **Folder**       | `uploads/payment_method_info/`             |
| **Contents**     | QR code images for payment methods (KBZ Pay, AYA Pay, Wave Pay, etc.) |

---

## General Notes

- All relative paths saved to the database are **forward-slash** paths regardless of the server OS.
- Upload directories are auto-created with `mkdir(..., 0777, true)` if they don't already exist.
- `.gitkeep` files are present in leaf directories to preserve the folder structure in version control.
- **Username sanitisation** for filenames: lowercased, non-alphanumeric characters replaced with `_`, consecutive underscores collapsed.
