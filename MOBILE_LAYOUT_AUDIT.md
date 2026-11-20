# MelodyForge Mobile Layout & Android Viewport Audit

**Project**: MelodyForge Music LMS (Android APK, iOS, Web)  
**Date**: November 20, 2026  
**Auditor**: Senior Frontend & Mobile Runtime Specialist  
**Artifact Link**: [MOBILE_LAYOUT_AUDIT.md](file:///c:/Users/sunda/Downloads/LMS/MOBILE_LAYOUT_AUDIT.md)

---

## 1. Executive Summary

A critical mobile layout bug was reported on the Android APK where focusing an input field on the registration screen caused:
1. **A massive black empty void** (~350dp high, ~40% of the display) appearing directly between the form fields and the open Android virtual keyboard.
2. **Squashed form content** pushed upwards and partially cut off in negative coordinate space at the top of the screen.
3. **Collision / clipping** with the Android status bar / notification bar.

This audit details the multi-layered root causes, the technical breakdown of the Android window insets interaction with Chromium WebView and CSS layout engines, and the architectural resolution applied across the application.

---

## 2. Root Cause Analysis

### 2.1 The Native Android Insets & `adjustResize` Double-Padding Bug (Primary Cause)

In commit `d8d1520bf353c4aef35323d7147067cd2236b5e8`, the following insets listener was added to `MainActivity.java`:

```java
// PROBLEM CODE IN MainActivity.java
View contentView = findViewById(android.R.id.content);
if (contentView != null) {
    ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
        int top = insets.getInsets(WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout()).top;
        int bottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars() | WindowInsetsCompat.Type.ime()).bottom;
        int left = insets.getInsets(WindowInsetsCompat.Type.displayCutout()).left;
        int right = insets.getInsets(WindowInsetsCompat.Type.displayCutout()).right;

        v.setPadding(left, top, right, bottom);
        return insets;
    });
}
```

Simultaneously, `AndroidManifest.xml` had:
```xml
android:windowSoftInputMode="adjustResize"
```

#### Why This Produced the Massive Black Void:
1. When the Android software keyboard (IME) is displayed, Android's `adjustResize` mechanism **automatically resizes the Activity window** to end flush against the top of the keyboard. For example, on a 900dp screen with a 350dp keyboard, the window shrinks from 900dp to 550dp.
2. The `WindowInsetsCompat.Type.ime()` inset reports the keyboard height (`350dp`).
3. The listener executed `v.setPadding(left, top, right, bottom)` where `bottom = 350dp`.
4. This set **350dp of native padding on the bottom of `android.R.id.content`** *inside* the already 550dp-shrunken window.
5. The visible WebView was squashed to only `550dp - 350dp - 24dp (status) = ~176dp`!
6. In the 350dp gap below the WebView, the Activity background (`#080C14` dark slate / black) was displayed, creating the giant empty black void observed in the user screenshot.

---

### 2.2 The Flexbox Vertical Centering (`justify-center`) Overflow Trap

In `frontend/src/components/Auth/AuthPage.tsx`:
```tsx
// PROBLEM CODE IN AuthPage.tsx
<div
  className="min-h-screen min-h-[100dvh] bg-slate-950 text-slate-100 flex items-center justify-center p-4 ..."
>
```

#### Why This Cut Off the Form Header and Title:
1. In CSS Flexbox, applying `justify-center` vertically centers the child element within the available height.
2. When the keyboard opens, the available viewport height drops to ~350px - 450px.
3. The registration form is ~600px tall.
4. With `justify-center`, the 600px card was centered at `viewportHeight / 2`.
5. The top of the card overflowed into **negative Y coordinates** (`y < 0`).
6. In CSS, negative overflow cannot be reached via scrolling, leaving the top header, tabs, and first inputs permanently clipped and inaccessible.

---

### 2.3 Aggressive Input Focus Scrolling (`block: 'center'`)

In `frontend/src/components/Auth/AuthPage.tsx`:
```tsx
// PROBLEM CODE IN AuthPage.tsx
const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  setTimeout(() => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 250);
};
```

#### Why This Worsened the Issue:
- When a user focused "Display Name", `block: 'center'` instructed the browser to place that input in the vertical midpoint of the tiny remaining viewport.
- This violently jerked the viewport, pushing all preceding content (header, marketing highlights, mode switcher tabs) far above the viewport into negative scroll space.

---

### 2.4 Mobile Marketing Column Clutter on Small Screens

On mobile viewports (`< 1024px`), `AuthPage.tsx` rendered the full 4-card marketing feature grid (`Polyphonic Piano`, `4-Tier Curriculum`, `Ear Training Arena`, `Gamification & XP`) above the sign-in/register card. This forced mobile users to scroll through hundreds of pixels of marketing text before even reaching the registration form.

---

## 3. Comprehensive Solution Architecture

| Layer | Previous State | Fixed State | Resolution |
| :--- | :--- | :--- | :--- |
| **Android Native (`MainActivity.java`)** | `bottom = insets.getInsets(navigationBars \| ime).bottom` | `int bottom = (imeHeight > 0) ? 0 : navBottom;` + `WindowCompat.setDecorFitsSystemWindows(window, false);` | Prevents double-padding with `adjustResize`. When IME is open, bottom padding is 0. |
| **Android Theme (`styles.xml`)** | `<item name="android:fitsSystemWindows">true</item>` | `<item name="android:fitsSystemWindows">false</item>` | Eliminates competing decor insets padding so `MainActivity.java` is single source of truth. |
| **HTML Viewport Meta (`index.html`)** | Standard viewport | `viewport-fit=cover, interactive-widget=resizes-content` | Instructs Chromium engine to resize layout & visual viewport when keyboard opens. |
| **Auth Container (`AuthPage.tsx`)** | `min-h-[100dvh] flex items-center justify-center` | `min-h-[100dvh] w-full flex flex-col justify-start lg:justify-center items-center overflow-y-auto` with `my-auto` child | Safe centering: centers when space permits; scrolls smoothly from top (`y=0`) when keyboard opens. |
| **Focus Handling (`AuthPage.tsx`)** | `scrollIntoView({ block: 'center' })` | `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` | Only scrolls if input is obscured, without disorienting layout shifts. |
| **Mobile Responsiveness (`AuthPage.tsx`)** | Full marketing cards rendered on mobile above form | Marketing cards set to `hidden lg:grid`; concise branded mobile header on small screens | Registration form is immediately visible on mobile devices. |
| **Modal Dialogs (`Modal.tsx`)** | `fixed inset-0 flex items-center justify-center` | `flex flex-col justify-start sm:justify-center items-center overflow-y-auto` + `max-h-[calc(100dvh-2rem)]` | Prevents modal clipping on mobile keyboards. |
| **Admin Forms (`AdminPortal.tsx`)** | `max-h-[75vh]` | `max-h-[60dvh] sm:max-h-[70dvh]` | Prevents admin modal forms from overlapping the keyboard. |

---

## 4. Verification & Testing Matrix

| Test Case | Viewport / Device | Expected Behavior | Result |
| :--- | :--- | :--- | :--- |
| **Registration Form - Keyboard Open** | 360 × 800 (Android) | Form sits flush above keyboard; zero black void; all fields scrollable | PASS |
| **Registration Form - Keyboard Closed** | 360 × 800 (Android) | Form centers cleanly; navigation bar is protected | PASS |
| **Field Focus Switching** | 375 × 812 (iOS) | Smooth scroll to active input using `block: 'nearest'`; no jumps | PASS |
| **Virtual Piano Keybed** | 390 × 844 & 412 × 915 | Horizontal overflow scroll; keys remain playable; bottom safe-area respected | PASS |
| **Desktop Layout** | 1024px, 1280px, 1440px | Preserves two-column layout with 4 feature cards and side-by-side display | PASS |
| **Admin Portal Chapter Modal** | Mobile & Tablet | Modal fits within `100dvh`; scrollable form when keyboard appears | PASS |
