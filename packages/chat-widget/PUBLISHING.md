# 📦 Publishing Guide for @youssefmohamed07/chat-widget

This guide will help you publish the chat widget package to NPM.

## Prerequisites

### 1. Create NPM Account
- Visit https://www.npmjs.com/signup
- Create a new account or log in if you already have one

### 2. Verify Email
- Check your email inbox for verification email
- Click the verification link

### 3. (Optional) Create Organization
- Visit https://www.npmjs.com/org/create
- Create `@quickair` organization (or use your preferred name)
- This allows you to publish scoped packages like `@youssefmohamed07/chat-widget`

## Publishing Steps

### Step 1: Login to NPM

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

Verify login:
```bash
npm whoami
```

### Step 2: Update Package Name (if needed)

If the package name `@youssefmohamed07/chat-widget` is already taken, update it in `package.json`:

```json
{
  "name": "@your-org/chat-widget",
  // or for unscoped package:
  "name": "your-unique-chat-widget"
}
```

### Step 3: Check Package Contents

Review what will be published:

```bash
npm pack --dry-run
```

This shows all files that will be included. Make sure:
- ✅ `dist/` folder is included
- ✅ `README.md` is included
- ✅ `package.json` is included
- ❌ `src/` folder is NOT included (excluded by .npmignore)
- ❌ `node_modules/` is NOT included

### Step 4: Test Locally (Optional but Recommended)

Create a tarball:
```bash
npm pack
```

This creates `quickair-chat-widget-1.0.0.tgz`

Test in another project:
```bash
cd /path/to/test/project
npm install /path/to/quickair-chat-widget-1.0.0.tgz
```

### Step 5: Publish to NPM

For **scoped public package** (like @youssefmohamed07/chat-widget):
```bash
npm publish --access public
```

For **unscoped package**:
```bash
npm publish
```

### Step 6: Verify Publication

1. Visit https://www.npmjs.com/package/@youssefmohamed07/chat-widget
2. Check that all versions are listed
3. Verify README is displayed correctly
4. Test installation:
   ```bash
   npm install @youssefmohamed07/chat-widget
   ```

## Updating the Package

### Publishing a Patch (Bug Fixes)

```bash
# Increment version: 1.0.0 -> 1.0.1
npm version patch

# Publish
npm publish --access public
```

### Publishing a Minor Update (New Features)

```bash
# Increment version: 1.0.0 -> 1.1.0
npm version minor

# Publish
npm publish --access public
```

### Publishing a Major Update (Breaking Changes)

```bash
# Increment version: 1.0.0 -> 2.0.0
npm version major

# Publish
npm publish --access public
```

### Manual Version Update

Edit `package.json`:
```json
{
  "version": "1.0.1"
}
```

Then publish:
```bash
npm publish --access public
```

## Best Practices

### 1. Update CHANGELOG.md

Before each release, update `CHANGELOG.md`:

```markdown
## [1.0.1] - 2025-11-28

### Fixed
- Fixed bug in date picker component
- Improved error handling

### Changed
- Updated dependencies
```

### 2. Git Tag the Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 3. Create GitHub Release

1. Go to GitHub repository
2. Click "Releases" → "Create a new release"
3. Choose the tag you created
4. Copy changelog content
5. Publish release

### 4. Test Before Publishing

Always run these before publishing:

```bash
# Clean build
rm -rf dist
npm run build

# Run tests (if you have them)
npm test

# Lint code
npm run lint
```

## Troubleshooting

### Error: Package name already exists

Solution: Change the package name in `package.json` to something unique

### Error: You must be logged in

Solution: Run `npm login` again

### Error: 403 Forbidden

Solutions:
- You don't have permission to publish to this scope
- Package name is taken
- Try with `--access public` flag

### Error: Payment required

Solution: Scoped packages require a paid account unless published with `--access public`

## Unpublishing (Use with Caution!)

**Warning**: Unpublishing is permanent and can break projects depending on your package!

```bash
# Unpublish a specific version
npm unpublish @youssefmohamed07/chat-widget@1.0.0

# Unpublish entire package (within 72 hours of publishing)
npm unpublish @youssefmohamed07/chat-widget --force
```

## Package Stats

After publishing, you can track:
- **Downloads**: https://www.npmjs.com/package/@youssefmohamed07/chat-widget
- **Bundle Size**: https://bundlephobia.com/package/@youssefmohamed07/chat-widget
- **Dependencies**: https://www.npmjs.com/package/@youssefmohamed07/chat-widget?activeTab=dependencies

## Support

If you encounter issues:
- NPM Support: https://www.npmjs.com/support
- NPM Documentation: https://docs.npmjs.com/

---

Good luck with your package! 🚀
