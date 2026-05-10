# Test Bookings Feature - Visual Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HallMaster Application                   │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼────────┐  ┌──────▼─────────┐
            │  Settings Page │  │  Other Pages   │
            └────────┬───────┘  └────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        │   ┌────────▼────────┐   │
        │   │  RoleContext    │   │
        │   │  - isOwner      │   │
        │   └─────────────────┘   │
        │                         │
  ┌─────▼──────────────┐  ┌──────▼──────────────┐
  │ Manager Access     │  │ Test Bookings      │
  │ Control            │  │ Management         │
  │ (for all roles)    │  │ (Owner only)       │
  └────────────────────┘  └────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼─────┐ ┌──────▼──────┐ ┌────▼──────┐
            │ Detection   │ │ List View   │ │Delete     │
            │ Logic       │ │             │ │Functionality
            │ (Filter)    │ │ Scrollable  │ │           │
            │             │ │ with details│ │ Bulk rm   │
            └─────────────┘ └─────────────┘ └───────────┘
                    │              │              │
                    │    BookingsContext           │
                    │              │              │
                    └──────────────┼──────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │  Bookings Array     │
                        │  (Global State)     │
                        │                     │
                        │ [BK001] Test Event  │
                        │ [BK002] FAKE Party  │
                        │ [BK003] Real Event  │
                        │ [BK004] DEMO Event  │
                        │ [BK005] Real Event  │
                        └─────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
User Opens Settings Page
         │
         ▼
┌─────────────────────────────────┐
│ Check User Role                 │
│ const isOwner = role === Owner  │
└─────────────┬───────────────────┘
              │
        ┌─────▼─────┐
        │ Is Owner? │
        └─────┬─────┘
         Yes│  │No
            │  └────────► [Section Hidden]
            │
            ▼
┌──────────────────────────────────────┐
│ Fetch Bookings from Context          │
│ const { bookings } = useBookings()   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│ Filter Test Bookings                                 │
│ const testBookings = bookings.filter(b =>            │
│   b.customerName?.includes("TEST") ||                │
│   b.customerName?.includes("FAKE") ||                │
│   b.customerName?.includes("DEMO")                   │
│ )                                                     │
└──────────────┬───────────────────────────────────────┘
               │
        ┌──────▴──────┐
        │             │
    Found 0       Found X
        │             │
        ▼             ▼
   [Section       [Show Count]
   Disabled]           │
                       ▼
                  [Show List]
                       │
                       ▼
              [Delete Button Ready]
                       │
          ┌────────────▴────────────┐
          │                         │
        Click              Do Nothing
          │                         │
          ▼                         ▼
    [Delete All]            [Page Closed]
          │
          ▼
┌─────────────────────────────────────┐
│ Call handleDeleteTestBookings()      │
│ testBookings.forEach(b =>           │
│   deleteBooking(b.id)               │
│ )                                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Show Toast Notification             │
│ "Deleted X test bookings! 🗑️"      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Update BookingsContext State        │
│ (setBookings)                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Dashboard, Reports, etc Auto Update │
│ (All pages using bookings data)     │
└─────────────────────────────────────┘
```

---

## 🎨 UI Component Structure

```
Settings Page
│
├─ Page Header
│
├─ Manager Access Control Card (if Owner)
│  ├─ Title: "Manager Access Control"
│  ├─ Revenue Toggle
│  └─ Warning Banner
│
├─ ✅ Test & Demo Bookings Card (if Owner) ← NEW
│  │
│  ├─ Card Header
│  │  ├─ Icon: 🗑️
│  │  ├─ Title: "Test & Demo Bookings"
│  │  └─ Subtitle: "Remove fake bookings created for testing"
│  │
│  ├─ Count Display Box
│  │  ├─ "Found X test booking(s)"
│  │  └─ Condition Message:
│  │     ├─ If 0: "No test bookings detected. All bookings look legitimate! ✨"
│  │     └─ If >0: "Bookings with 'TEST', 'FAKE', or 'DEMO' in customer name..."
│  │
│  ├─ Test Bookings List (if found)
│  │  ├─ "🧪 Test Bookings to be deleted:"
│  │  ├─ [Item 1] Test Wedding - 2026-05-22 [BK001]
│  │  ├─ [Item 2] FAKE Birthday - 2026-05-25 [BK002]
│  │  └─ [Item 3] Demo Event - 2026-06-01 [BK003]
│  │
│  ├─ Delete Button
│  │  ├─ Icon: 🗑️
│  │  ├─ Text: "Delete All Test Bookings"
│  │  ├─ State: ENABLED (red) if bookings found
│  │  └─ State: DISABLED (gray) if no bookings
│  │
│  └─ Warning Banner
│     ├─ Icon: ⚠️
│     └─ Text: "This action will permanently delete..."
│
├─ Venue Information Card
│
├─ Hall Pricing Card
│
├─ Blackout Dates Card
│
├─ And more sections...
│
└─ App Info Footer
```

---

## 🎯 State Management Flow

```
┌──────────────────────────────┐
│      RoleContext             │
├──────────────────────────────┤
│ State:                       │
│ • role: "Owner"              │
│ • isLoggedIn: true           │
│ • managerRevenueEnabled: true│
│ • hideTestBookings: false    │ ← New
│                              │
│ Methods:                     │
│ • login()                    │
│ • logout()                   │
│ • setManagerRevenueEnabled() │
│ • setHideTestBookings()      │ ← New
└──────────────────────────────┘
           ▲
           │ useRole()
           │
     [Settings Page]
           │
           ▼
┌──────────────────────────────┐
│    BookingsContext           │
├──────────────────────────────┤
│ State:                       │
│ • bookings: [ ... ]          │
│   ├─ {id: BK001, ...}        │
│   ├─ {id: BK002, ...}        │
│   └─ ...                     │
│                              │
│ Methods:                     │
│ • addBooking()               │
│ • updateBooking()            │
│ • deleteBooking(id)          │
│ • updateStatus()             │
└──────────────────────────────┘
           ▲
           │ useBookings()
           │
     [Settings Page]
           │
           ▼
┌──────────────────────────────┐
│   ToastContext               │
├──────────────────────────────┤
│ Methods:                     │
│ • addToast(msg, type)        │
│                              │
│ Types: success, error, info  │
└──────────────────────────────┘
```

---

## 🎨 Color & Styling Reference

```
┌─────────────────────────────────────────┐
│  Test Bookings Card Styling             │
├─────────────────────────────────────────┤
│                                         │
│  Background:                            │
│  ├─ Main: linear-gradient(              │
│  │        135deg, #fef2f2, #fefbfb)    │
│  └─ Light red theme                     │
│                                         │
│  Border: 1.5px solid #fecaca (Rose 300)│
│                                         │
│  Header Icon:                           │
│  ├─ Background: #fee2e2 (Rose 100)     │
│  └─ Icon Color: #C0392B (Dark Red)     │
│                                         │
│  Title: #991b1b (Dark Red)              │
│  Subtitle: #b91c1c (Red)                │
│                                         │
│  Count Box:                             │
│  ├─ Background: #fff                    │
│  ├─ Border: 1.5px #fecaca              │
│  ├─ Text: #374151                       │
│  └─ Padding: 14px 16px                  │
│                                         │
│  List Box:                              │
│  ├─ Background: #fef2f2                │
│  ├─ Items: #fff with #fecaca border    │
│  ├─ Text: #7f1d1d                       │
│  └─ Badge: #fecaca bg, #991b1b text    │
│                                         │
│  Delete Button:                         │
│  ├─ Enabled: #dc2626 → #b91c1c (hover)│
│  ├─ Disabled: #e5e7eb (gray)           │
│  ├─ Text: #fff (enabled), #9ca3af (dis)│
│  ├─ Height: 44px                        │
│  ├─ Radius: 12px                        │
│  └─ Font: 700, 13px                     │
│                                         │
│  Warning Banner:                        │
│  ├─ Background: #fee2e2                │
│  ├─ Border: none                        │
│  ├─ Text: #991b1b                       │
│  ├─ Radius: 10px                        │
│  └─ Padding: 10px 14px                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

```
Desktop (1024px+)
┌──────────────────────────────────────────┐
│ Settings                                  │
├──────────────────────────────────────────┤
│ [Manager Access Control]                  │
│ [Test & Demo Bookings] ← Full width      │
│  ├─ [Icon] Title                          │
│  ├─ Count Box (full width)                │
│  ├─ List (scrollable, max height 200px)  │
│  ├─ Delete Button (full width)            │
│  └─ Warning Banner (full width)           │
│ [Venue Information]                       │
└──────────────────────────────────────────┘

Tablet (768px - 1024px)
┌─────────────────────────────┐
│ Settings                     │
├─────────────────────────────┤
│ [Mgr Access Control]         │
│ [Test & Demo Bookings]       │
│  Same layout as desktop      │
│ [Venue Information]          │
└─────────────────────────────┘

Mobile (< 768px)
┌──────────────────┐
│ Settings         │
├──────────────────┤
│ [Mgr Access]     │
│ [Test & Demo]    │
│  Card padding:   │
│  14px (vs 16px)  │
│ [Venue Info]     │
└──────────────────┘
```

---

## 🔐 Access Control Matrix

```
┌────────────┬─────────┬──────────┬──────────┐
│ Feature    │ Owner   │ Manager  │ Staff    │
├────────────┼─────────┼──────────┼──────────┤
│ Manager    │         │          │          │
│ Access     │ ✅ SHOW │ ❌ HIDE  │ ❌ HIDE  │
│ Control    │         │          │          │
├────────────┼─────────┼──────────┼──────────┤
│ Test       │         │          │          │
│ Bookings   │ ✅ SHOW │ ❌ HIDE  │ ❌ HIDE  │
│ Management │         │          │          │
├────────────┼─────────┼──────────┼──────────┤
│ Delete Test│         │          │          │
│ Bookings   │ ✅ YES  │ ❌ NO    │ ❌ NO    │
│ Button     │         │          │          │
├────────────┼─────────┼──────────┼──────────┤
│ See Count  │ ✅ YES  │ ❌ NO    │ ❌ NO    │
│ of Tests   │         │          │          │
└────────────┴─────────┴──────────┴──────────┘

Rule: if (isOwner) { show section; }
      else { hide section; }
```

---

## 🎬 User Interaction Flow

```
START
│
├─ User logs in as Owner
│  └─ Navigate to Settings
│     └─ Scroll down
│        └─ See "Test & Demo Bookings" section
│           │
│           ├─ No test bookings found
│           │  ├─ Count: 0
│           │  ├─ Message: "All bookings look legitimate! ✨"
│           │  └─ Delete button: DISABLED (gray)
│           │
│           └─ Test bookings found
│              ├─ Count: X
│              ├─ Show list of bookings
│              ├─ Delete button: ENABLED (red)
│              │
│              └─ User clicks "Delete All Test Bookings"
│                 │
│                 ├─ Toast: "Deleted X test booking(s)! 🗑️"
│                 ├─ Count updates to 0
│                 ├─ Button becomes DISABLED
│                 ├─ Dashboard auto-updates
│                 │  └─ Booking count decreases
│                 │  └─ Revenue stats update
│                 │  └─ Monthly charts refresh
│                 │
│                 └─ Reports reflect clean data
│
└─ END
```

---

## 📊 Impact Visualization

```
BEFORE CLEANUP
┌──────────────────────────────┐
│ Bookings Dashboard           │
├──────────────────────────────┤
│ Total Bookings: 25 ⚠️ INFLATED
│ (3 of these are TEST/FAKE)   │
│                              │
│ Recent Stats:                │
│ ├─ May: 5 bookings ⚠️        │
│ │  (should be 2)             │
│ ├─ April: 4 bookings         │
│ └─ March: 3 bookings         │
│                              │
│ Revenue: ₹5,20,000 ⚠️ WRONG  │
│ (includes fake booking)      │
└──────────────────────────────┘

           ▼ Owner clicks Delete

AFTER CLEANUP
┌──────────────────────────────┐
│ Bookings Dashboard           │
├──────────────────────────────┤
│ Total Bookings: 22 ✅ CORRECT
│ (all legitimate)             │
│                              │
│ Recent Stats:                │
│ ├─ May: 2 bookings ✅        │
│ │  (accurate)                │
│ ├─ April: 4 bookings ✅      │
│ └─ March: 3 bookings ✅      │
│                              │
│ Revenue: ₹4,95,000 ✅ CORRECT
│ (legitimate bookings only)   │
└──────────────────────────────┘
```

---

## 📚 File Structure

```
hallmaster/
├─ src/
│  ├─ pages/
│  │  └─ Settings.jsx ← MODIFIED
│  │     └─ New "Test & Demo Bookings" section (95+ lines)
│  │
│  ├─ context/
│  │  ├─ BookingsContext.jsx ← Used
│  │  └─ RoleContext.jsx ← MODIFIED
│  │     └─ Added hideTestBookings state & setter
│  │
│  └─ components/
│     └─ Toast.jsx ← Used for notifications
│
├─ docs/
│  ├─ TEST_BOOKINGS_FEATURE.md ← Technical docs
│  ├─ TEST_BOOKINGS_QUICK_GUIDE.md ← User guide
│  ├─ IMPLEMENTATION_SUMMARY.md ← This summary
│  └─ MOBILE_RESPONSIVE_CHANGES.md ← Previous work
│
└─ package.json ← No changes needed
   (all dependencies already present)
```

---

*Visual Guide Completed: 11 May 2026*  
*Feature Status: ✅ Production Ready*
