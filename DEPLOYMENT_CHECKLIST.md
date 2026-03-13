# Distributor Registration - Deployment Checklist

## Pre-Deployment Verification

### Database Verification
- [x] Neon PostgreSQL connected
- [x] Tables created successfully:
  - [x] users table with proper constraints
  - [x] sessions table with proper constraints
  - [x] distributor_profiles table with proper constraints
- [x] Indexes created for performance
- [x] Foreign key relationships established
- [x] Check constraints in place

### API Testing
- [ ] Test POST `/api/distributor/register` with valid data
- [ ] Test validation errors (missing fields)
- [ ] Test duplicate email detection
- [ ] Test duplicate license detection
- [ ] Test duplicate tax ID detection
- [ ] Test GST format validation
- [ ] Test pincode format validation
- [ ] Test password hashing works
- [ ] Test session creation and cookie setting
- [ ] Verify redirect to dashboard after registration

### Frontend Testing
- [ ] Registration page loads without errors
- [ ] Form step navigation works (next/back)
- [ ] Client-side validation shows errors correctly
- [ ] Form submits successfully with valid data
- [ ] Toast notifications appear for success/error
- [ ] Redirect to dashboard happens after registration
- [ ] Dashboard loads and shows verification status
- [ ] Dashboard shows company information
- [ ] Dashboard shows pending verification banner
- [ ] All stub pages (inventory, orders, documents, settings) load

### Header Navigation
- [ ] "Register as Distributor" link visible and clickable
- [ ] Distributor menu items appear when logged in as distributor
- [ ] Navigation links point to correct URLs
- [ ] Sign-in required for authenticated pages

### Security Verification
- [ ] Passwords are bcrypt hashed (check database)
- [ ] Sessions have secure HTTP-only cookies
- [ ] Session tokens are random and unique
- [ ] Password confirmation works
- [ ] Minimum 8 character password enforced
- [ ] Email validation works
- [ ] Unauthorized users redirected to signin

### Mobile/Responsive Testing
- [ ] Registration page responsive on mobile
- [ ] Form elements properly sized on small screens
- [ ] Dashboard responsive on mobile
- [ ] All buttons accessible and clickable
- [ ] Layout doesn't break on tablet

## Deployment Steps

### 1. Environment Setup
```bash
# Verify DATABASE_URL is set in Vercel project
# Verify NODE_ENV is set to 'production'
# Test local build: npm run build
# Test local preview: npm run dev
```

### 2. Git Commit & Push
```bash
git add .
git commit -m "Add complete distributor registration feature"
git push origin main  # or your main branch
```

### 3. Vercel Deployment
- [ ] Push to GitHub repository
- [ ] Vercel automatically deploys (if connected)
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors
- [ ] Visit live site at https://your-domain.com

### 4. Post-Deployment Testing

#### Test Registration Flow
1. [ ] Navigate to `/distributor/register`
2. [ ] Fill form with test data:
   - Name: Test Distributor
   - Email: test-dist-TIMESTAMP@example.com (use unique email)
   - Phone: 9876543210
   - Password: TestPass123!
   - Company: Test Pharma Company
   - License: TL/TEST/2024/001
   - GST: 27AAFHU5055K1Z5
   - Address: 123 Test Street
   - City: TestCity
   - State: TestState
   - Pincode: 123456
   - Service Area: 50
3. [ ] Submit form
4. [ ] Verify redirect to `/distributor/dashboard`
5. [ ] Verify pending verification banner shows
6. [ ] Click through stub pages (inventory, orders, etc.)

#### Test Error Scenarios
1. [ ] Try invalid email
2. [ ] Try mismatched passwords
3. [ ] Try duplicate email
4. [ ] Try invalid GST
5. [ ] Try invalid pincode
6. [ ] Verify error messages display correctly

#### Database Verification
```bash
# Connect to Neon and verify:
SELECT COUNT(*) FROM users WHERE user_type = 'distributor';
SELECT COUNT(*) FROM distributor_profiles;
SELECT * FROM users WHERE email = 'test-dist@example.com';
# Verify password is hashed, not plain text
```

#### Performance Checks
- [ ] Registration page loads in < 2 seconds
- [ ] API response time < 1 second
- [ ] Dashboard loads in < 2 seconds
- [ ] No console errors in browser
- [ ] No server errors in logs

## Rollback Plan (If Issues Found)

### If Critical Bug Found
```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Vercel will automatically redeploy from previous version
```

### If Database Issue
```bash
# Backup current data first
# Can restore from Neon backups

# Drop and recreate tables if needed
DROP TABLE IF EXISTS distributor_profiles CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

# Re-run migration
# psql $DATABASE_URL < scripts/001-init-tables.sql
```

## Monitoring After Deployment

### Watch For
- Registration success rate
- API error rate
- Database connection issues
- Session expiration issues
- Email verification completion (if enabled)

### Daily Checks (First Week)
- [ ] No error spikes in logs
- [ ] Registration conversions normal
- [ ] Database performance normal
- [ ] Session management working
- [ ] No duplicate account issues

### Weekly Checks
- [ ] Total registrations count
- [ ] Verification completion rate
- [ ] User retention metrics
- [ ] Feature adoption rate
- [ ] Support ticket volume related to registration

## Feature Flags (Optional)

If you want to enable/disable the feature:

```typescript
// lib/feature-flags.ts
export const FEATURES = {
  DISTRIBUTOR_REGISTRATION: process.env.NEXT_PUBLIC_ENABLE_DISTRIBUTOR_REG === 'true',
}
```

Then wrap the form in:
```typescript
{FEATURES.DISTRIBUTOR_REGISTRATION && <DistributorSignUpForm />}
```

## Maintenance Tasks

### Weekly
- Review new distributor registrations
- Check verification queue
- Monitor registration errors
- Check session expiration stats

### Monthly
- Analyze registration metrics
- Review failed registrations
- Update verification criteria if needed
- Check database growth rate
- Review backup status

### Quarterly
- Performance optimization review
- Security audit
- Database cleanup (if needed)
- Feature enhancement planning

## Incident Response

### If Registration Fails for All Users
1. Check DATABASE_URL env var
2. Check database connectivity
3. Check server logs for errors
4. Verify tables still exist
5. Check for database locks
6. Restart/redeploy if needed

### If Session Not Working
1. Verify cookies being set correctly
2. Check session table for data
3. Verify session token generation
4. Check cookie settings in code
5. Clear browser cache and try again

### If Users Report Duplicate Email Error
1. Verify user doesn't have existing account
2. Check users table for email
3. If duplicate exists, one may need manual cleanup
4. Ensure email comparison is case-insensitive

## Communication Plan

### During Deployment
- [ ] Notify stakeholders of deployment
- [ ] Provide status updates
- [ ] Document any issues/delays

### Post-Deployment
- [ ] Announce feature to users
- [ ] Provide registration instructions
- [ ] Monitor support channels
- [ ] Collect feedback

### Marketing
- [ ] Email campaign to potential distributors
- [ ] Social media announcement
- [ ] Website banner/promotion
- [ ] Press release (if applicable)

## Success Metrics

### Target Metrics
- Registration completion rate: > 70%
- Average registration time: < 5 minutes
- Error rate: < 2%
- Session success rate: > 99%
- Page load time: < 2 seconds
- API response time: < 1 second

### Measurement
- Track via analytics/logs
- Monitor Vercel dashboard
- Check database metrics
- Review user feedback

## Documentation Updates

- [ ] Update main README.md with distributor feature
- [ ] Add API documentation
- [ ] Update user guide
- [ ] Create admin guide for verification
- [ ] Document database schema
- [ ] Create troubleshooting guide

## Go-Live Approval

- [ ] All tests passed
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] Team sign-off received
- [ ] Go-live email sent
- [ ] Monitoring in place

---

**Deployment Date**: _________________
**Deployed By**: _________________
**Status**: Ready for Deployment ✅
