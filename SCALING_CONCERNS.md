# Scaling Concerns & Recommendations

## Current Usage Analysis

Based on your Vercel dashboard showing **14K function invocations** and **8.3K edge requests** from one user, here's what's happening and what to worry about:

## 🔴 Critical Issues

### 1. **Aggressive Timer Auto-Save (Biggest Problem)**

**Current Behavior:**
- Timer saves to database **every 10 seconds** when app is open
- Each save = 1 API call to `POST /api/data`
- If user keeps app open 8 hours/day: **2,880 API calls/day** just for timer
- Over 30 days: **86,400+ API calls** from timer alone

**Impact:**
- High function invocation count
- Unnecessary database writes
- Wasted compute resources
- Higher costs as you scale

**Recommendation:**
- ✅ **Increase save interval to 30-60 seconds** (still feels real-time)
- ✅ **Only save if timer value actually changed** (skip redundant saves)
- ✅ **Pause saves when tab is inactive** (use Page Visibility API)
- ✅ **Save on page unload** (beforeunload event) to ensure data isn't lost

### 2. **No Client-Side Persistence**

**Current Behavior:**
- Every change immediately hits the database
- No localStorage caching
- No batching of updates

**Impact:**
- Every keystroke/change triggers API call (after debounce)
- Multiple tabs = multiple simultaneous saves
- No offline capability

**Recommendation:**
- ✅ **Use localStorage as cache** - Save to localStorage first, sync to DB periodically
- ✅ **Batch updates** - Collect multiple changes, send together
- ✅ **Optimistic updates** - Update UI immediately, sync in background

### 3. **Multiple Tabs Problem**

**Current Behavior:**
- Each open tab runs its own timer interval
- Each tab saves independently every 10 seconds
- No coordination between tabs

**Impact:**
- 3 tabs open = 3x the API calls
- Race conditions possible
- Wasted resources

**Recommendation:**
- ✅ **Use BroadcastChannel API** - Coordinate timer across tabs
- ✅ **Only one tab saves** - Designate "primary" tab, others just display
- ✅ **Detect multiple tabs** - Warn user or disable auto-save in secondary tabs

### 4. **No Idle Detection**

**Current Behavior:**
- Timer keeps saving even if user is away
- No detection of inactive sessions

**Impact:**
- Wasted API calls when user is idle
- Unnecessary database writes

**Recommendation:**
- ✅ **Detect idle time** - Use Page Visibility API + user activity tracking
- ✅ **Pause saves when idle** - Stop auto-save after 5-10 minutes of inactivity
- ✅ **Resume on activity** - Start saving again when user returns

## 🟡 Medium Priority Issues

### 5. **Debounce Too Short**

**Current Behavior:**
- User settings save after 2 seconds of debounce
- Typing in task name triggers multiple saves

**Recommendation:**
- ✅ **Increase debounce to 5 seconds** for settings
- ✅ **Don't save on every keystroke** - Only save on blur or after pause

### 6. **No Request Deduplication**

**Current Behavior:**
- Multiple rapid changes = multiple API calls
- No check if value actually changed

**Recommendation:**
- ✅ **Compare before save** - Only call API if value differs from last saved
- ✅ **Queue requests** - If save in progress, queue next one

### 7. **Heavy Initial Load**

**Current Behavior:**
- Page load fetches all task history
- No pagination on initial load

**Recommendation:**
- ✅ **Lazy load task history** - Load first 20-30 tasks, load more on scroll
- ✅ **Cache task history** - Store in localStorage, only fetch updates

## 🟢 Low Priority (But Important for Scale)

### 8. **No Rate Limiting on Client**

**Current Behavior:**
- Client can spam API calls
- Rate limiting only on server

**Recommendation:**
- ✅ **Client-side rate limiting** - Prevent more than X calls per minute
- ✅ **Exponential backoff** - If rate limited, back off gracefully

### 9. **No Connection Status Detection**

**Current Behavior:**
- Tries to save even if offline
- No retry logic

**Recommendation:**
- ✅ **Detect online/offline** - Use navigator.onLine
- ✅ **Queue failed requests** - Retry when connection restored
- ✅ **Show connection status** - Let user know if sync is failing

## 📊 Expected Impact of Fixes

**Before (Current):**
- 1 active user, 8 hours/day = **~2,880 API calls/day**
- 10 users = **~28,800 calls/day**
- 100 users = **~288,000 calls/day** (hitting limits fast)

**After (Optimized):**
- 1 active user, 8 hours/day = **~480 API calls/day** (6x reduction)
- 10 users = **~4,800 calls/day**
- 100 users = **~48,000 calls/day** (still manageable)

## 🎯 Immediate Action Items

### Priority 1 (Do Now):
1. ✅ Change timer save interval from 10s → 30s
2. ✅ Add Page Visibility API check (pause saves when tab inactive)
3. ✅ Only save if timer value changed

### Priority 2 (This Week):
4. ✅ Add localStorage caching
5. ✅ Detect and handle multiple tabs
6. ✅ Add idle detection

### Priority 3 (Next Sprint):
7. ✅ Implement request batching
8. ✅ Add offline support
9. ✅ Optimize initial page load

## 💰 Cost Implications

**Current Vercel Limits (Hobby Plan):**
- Function Invocations: 1M/month
- Edge Requests: 1M/month

**With Current Usage:**
- 1 user = 14K invocations/month
- **~70 users** would hit the limit (if all as active)

**After Optimization:**
- 1 user = ~2K invocations/month (estimated)
- **~500 users** could fit within limits

## 🔍 Monitoring Recommendations

1. **Track per-user API call counts** - Identify power users
2. **Monitor function execution time** - Optimize slow endpoints
3. **Set up alerts** - Warn when approaching limits
4. **Track database write patterns** - Identify hot spots

## 📝 Code Changes Needed

See implementation examples in the codebase for:
- Timer save optimization
- Page Visibility API integration
- localStorage caching
- Multiple tab detection


