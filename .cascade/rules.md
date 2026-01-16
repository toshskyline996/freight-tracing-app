# Cascade Rules - Maritime Logistics Project

## Project-Specific Rules

### Rule 1: API Key Security
**CRITICAL**: Never commit API keys to git repository.
- ✅ Use `.env` files for all secrets
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in Vite: `import.meta.env.VITE_API_KEY`
- ❌ Never hardcode keys in JavaScript files
- ❌ Never log API keys to console

**Rationale**: Freighttracing.ca is single-user but API keys could be exposed via browser DevTools.

---

### Rule 2: Single-User Authentication
**Context**: This is a personal tool, not multi-tenant SaaS.

**Authentication Strategy**:
- Use Caddy Basic Auth (simplest, most reliable)
- Single username/password stored in Caddyfile
- No database, no session management, no user registration
- Password stored as bcrypt hash, never plaintext

**Avoid**:
- ❌ Complex OAuth flows
- ❌ JWT tokens
- ❌ User management systems
- ❌ Password reset flows

**Rationale**: Complexity is the enemy of fast iteration. Basic Auth is bulletproof for single-user access.

---

### Rule 3: localStorage Data Limits
**Warning**: localStorage has 5-10MB limit per domain.

**Data Storage Strategy**:
- Use localStorage for: Recent calculations (<10), user preferences, cached rates (1-day TTL)
- Migrate to IndexedDB when: Historical data exceeds 5MB, need to store images/PDFs
- Never store: Large vessel position datasets, uncompressed API responses

**Implementation**:
```javascript
// Good: Limit history size
if (history.length > 100) history = history.slice(0, 100);

// Bad: Unlimited accumulation
history.push(newItem); // No limit check!
```

---

### Rule 4: Development Workflow
**Fast Iteration Protocol**:
1. Make changes in source files
2. Use Vite dev server (`npm run dev`) for hot reload
3. Test in browser at `http://localhost:5173`
4. Build only when deploying: `npm run build`
5. Deploy via Caddy pointing to `dist/` folder

**Never**:
- ❌ Edit files in `dist/` directly (they're overwritten on build)
- ❌ Skip `npm run build` before production deployment
- ❌ Test only in production

---

### Rule 5: Geopolitical Risk Updates
**Context**: Shipping risks change frequently (Bab-el-Mandeb, Suez Canal, Panama Canal).

**Update Protocol**:
1. Monitor shipping news weekly (Lloyd's List, Freightos)
2. Update geoPenalty values in `main.js`
3. Document changes in commit message
4. Add warning banners for new risk areas

**Current Penalties** (as of project scan):
- Mumbai routes (Bab-el-Mandeb): +12 days (Cape of Good Hope reroute)
- Safest mode: Bypasses all geopolitical penalties

**Future Considerations**:
- Panama Canal drought restrictions
- Suez Canal security incidents
- Arctic route seasonal availability

---

### Rule 6: Map Performance
**When implementing vessel tracking map**:

**Do**:
- ✅ Limit visible vessels to 50 max
- ✅ Use marker clustering for dense areas
- ✅ Update positions every 60s (not real-time)
- ✅ Lazy load map component (don't initialize on page load)

**Don't**:
- ❌ Fetch all global AIS data
- ❌ Update every second (kills performance)
- ❌ Load high-resolution map tiles at all zoom levels
- ❌ Show inactive vessels (>48 hours no update)

---

### Rule 7: Code Style Consistency
**Standards**:
- Use vanilla JavaScript (no React/Vue for this project)
- ES6+ features encouraged (arrow functions, template literals, async/await)
- 2-space indentation (match existing code)
- Single quotes for strings
- No semicolons (existing code style)

**File Organization**:
```
maritime-logistics-dashboard/
├── main.js          # Core application logic
├── style.css        # Global styles
├── index.html       # HTML shell
└── src/
    ├── api/         # API integration modules (future)
    ├── utils/       # Helper functions (future)
    └── components/  # Reusable UI modules (future)
```

---

### Rule 8: Error Handling Strategy
**User-Facing Errors**:
- Always show user-friendly messages
- Never expose API errors directly
- Provide actionable feedback

**Examples**:
```javascript
// Good
catch (error) {
  resultsDisplay.innerHTML = `
    <p style="color: var(--accent-orange)">
      Unable to fetch rates. Please check your internet connection and try again.
    </p>
  `;
  console.error('Rate API Error:', error);
}

// Bad
catch (error) {
  alert(error.message); // Technical jargon confuses user
}
```

---

### Rule 9: Deployment Safety
**Before Deploying**:
1. ✅ Run `npm run build` successfully
2. ✅ Test built files locally: `npm run preview`
3. ✅ Backup current production code
4. ✅ Verify Caddyfile paths are correct
5. ✅ Check SSL certificate validity

**Rollback Plan**:
- Keep previous `dist/` folder as `dist.backup/`
- Update Caddyfile to point back if issues arise
- Always have working backup copy

---

### Rule 10: Feature Prioritization
**Given fast iteration requirement, prioritize**:

**High Priority** (MVP):
1. ✅ Route calculation (exists)
2. 🔄 Map-based vessel tracking (implement first)
3. 🔄 Freight rate comparison (immediate value)
4. 🔄 Authentication (security essential)

**Medium Priority**:
5. HS code lookup (nice-to-have)
6. Historical rate charts (analytics)
7. Product library (power user feature)

**Low Priority**:
8. Multi-user support (not needed)
9. Mobile app (web-first)
10. Email notifications (scope creep)

**Decision Framework**: If feature takes >2 days, break it down or defer.

---

### Rule 11: Data Privacy
**Context**: Single-user system handling business-sensitive shipping data.

**Privacy Measures**:
- No analytics/tracking scripts (Google Analytics, etc.)
- No external logging services
- All data stays in browser localStorage
- No data sent to third parties except APIs for functionality
- Document what APIs collect in terms of service

---

### Rule 12: Dependency Management
**Keep Dependencies Minimal**:

**Allowed**:
- Vite (build tool)
- Leaflet (maps)
- Chart.js (optional, for rate history visualization)

**Avoid Unless Absolutely Necessary**:
- Heavy frameworks (React, Vue, Angular)
- UI component libraries (Bootstrap, Material-UI)
- Utility libraries (lodash, moment.js)

**Rationale**: Less dependencies = faster builds, smaller bundle, fewer security vulnerabilities, easier maintenance.

---

### Rule 13: Testing Strategy
**Given single-user context, focus on**:

**Manual Testing** (primary):
- Test all user flows in Chrome/Firefox
- Verify mobile responsive design
- Test with real API keys in staging

**Automated Testing** (optional):
- Add tests only for critical calculation logic
- Use Vitest for unit tests if needed
- No need for E2E testing frameworks

**Quality Checklist**:
- [ ] Route calculations match expected values
- [ ] History saves and loads correctly
- [ ] Map loads without errors
- [ ] API calls handle network failures gracefully
- [ ] Authentication blocks unauthorized access

---

## AI Assistant Guidelines

### When Helping with This Project:

**Do**:
- ✅ Suggest simple, pragmatic solutions
- ✅ Provide copy-paste ready code
- ✅ Include error handling
- ✅ Match existing code style
- ✅ Explain API integration steps clearly

**Don't**:
- ❌ Suggest over-engineered architectures
- ❌ Recommend enterprise patterns for single-user app
- ❌ Propose features not requested by user
- ❌ Ignore existing code conventions

### Code Generation Standards:
1. Always include necessary imports
2. Add comments for complex logic
3. Use consistent variable naming
4. Provide usage examples
5. Mention any required npm packages
