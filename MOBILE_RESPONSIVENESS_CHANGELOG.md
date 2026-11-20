# MelodyForge Mobile Responsiveness Changelog

**Release Version**: v1.2.0-mobile-viewport-fix  
**Date**: November 20, 2026  
**Artifact Link**: [MOBILE_RESPONSIVENESS_CHANGELOG.md](file:///c:/Users/sunda/Downloads/LMS/MOBILE_RESPONSIVENESS_CHANGELOG.md)

---

## 1. Overview of Changes

This release resolves the critical mobile layout and Android virtual keyboard overlap issues identified on Android WebViews, iOS mobile Safari, and mobile web browsers.

---

## 2. Detailed File Modifications

### 2.1 Android Native Runtime

#### `frontend/android/app/src/main/java/com/melodyforge/musiclms/MainActivity.java`
- **Link**: [MainActivity.java](file:///c:/Users/sunda/Downloads/LMS/frontend/android/app/src/main/java/com/melodyforge/musiclms/MainActivity.java)
- **Changes**:
  - Added `WindowCompat.setDecorFitsSystemWindows(window, false)` to establish a single, predictable source of truth for window insets.
  - Refactored `ViewCompat.setOnApplyWindowInsetsListener`:
    ```java
    int imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom;
    int navBottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;
    int bottom = (imeHeight > 0) ? 0 : navBottom;
    ```
  - **Why**: When `android:windowSoftInputMode="adjustResize"` is active, Android automatically resizes the Activity window above the keyboard. Applying `imeHeight` to `setPadding` double-subtracted the keyboard height and created a massive 350dp black void above the keyboard. The fix ensures that bottom padding is `0` when the keyboard is open and `navBottom` when the keyboard is closed.

#### `frontend/android/app/src/main/res/values/styles.xml`
- **Link**: [styles.xml](file:///c:/Users/sunda/Downloads/LMS/frontend/android/app/src/main/res/values/styles.xml)
- **Changes**:
  - Set `<item name="android:fitsSystemWindows">false</item>` on `AppTheme.NoActionBar`.
  - **Why**: Eliminates competing, redundant insets padding from the Android DecorView so `MainActivity.java` has exclusive, exact control over system bar spacing.

---

### 2.2 Frontend Web & Application Layer

#### `frontend/src/components/Auth/AuthPage.tsx`
- **Link**: [AuthPage.tsx](file:///c:/Users/sunda/Downloads/LMS/frontend/src/components/Auth/AuthPage.tsx)
- **Changes**:
  - Replaced `flex items-center justify-center` with `flex flex-col justify-start lg:justify-center items-center overflow-y-auto`.
  - Applied `my-auto` to the inner card container:
    - On large screens: centers the card vertically.
    - On small screens / open keyboard: collapses to top (`y=0`), allowing users to scroll through the full form without any top-clipping or negative-overflow traps.
  - Replaced `scrollIntoView({ behavior: 'smooth', block: 'center' })` with `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`:
    - Prevents sudden viewport jumps and keeps preceding labels/tabs visible.
  - Optimized mobile marketing section:
    - The 4-card feature highlights grid is now hidden on mobile (`hidden lg:grid`) and preserved on desktop.
    - Mobile displays a compact, elegant branded header so the registration form is immediately visible and actionable.
  - Optimized mobile padding from `p-6 sm:p-8` to `p-5 sm:p-8` to maximize usable screen real estate.

#### `frontend/src/components/ui/Modal.tsx`
- **Link**: [Modal.tsx](file:///c:/Users/sunda/Downloads/LMS/frontend/src/components/ui/Modal.tsx)
- **Changes**:
  - Changed outer modal overlay from `fixed inset-0 flex items-center justify-center` to `fixed inset-0 flex flex-col justify-start sm:justify-center items-center overflow-y-auto`.
  - Added safe area padding support (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
  - Applied `my-auto` and `max-h-[calc(100dvh-2rem)]` to dialog surfaces to protect against keyboard overflow when editing data in modals.

#### `frontend/src/components/Admin/AdminPortal.tsx`
- **Link**: [AdminPortal.tsx](file:///c:/Users/sunda/Downloads/LMS/frontend/src/components/Admin/AdminPortal.tsx)
- **Changes**:
  - Replaced `max-h-[75vh]` with `max-h-[60dvh] sm:max-h-[70dvh]` on the history chapter editing form to ensure smooth scrolling when editing chapters on mobile devices.

#### `frontend/src/components/History/HistoricalImageGallery.tsx`
- **Link**: [HistoricalImageGallery.tsx](file:///c:/Users/sunda/Downloads/LMS/frontend/src/components/History/HistoricalImageGallery.tsx)
- **Changes**:
  - Replaced `max-h-[60vh]` with `max-h-[50dvh] sm:max-h-[60dvh]` for the historical plate image viewer modal.

---

## 3. Viewport & Safe-Area Strategy

1. **`100dvh` Standard**:
   - Modern browsers (Chrome 108+, Safari 15.4+, Firefox 101+) dynamically update `100dvh` when browser UI bars or soft keyboards toggle.
   - Fallback `min-height: 100vh` remains in place for legacy WebViews.

2. **System Interface Safe Areas**:
   - `env(safe-area-inset-top)`: Protects against notch cutouts and status bars.
   - `env(safe-area-inset-bottom)`: Protects against gesture home bars and 3-button navigation bars.
   - `env(safe-area-inset-left)` & `env(safe-area-inset-right)`: Protects landscape orientation against side camera cutouts.

3. **Software Keyboard Dynamic Sizing**:
   - HTML meta: `interactive-widget=resizes-content`
   - Android Manifest: `android:windowSoftInputMode="adjustResize"`
   - Android Insets: `(imeHeight > 0) ? 0 : navBottom`

---

## 4. Verification Checkpoints

- [x] Zero black space between form and software keyboard on Android.
- [x] Zero collision with Android status / notification bar.
- [x] Zero collision with Android gesture / navigation bar.
- [x] All 7 inputs on AuthPage scroll into view using `block: 'nearest'`.
- [x] Submit button and terms toggle remain reachable when keyboard is open.
- [x] Desktop two-column layout is 100% preserved.
- [x] TypeScript compilation (`tsc -b && vite build`): PASS (0 errors).
- [x] Capacitor assets sync (`npx cap sync`): PASS (Android & iOS).
