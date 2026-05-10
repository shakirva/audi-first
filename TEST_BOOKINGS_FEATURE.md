# Test Bookings Management Feature

## 📋 Overview
A new feature added to the Settings page that allows **Owner** users to manage and delete test/fake bookings that were created during development or testing phases.

**Status:** ✅ Implemented & Deployed  
**Build:** ✅ Successful (829.80 KB gzipped)  
**Commit:** `2298148`  
**Date Added:** 11 May 2026

---

## 🎯 Problem Solved

**Issue:** When testing the booking system, developers/owners create fake bookings (with names like "TEST Event", "FAKE Wedding", "DEMO Reception") which:
- ❌ Inflate booking counts on the Dashboard
- ❌ Skew revenue statistics and reports
- ❌ Clutter the Bookings page
- ❌ Affect analytics and monthly summaries

**Solution:** Dedicated tool in Settings to identify and bulk-delete all test bookings in one click.

---

## ✨ Features

### 1. **Test Bookings Detection**
- Automatically scans all bookings in the system
- Identifies bookings with these keywords in customer name (case-insensitive):
  - `TEST` (e.g., "Test Wedding", "TEST event")
  - `FAKE` (e.g., "Fake Birthday", "FAKE reception")
  - `DEMO` (e.g., "Demo event", "DEMO wedding")

### 2. **Test Bookings Display**
Shows real-time count of detected test bookings:
```
Found 3 test bookings
Bookings with "TEST", "FAKE", or "DEMO" in customer name will be removed
```

### 3. **Detailed List View**
If test bookings exist, displays a scrollable list showing:
- 🧪 Customer name
- Event type
- Booking date
- Booking ID

Example:
```
🧪 Test Bookings to be deleted:
- Test Wedding - Wedding (2026-05-22)  [ID: BK001]
- FAKE Reception - Reception (2026-06-05)  [ID: BK002]
- Demo Event - Corporate Event (2026-05-25)  [ID: BK007]
```

### 4. **Bulk Delete Action**
- **Red Delete Button** with trash icon
- Only active when test bookings exist (disabled when none found)
- Hover effect for visual feedback
- One-click deletion of all test bookings

### 5. **Safety Warnings**
- Warning banner before deletion
- Clear indication: "This action will **permanently delete** ... This cannot be undone."
- Toast notifications confirming deletion with count

---

## 🖥️ UI/UX Design

### Layout
Located in **Settings → Test & Demo Bookings** section (Owner only)
- Red-themed card to indicate destructive action
- Background gradient: Light red (`#fef2f2` to `#fefbfb`)
- Border color: Rose-600 (`#fecaca`)

### Components
| Component | Style | Purpose |
|-----------|-------|---------|
| Section Icon | 🗑️ Red (trash icon) | Visual indicator |
| Section Title | "Test & Demo Bookings" | Clear identification |
| Count Display | Red background, white text | Quick status view |
| Test List | Light red boxes, scrollable | Show affected bookings |
| Delete Button | Red with hover effect | Primary action |
| Warning Banner | Rose background | Safety notice |

### States

**No test bookings:**
```
Found 0 test bookings
No test bookings detected. All bookings look legitimate! ✨
[Delete Button - DISABLED - gray]
```

**Test bookings detected:**
```
Found 3 test bookings
Bookings with "TEST", "FAKE", or "DEMO" in customer name will be removed
[Scrollable list of 3 bookings]
[Delete Button - ENABLED - red]
```

---

## 🔧 Technical Implementation

### Files Modified
1. **`src/context/RoleContext.jsx`**
   - Added state: `hideTestBookings` (for future feature: hide test bookings in reports)
   - Added function: `setHideTestBookings()`
   - Exported in context provider

2. **`src/pages/Settings.jsx`**
   - Imported: `useBookings` hook from BookingsContext
   - Added state: `testBookings` (computed from bookings array)
   - Added handler: `handleDeleteTestBookings()`
   - New section: Test Bookings Management (conditional render for Owner only)
   - Lucide icon: `Trash` added to imports

### Logic Flow

```javascript
// 1. Filter test bookings
const testBookings = bookings.filter(b => 
  b.customerName?.toUpperCase().includes("TEST") || 
  b.customerName?.toUpperCase().includes("FAKE") || 
  b.customerName?.toUpperCase().includes("DEMO")
);

// 2. Handle deletion
const handleDeleteTestBookings = () => {
  if (testBookings.length === 0) {
    addToast("No test bookings found! ✨", "info");
    return;
  }
  testBookings.forEach(b => deleteBooking(b.id));
  addToast(`Deleted ${testBookings.length} test booking(s)! 🗑️`, "success");
};

// 3. Conditional render for Owner only
{isOwner && (
  <div>
    {/* Test Bookings Management UI */}
  </div>
)}
```

### Context Integration
- Uses `useBookings()` to access `bookings` array and `deleteBooking()` method
- Uses `useRole()` to check if user is Owner
- Uses `useToast()` for user feedback notifications

---

## 👥 Access Control

| Role | Can Access | Action |
|------|-----------|--------|
| **Owner** | ✅ Yes | Full access to Test Bookings Management |
| **Manager** | ❌ No | Section hidden on Manager dashboard |
| **Staff** | ❌ No | Not applicable |

---

## 📊 Example Workflow

### Scenario: Owner Wants to Clean Up Test Bookings

1. **Owner navigates to Settings**
2. **Scrolls to "Test & Demo Bookings" section**
3. **Sees:** "Found 3 test bookings"
4. **Sees list of test bookings:**
   - Test Wedding - 2026-05-22
   - FAKE Reception - 2026-06-05
   - Demo Event - 2026-05-25
5. **Reviews the list to confirm**
6. **Clicks "Delete All Test Bookings" button** (red)
7. **Toast notification appears:** "Deleted 3 test bookings! 🗑️"
8. **Dashboard stats automatically update** (bookings count reduced)
9. **Reports reflect accurate data** (without test bookings)

---

## 🎨 Color Scheme

Used consistent with destructive actions:
| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Background | Light Red | #fef2f2 | Subtle warning |
| Border | Rose 300 | #fecaca | Destructive action indicator |
| Icon | Dark Red | #C0392B | Error-like appearance |
| Title | Dark Red | #991b1b | Strong contrast |
| Button | Red 600 | #dc2626 | Action call |
| Button Hover | Red 700 | #b91c1c | Interactive feedback |

---

## ⚡ Performance

- **No performance impact** on app startup
- **Real-time filtering** only when Settings page loads
- **Bulk deletion** is instant (removed from state)
- **Toast feedback** provides immediate confirmation

---

## 🚀 Future Enhancements

### Phase 2 (Potential):
1. **Hide test bookings toggle** - Hide instead of delete, can be restored
2. **Filter by date range** - Only delete test bookings created after certain date
3. **Export test bookings** - Backup before deletion
4. **Scheduled cleanup** - Auto-delete test bookings older than X days
5. **Test booking marker** - Tag bookings as "test" during creation to make them easier to identify

---

## ✅ Testing Checklist

- [x] Build verification - No compilation errors
- [x] Settings page loads without errors
- [x] Test bookings are correctly detected
- [x] Delete button only enabled when bookings exist
- [x] Toast notifications appear on action
- [x] Bookings are removed from context (counts update)
- [x] Dashboard stats reflect changes after deletion
- [x] UI responsive on mobile (Settings page already responsive)
- [x] Feature only visible to Owner role
- [x] Code committed and pushed to GitHub

---

## 📝 Notes

- Detection is **case-insensitive** (works with "test", "TEST", "Test", etc.)
- Partial matches work (e.g., "Testing Demo Reception" matches both TEST and DEMO)
- Deleted bookings are **permanently removed** and cannot be recovered
- This feature helps maintain **clean data** for accurate analytics
- Particularly useful for **demo accounts** and **development environments**

---

## 📞 Support & Integration

**Page Location:** `src/pages/Settings.jsx` (Lines 220-310)  
**Context:** `src/context/RoleContext.jsx` (Lines 14-50)  
**Hooks Used:**
- `useBookings()` - Access bookings data and delete function
- `useRole()` - Check user role (Owner only)
- `useToast()` - Show notifications

---

*Last Updated: 11 May 2026*  
*Commit: 2298148*  
*Status: Production Ready ✅*
