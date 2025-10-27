# Deployment Guide for VenneSpill

## Quick Deployment Checklist

### 1. Environment Variables

Ensure these are configured in your deployment platform:

```
VITE_SUPABASE_URL=https://nvhddejqmalzouwboubc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 2. Recommended Deployment Platforms

#### Vercel (Recommended)
1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables in project settings
4. Deploy automatically

**Build Settings:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

#### Netlify
1. Connect GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables
4. Deploy

#### Cloudflare Pages
1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Add environment variables
4. Deploy

### 3. Database Migration

Database is already set up via Supabase. No additional migration needed.

Tables created:
- `concepts` - Product catalog
- `orders` - Order management with Stripe preparation
- `user_games` - Active game sessions
- `participants` - Game participants
- `rounds` - Game rounds
- `scores` - Scoring system
- `user_roles` - Role-based access

### 4. Post-Deployment Verification

Test these features after deployment:
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Concepts display correctly
- [ ] Order form submission works
- [ ] Privacy policy is accessible
- [ ] Terms of service is accessible
- [ ] PWA install prompt appears
- [ ] Images load with lazy loading

### 5. Performance Optimization

Current optimizations:
- Lazy loading on all images
- Error boundary for graceful failures
- Structured logging (dev mode only)
- PWA caching enabled
- Optimized bundle size

Target metrics:
- Lighthouse Performance: 90+
- Lighthouse PWA: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

### 6. Security Checklist

- [x] RLS enabled on all tables
- [x] Environment variables secure
- [x] No secrets in client code
- [x] HTTPS enforced
- [x] GDPR compliance implemented
- [x] Privacy policy in place
- [x] Terms of service in place

### 7. Future Stripe Integration (Phase 2)

When ready to enable Stripe:
1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get API keys from Stripe dashboard
3. Add `VITE_STRIPE_PUBLISHABLE_KEY` to environment
4. Uncomment code in `src/lib/stripe.ts`
5. Create Supabase Edge Function for payment intent creation
6. Update `ConceptDetail.tsx` to use Stripe payment flow
7. Test thoroughly in Stripe test mode before going live

### 8. Monitoring and Maintenance

Recommended monitoring:
- Supabase dashboard for database health
- Vercel/Netlify analytics for traffic
- Browser console for client errors (ErrorBoundary logs)
- User feedback for UX issues

### 9. Backup and Recovery

- Database: Automatic daily backups via Supabase
- Code: Version controlled in Git
- Environment: Document all config in .env.example

### 10. Custom Domain Setup

For custom domain (e.g., vennespill.no):
1. Purchase domain from registrar
2. Add domain in deployment platform
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning
5. Update VITE_APP_URL in environment variables

## Support

For deployment issues:
- Check Vercel/Netlify logs
- Review Supabase logs
- Check browser console for errors
- Refer to main README.md for troubleshooting
