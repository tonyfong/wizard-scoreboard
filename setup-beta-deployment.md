# 🚀 Beta Deployment Setup Guide

## Choose Your Deployment Method:

### **Option 1: Subdirectory (Easiest)**
- **URL**: `https://tonyfong.github.io/Card-scoreboard/beta/`
- **Use**: `deploy-beta.yml` workflow
- **Pros**: Simple, same repository
- **Cons**: URL includes `/beta/`

### **Option 2: Separate Repository (Clean URL)**
- **URL**: `https://tonyfong.github.io/german-bridge-beta/`
- **Use**: `deploy-beta-repo.yml` workflow
- **Pros**: Clean URL, separate from main
- **Cons**: Need to create new repository

### **Option 3: Subdomain (Professional)**
- **URL**: `https://beta.yourdomain.com/`
- **Use**: `deploy-beta-subdomain.yml` workflow
- **Pros**: Professional subdomain
- **Cons**: Requires custom domain setup

## 🛠️ Setup Instructions:

### For Option 1 (Subdirectory):
1. Keep `deploy-beta.yml` workflow
2. Delete the other two workflow files
3. Push to `mobile-optimization` branch
4. Check Actions tab for deployment status

### For Option 2 (Separate Repository):
1. Create new repository: `german-bridge-beta`
2. Go to Settings → Secrets → Add `BETA_DEPLOY_TOKEN`
3. Generate Personal Access Token with repo permissions
4. Keep `deploy-beta-repo.yml` workflow
5. Delete the other two workflow files

### For Option 3 (Subdomain):
1. Set up custom domain in repository settings
2. Keep `deploy-beta-subdomain.yml` workflow
3. Delete the other two workflow files

## 📋 Quick Start (Recommended - Option 1):

```bash
# 1. Keep only the subdirectory workflow
rm .github/workflows/deploy-beta-repo.yml
rm .github/workflows/deploy-beta-subdomain.yml

# 2. Commit and push
git add .
git commit -m "Setup beta deployment to subdirectory"
git push origin mobile-optimization

# 3. Check deployment status
# Go to: https://github.com/tonyfong/Card-scoreboard/actions
```

## 🔗 After Deployment:

Your beta site will be available at:
- **Option 1**: `https://tonyfong.github.io/Card-scoreboard/beta/`
- **Option 2**: `https://tonyfong.github.io/german-bridge-beta/`
- **Option 3**: `https://beta.yourdomain.com/`

## 🧪 Testing Your Beta:

1. **Deploy**: Push to `mobile-optimization` branch
2. **Wait**: 2-3 minutes for deployment
3. **Test**: Visit your beta URL
4. **Verify**: All functionality works
5. **Share**: Send beta link to testers

## 🔄 Updating Beta:

Every time you push to `mobile-optimization` branch, the beta site will automatically update!
