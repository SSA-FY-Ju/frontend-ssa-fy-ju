# Quickstart: Testing & Verification Scenarios

**Created**: 2026-05-11  
**Phase**: 1 (Design)  
**Purpose**: Define test scenarios for manual verification and automated test writing

---

## Quick Setup (Development)

```bash
cd ssaju-frontend

# 1. Install dependencies
npm install

# 2. Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
EOF

# 3. Start dev server
npm run dev
# App runs on http://localhost:3000

# 4. Start backend (in separate terminal)
# Assuming backend Spring Boot runs on :8080
# Check backend documentation for setup

# 5. Run tests
npm test -- --coverage  # Should reach 80%

# 6. Build check
npm run build           # MUST pass before commit

# 7. Lint check
npm run lint            # MUST pass before commit
```

---

## Test Scenario Matrix

### Category 1: Authentication (US1)

#### Scenario 1.1: Non-logged-in to Logged-in Flow

**Setup**:
- App loads without authentication cookie

**Steps**:
1. Visit home page (`/`)
2. Click "로그인" button
3. Select "카카오로 계속하기" (or Google)
4. OAuth popup appears (mock via MSW)
5. Approve in popup (simulated)
6. Popup closes, redirected to home
7. Verify: Header changes to show "프로필" menu

**Assertions**:
- authStore.isLoggedIn === true
- authStore.user is populated
- authStore.accessToken saved
- sessionStorage has token check
- Profile menu visible

**Test Code** (Jest + RTL):
```typescript
test('OAuth login flow', async () => {
  render(<App />);
  
  // Initial state
  expect(screen.getByText('로그인')).toBeInTheDocument();
  
  // Click login
  await userEvent.click(screen.getByText('로그인'));
  
  // (OAuth popup handling mocked via MSW)
  
  // After login
  await waitFor(() => {
    expect(screen.getByText(/프로필/)).toBeInTheDocument();
  });
  
  // Verify store
  expect(authStore.getState().isLoggedIn).toBe(true);
});
```

---

#### Scenario 1.2: Auto-Save on Login (Q1)

**Setup**:
- User is non-logged-in
- User completes career timing analysis
- Analysis result displayed

**Steps**:
1. Non-logged-in user fills TimingForm
2. Clicks "분석하기"
3. Sees DisclaimerOverlay for 1.5s
4. Sees analysis result (H1/H2)
5. Clicks LoginNudgeCard login button
6. OAuth popup → authorize → return
7. Verify: "분석 결과가 저장되었습니다" message
8. Navigate to my-page → See saved record

**Assertions**:
- Analysis automatically saved to backend (without manual click)
- Record immediately appears in my-page
- sajuResultId persisted in sessionStore
- Notification toast shown

**Test Code**:
```typescript
test('Auto-save analysis on login (Q1)', async () => {
  // Non-logged-in analysis
  await completeTimingAnalysis();
  
  // Login via nudge card
  await userEvent.click(screen.getByText('로그인하기'));
  // (OAuth simulated)
  
  // Verify save
  await waitFor(() => {
    expect(toast).toHaveBeenCalledWith('분석 결과가 저장되었습니다');
  });
  
  // Verify my-page
  await navigate('/my-page');
  expect(screen.getByText(/관운 분석/)).toBeInTheDocument();
});
```

---

### Category 2: Career Timing Analysis (US3)

#### Scenario 2.1: Complete Timing Analysis with Disclaimer (FR-048, FR-049)

**Setup**:
- User on `/career/timing`
- TimingForm ready

**Steps**:
1. Fill birthDate: "1990-10-10"
2. Fill birthTime: "14:30"
3. Select solarType: "양력"
4. Click "분석하기"
5. **Verify**: DisclaimerOverlay appears (fade-in)
6. **Verify**: Text visible for 1.5s
7. **Verify**: After 1.5s, fade-out (500ms) + loading bar fade-in
8. **Verify**: After 3-5s, result appears (H1 or H2)
9. **Verify**: Confidence score shown as progress bar
10. **Verify**: Reasoning text displayed

**Timing Assertions** (E2E test):
- Overlay visible: 0s → 1.5s (1500ms duration)
- Fade out + loading fade in: 1.5s → 2.0s (500ms transition)
- Result display: 2.0s → 5.5s (API call + parsing)
- Total: < 6s from click to result

**Test Code** (E2E via Playwright):
```typescript
test('Timing analysis with disclaimer timing (Q1)', async ({ page }) => {
  await page.goto('http://localhost:3000/career/timing');
  
  // Fill form
  await page.fill('input[name="birthDate"]', '1990-10-10');
  await page.fill('input[name="birthTime"]', '14:30');
  await page.selectOption('select[name="solarType"]', 'SOLAR');
  
  // Click analyze
  const startTime = Date.now();
  await page.click('button:has-text("분석하기")');
  
  // Verify disclaimer overlay
  const overlay = await page.locator('[role="alert"]');
  await expect(overlay).toBeVisible();
  
  // Verify 1.5s display (within 50ms tolerance)
  const overlayHidden = await Promise.race([
    overlay.evaluate(el => new Promise(resolve => {
      const observer = new MutationObserver(() => {
        if (getComputedStyle(el).display === 'none') resolve();
      });
      observer.observe(el, { attributes: true });
    })),
    new Promise(resolve => setTimeout(resolve, 1550))
  ]);
  
  const elapsed = Date.now() - startTime;
  expect(elapsed).toBeGreaterThanOrEqual(1450);  // ≥ 1.45s
  expect(elapsed).toBeLessThan(1650);            // < 1.65s
  
  // Verify result appears
  await expect(page.locator('text=/H[12]/')).toBeVisible({ timeout: 5000 });
});
```

---

#### Scenario 2.2: Time Default (null → 12:00)

**Setup**:
- User on `/career/timing`

**Steps**:
1. Fill birthDate: "2000-05-15"
2. Leave birthTime empty (or null)
3. Select solarType
4. Click "분석하기"
5. Verify: API receives birthTime: "12:00" (default)
6. Result displays normally

**Assertions**:
- API request payload: `{ birthDate: "2000-05-15", birthTime: "12:00", solarType: "SOLAR" }`
- No validation error

**Test Code**:
```typescript
test('Default birth time to 12:00 when null', async () => {
  const { useCareerTiming } = renderHook(() => useCareerTiming());
  
  const result = await useCareerTiming().submit({
    birthDate: '2000-05-15',
    birthTime: null,  // or omitted
    solarType: 'SOLAR'
  });
  
  // Check API was called with default
  expect(mockFetch).toHaveBeenCalledWith(
    expect.objectContaining({
      body: expect.stringContaining('"birthTime":"12:00"')
    })
  );
});
```

---

### Category 3: AI Consultation (US4)

#### Scenario 3.1: Tab Switching Speed (0.2s, Q4)

**Setup**:
- User completed CareerTiming analysis
- User on consultation page
- All 8 tabs pre-cached (or partially)

**Steps**:
1. Start on Tab 0 (직업/진로)
2. Click Tab 1 (연애/결혼)
3. **Measure**: Time from click to content switch
4. Verify: < 200ms (0.2s) per Q4 clarification
5. Tab input (if any) restored from cache
6. Repeat for other tabs

**Timing Assertion**:
- Tab switch visual update: ≤ 200ms
- No loading spinner (cache hit)

**Test Code** (Performance):
```typescript
test('Tab switching speed < 200ms (Q4)', async ({ page }) => {
  await page.goto('http://localhost:3000/consultation/1');
  
  // Ensure all tabs cached
  for (let i = 0; i < 8; i++) {
    await page.click(`button[data-tab-id="${i}"]`);
    await page.waitForLoadState('networkidle', { timeout: 1000 });
  }
  
  // Measure switch time for Tab 0 → Tab 1
  const startTime = performance.now();
  await page.click(`button[data-tab-id="1"]`);
  
  // Verify content visible (tab label change)
  await page.waitForSelector('[data-tab-content="1"]');
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(200);  // < 200ms
});
```

---

#### Scenario 3.2: Input Caching (Q4)

**Setup**:
- User on consultation page
- Tab 0 selected

**Steps**:
1. Type in Tab 0 input: "개발자로 성장하고 싶습니다"
2. Click Tab 1
3. Type in Tab 1 input: "좋은 사람을 만나고 싶습니다"
4. Click back to Tab 0
5. Verify: Input "개발자로 성장하고 싶습니다" restored
6. Page refresh
7. Verify: Input still there (Zustand persist)

**Assertions**:
- consultationStore.fieldCache['CAREER'] === "개발자로 성장하고 싶습니다"
- After page refresh, cache restored from localStorage

**Test Code**:
```typescript
test('Consultation input caching (Q4)', async () => {
  render(<ConsultationPage />);
  
  // Tab 0: input
  const input0 = screen.getByPlaceholderText(/직업 관련/);
  await userEvent.type(input0, '개발자');
  
  // Switch to Tab 1
  await userEvent.click(screen.getByText('연애/결혼'));
  
  // Verify cache
  expect(consultationStore.getState().fieldCache['CAREER']).toBe('개발자');
  
  // Switch back
  await userEvent.click(screen.getByText('직업/진로'));
  
  // Verify restore
  expect(input0).toHaveValue('개발자');
});
```

---

### Category 4: Infinite Scroll (US5, Q3)

#### Scenario 4.1: My-Page Infinite Scroll (threshold 0.5)

**Setup**:
- User logged-in
- My-page has 50 saved records
- Initial page loads 20 records

**Steps**:
1. Navigate to `/my-page`
2. See first 20 records
3. Scroll down (not all the way)
4. When bottom element is 50% visible (threshold 0.5), auto-load next 20
5. Verify: More records appended
6. Repeat until no more records

**Assertions**:
- First load: records.length === 20
- After scroll: records.length === 40
- hasMore flag changes when < 20 remaining
- No manual "Load More" button click needed

**Test Code**:
```typescript
test('Infinite scroll with 0.5 threshold (Q3)', async () => {
  render(<MyPage />);
  
  // Initial load
  await waitFor(() => {
    expect(screen.getAllByRole('listitem')).toHaveLength(20);
  });
  
  // Simulate scroll to bottom (IntersectionObserver)
  const trigger = screen.getByTestId('load-more-trigger');
  const mockIO = jest.fn((callback) => ({
    observe: () => callback([{ isIntersecting: true, target: trigger }]),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));
  window.IntersectionObserver = mockIO;
  
  // Trigger load
  mockIO.mock.calls[0][0]([{ isIntersecting: true }]);
  
  // Verify more records loaded
  await waitFor(() => {
    expect(screen.getAllByRole('listitem')).toHaveLength(40);
  });
});
```

---

### Category 5: Error Handling & Retry (Q5)

#### Scenario 5.1: Timeout Auto-Retry (Q5)

**Setup**:
- API endpoint returns timeout (> 10s)

**Steps**:
1. Trigger analysis request
2. Verify: Request 1 at 0s (no response)
3. Verify: Auto-retry 1 at 1s (1s backoff)
4. Verify: Auto-retry 2 at 3s (2s backoff)
5. Verify: Auto-retry 3 at 7s (4s backoff)
6. If all fail → show error message
7. User can manually retry

**Retry Timing** (Q5 clarification):
```
Attempt 1: 0ms    (initial)
Attempt 2: 1000ms (1s backoff)
Attempt 3: 2000ms more (total 3s, 2s backoff)
Attempt 4: 4000ms more (total 7s, 4s backoff)
Total: ≤ 7s before final failure
```

**Test Code** (MSW mock):
```typescript
test('API timeout auto-retry with backoff (Q5)', async () => {
  let callCount = 0;
  
  server.use(
    rest.post('http://localhost:8080/api/career/timing', async (req, res, ctx) => {
      callCount++;
      // All calls timeout
      return new Promise(() => {
        // Never resolves (infinite timeout)
      });
    })
  );
  
  const { result } = renderHook(() => useCareerTiming());
  
  const start = Date.now();
  result.current.submit({ ... }).catch(() => {});
  
  // Wait for all retries to exhaust
  await waitFor(
    () => expect(callCount).toBe(4),  // Initial + 3 retries
    { timeout: 10000 }
  );
  
  const elapsed = Date.now() - start;
  expect(elapsed).toBeGreaterThanOrEqual(7000);   // ≥ 7s
  expect(elapsed).toBeLessThan(8000);             // < 8s
  
  // Verify error shown
  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
  });
});
```

---

#### Scenario 5.2: Network Error Auto-Retry (Q5)

**Setup**:
- Network error (no connection)

**Steps**:
1. Trigger request
2. Verify: Auto-retry applies (same backoff as timeout)
3. After 3 retries, show "네트워크 오류" message
4. Show "재시도" button

**Test Code**:
```typescript
test('Network error auto-retry (Q5)', async () => {
  server.use(
    rest.post('http://localhost:8080/api/**', (req, res, ctx) => {
      return res.networkError('Failed to connect');
    })
  );
  
  const { result } = renderHook(() => useCareerTiming());
  
  result.current.submit({ ... }).catch(() => {});
  
  await waitFor(() => {
    expect(result.current.error).toContain('네트워크');
  });
  
  // Retry button present
  expect(screen.getByText('재시도')).toBeInTheDocument();
});
```

---

#### Scenario 5.3: Non-Retryable Error (400, 401, 500)

**Setup**:
- API returns 400 Bad Request, 401 Unauthorized, or 500 Internal Error

**Steps**:
1. Trigger request
2. Verify: NO auto-retry (immediate failure)
3. Show error message immediately
4. Optional: Show action (login for 401, edit form for 400)

**Test Code**:
```typescript
test('Non-retryable errors fail immediately (Q5)', async () => {
  server.use(
    rest.post('http://localhost:8080/api/career/timing', (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
    })
  );
  
  const { result } = renderHook(() => useCareerTiming());
  
  const start = Date.now();
  result.current.submit({ ... }).catch(() => {});
  
  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
  });
  
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(500);  // Immediate failure, no retries
});
```

---

### Category 6: Page Exit Guard (US6, Q6)

#### Scenario 6.1: beforeunload (Tab Close/Refresh)

**Setup**:
- Non-logged-in user
- User completes analysis (sajuResultId exists)

**Steps**:
1. Close tab or refresh page
2. Verify: beforeunload handler fires
3. Browser shows: "현재 페이지를 나가시겠습니까?"
4. User clicks "머물기" → stay on page
5. User clicks "나가기" → leave page + analysis deleted

**Test Code** (Playwright E2E):
```typescript
test('beforeunload on page exit (Q6)', async ({ page }) => {
  await page.goto('http://localhost:3000/career/timing');
  
  // Complete analysis (non-logged-in)
  await completeAnalysis(page);
  
  // Trigger beforeunload
  const dialog = page.waitForEvent('dialog');
  await page.evaluate(() => window.dispatchEvent(new Event('beforeunload')));
  
  // Browser dialog
  const dlg = await dialog;
  expect(dlg.message).toContain('나가시겠습니까');
  
  // User stays
  await dlg.accept();
  
  // Verify analysis still there
  expect(sessionStore.getState().sajuResultId).toBeTruthy();
});
```

---

#### Scenario 6.2: beforePopState (Browser Back Button)

**Setup**:
- Non-logged-in user
- User on analysis result page
- unsaved analysis result

**Steps**:
1. Click browser back button
2. Verify: beforePopState handler fires
3. Show modal: "지금 나가면 분석 결과가 삭제됩니다. 정말 나가시겠습니까?"
4. Options:
   - "지금 로그인하기": Opens login, saves, returns to page
   - "그냥 나가기": Clears session, navigates back
   - "계속 보기": Closes modal, stays on page

**Test Code**:
```typescript
test('beforePopState on back button (Q6)', async ({ page }) => {
  await page.goto('http://localhost:3000/career/timing');
  
  // Complete analysis
  await completeAnalysis(page);
  
  // Go to result page (page B)
  await page.waitForURL('**/result/**');
  
  // Push new history state (page C)
  await page.evaluate(() => history.pushState({}, '', '/other'));
  
  // Click back button (should show modal)
  page.goBack();
  
  // Verify modal appears
  await expect(page.locator('text=분석 결과가 삭제됩니다')).toBeVisible();
  
  // Test "계속 보기" option
  await page.click('button:has-text("계속 보기")');
  
  // Modal closes, stays on result page
  await expect(page).toHaveURL('**/result/**');
});
```

---

## Test Coverage Goals

| Category | Unit Tests | Integration | E2E | Target Coverage |
|----------|-----------|------------|-----|-----------------|
| Components | 20+ | 15+ | 5+ | 90% |
| Hooks | 10+ | 8+ | 2+ | 85% |
| API Client | 5+ | 10+ | 3+ | 95% |
| Stores | 3+ | 5+ | - | 80% |
| Pages | - | 10+ | 8+ | 75% |
| **Total** | **38+** | **48+** | **18+** | **80%** |

---

## Test Execution

```bash
# Unit tests
npm test -- --watch

# Coverage report
npm test -- --coverage

# E2E tests (requires backend running)
npx playwright test

# Build validation
npm run build

# Lint validation
npm run lint
```

---

## Manual Testing Checklist

Before declaring feature complete:

- [ ] All 6 user stories testable (US1~US6)
- [ ] All 65+ functional requirements (FR-001~065) verified
- [ ] Q1-Q5 clarifications implemented
- [ ] Disclaimer overlay: 1.5s + 500ms fade animation
- [ ] Tab switching: < 200ms (cached)
- [ ] Infinite scroll: threshold 0.5
- [ ] API retry: Q5 policy (timeout/network only)
- [ ] Page exit: beforeunload + beforePopState
- [ ] Theme: "별이 빛나는 밤" (Starry Night) colors
- [ ] Responsive: desktop (28px), tablet (24px), mobile (20px)
- [ ] Performance: 80+ Lighthouse score
- [ ] Accessibility: WCAG 2.1 AA (axa-core)
- [ ] TypeScript: strict mode, no `any`
- [ ] Build: `npm run build` passes
- [ ] Coverage: 80%+ via `npm test -- --coverage`

---

## CI/CD Integration

All tests run automatically on:
- **Pre-commit hook**: ESLint + TypeScript check
- **Push**: Build + Test + Coverage (must be 80%+)
- **PR**: Full test suite + E2E on staging

See `.github/workflows/` for automation setup.
