# Personal Website Data Model

`SiteProfile` is the main document for one personal website. It holds the
owner details, site presentation, theme preference, and references to the
avatar and cover image.

`Shortcut` stores links to external websites. Set `category` to `shortcut`,
`social`, `portfolio`, or `resource`, then use `position` to control the
display order. Each shortcut can optionally reference a `MediaAsset` as its
cover image or icon.

`MediaAsset` stores image metadata and its storage URL/key. Image binaries
should live in a file service such as Cloudinary or S3 (or a local upload
folder during development), not in MongoDB documents.

`User` stores an account for someone who can sign in and manage the site.
Passwords are salted and hashed with bcrypt before storage. The profile can
reference a `MediaAsset` as its avatar.

## Relationships

```text
SiteProfile
  |- avatar     -> MediaAsset
  |- coverImage -> MediaAsset
  `- Shortcut.site -> SiteProfile
                       `- Shortcut.image -> MediaAsset
```

## Example shortcut

```json
{
  "site": "<site-profile-id>",
  "name": "GitHub",
  "description": "Open source projects and experiments",
  "url": "https://github.com/your-handle",
  "category": "social",
  "position": 1,
  "isVisible": true
}
```
