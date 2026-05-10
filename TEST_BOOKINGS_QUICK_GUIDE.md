# Test Bookings Management - Quick Start Guide

## How to Use

### Step 1: Go to Settings
```
Navigation → Settings
```

### Step 2: Find "Test & Demo Bookings" Section
Look for the **red section** with 🗑️ icon below "Manager Access Control"

### Step 3: Review Test Bookings
The section shows:
```
Found X test booking(s)
Bookings with "TEST", "FAKE", or "DEMO" in customer name will be removed
```

If any test bookings exist, you'll see a scrollable list:
```
🧪 Test Bookings to be deleted:
├─ Test Wedding - Wedding (2026-05-22) [BK001]
├─ FAKE Reception - Reception (2026-06-05) [BK002]
└─ Demo Event - Corporate Event (2026-05-25) [BK007]
```

### Step 4: Delete Test Bookings
Click the red **"Delete All Test Bookings"** button

### Step 5: Confirmation
You'll see a toast notification:
```
✅ Deleted 3 test bookings! 🗑️
```

---

## What Gets Detected?

### ✅ Test Bookings (Will be deleted)
- "Test Wedding" ← Contains "TEST"
- "FAKE Birthday Party" ← Contains "FAKE"
- "Demo Reception" ← Contains "DEMO"
- "Test Demo Event" ← Contains both (will match first)
- "testing celebration" ← "test" (case-insensitive)

### ❌ Real Bookings (Will NOT be deleted)
- "Arun & Divya Wedding" ← No keywords
- "St. Mary's Church" ← No keywords
- "Corporate Summit 2026" ← No keywords
- "TestCustomer" ← No space before "TEST" (word boundary)

---

## After Deletion

**Dashboard Updates:**
- Booking count decreases
- Total revenue calculation updated
- Monthly booking stats adjusted

**Reports Affected:**
- Monthly bookings chart updates
- Revenue summary recalculated
- Customer count may decrease

**Bookings Page:**
- Test bookings removed from list
- Page count updated

---

## ⚠️ Important Notes

1. **Permanent Action** - Deleted bookings cannot be recovered
2. **Instant Effect** - Changes appear immediately across the app
3. **Owner Only** - Only Owner role can see and use this feature
4. **Smart Detection** - Case-insensitive keyword matching

---

## Example Scenarios

### Scenario 1: First Time Setup (No test bookings)
```
Found 0 test bookings
No test bookings detected. All bookings look legitimate! ✨

[Delete Button - DISABLED - grayed out]
```

### Scenario 2: After Testing (3 test bookings)
```
Found 3 test bookings
Bookings with "TEST", "FAKE", or "DEMO" in customer name will be removed

[Scrollable List of 3 bookings]

[Delete Button - ENABLED - red and clickable]
                ↓
           [Click to delete]
                ↓
        ✅ Toast: "Deleted 3 test bookings! 🗑️"
                ↓
     [Count updates to 0 - button grays out]
```

---

## Troubleshooting

### Q: "Delete button is disabled. Why?"
**A:** There are no test bookings detected. Make sure your test booking customer name contains one of:
- "TEST"
- "FAKE"
- "DEMO"

### Q: "I deleted a booking by mistake. Can I recover it?"
**A:** Unfortunately, no. This action is permanent. However, you can:
- Re-create the booking manually
- Export your bookings data from Reports (if you had a backup)

### Q: "Not all my test bookings were deleted"
**A:** Make sure the customer name contains one of these keywords:
- "TEST" ✅ (case-insensitive)
- "FAKE" ✅
- "DEMO" ✅

If your test booking has a different name, you'll need to delete it manually from the Bookings page.

### Q: "Will this affect real bookings?"
**A:** No. This feature only targets bookings with "TEST", "FAKE", or "DEMO" in the customer name. Your real bookings are safe.

---

## Tips & Best Practices

### ✅ Best Practice: Use Consistent Names
When creating test bookings, always use these naming patterns:
- "TEST - Wedding Demo"
- "FAKE Customer - Reception"
- "DEMO Event - Birthday Party"

This makes it easier to identify and delete them later.

### ✅ Best Practice: Regular Cleanup
Run this cleanup weekly or monthly to keep your data clean:
1. Settings → Test & Demo Bookings
2. Review the list
3. Delete all test bookings
4. Check Dashboard stats updated correctly

### ✅ Best Practice: Document Test Bookings
Create a reference in your team notes:
```
Test Booking Names Used:
- "TEST Wedding" - For testing wedding bookings flow
- "FAKE Birthday" - For testing birthday party workflows
- "DEMO Corporate" - For testing corporate events
```

---

## API Integration (Developers)

### Accessing Test Bookings Programmatically
```javascript
import { useBookings } from "../context/BookingsContext";
import { useRole } from "../context/RoleContext";

function MyComponent() {
  const { bookings, deleteBooking } = useBookings();
  const { role } = useRole();
  
  // Filter test bookings (same logic as Settings)
  const testBookings = bookings.filter(b => 
    b.customerName?.toUpperCase().includes("TEST") || 
    b.customerName?.toUpperCase().includes("FAKE") || 
    b.customerName?.toUpperCase().includes("DEMO")
  );
  
  // Delete test booking
  const deleteTestBooking = (bookingId) => {
    deleteBooking(bookingId);
  };
  
  return (
    <div>
      <p>Found {testBookings.length} test bookings</p>
      {/* Your UI here */}
    </div>
  );
}
```

---

## Analytics Impact

### Before Cleanup (With 5 test bookings):
```
Dashboard:
- Total Bookings: 25
- Total Revenue: ₹5,20,000
- Monthly Average: 2 bookings

Reports:
- Last Month: 5 bookings, ₹1,05,000 revenue
```

### After Cleanup (Remove 5 test bookings):
```
Dashboard:
- Total Bookings: 20 ✨ (corrected)
- Total Revenue: ₹4,95,000 ✨ (corrected)
- Monthly Average: 1.67 bookings ✨ (more accurate)

Reports:
- Last Month: 0 bookings, ₹0 revenue ✨ (accurate)
```

---

## Feature Roadmap

### ✅ v1.0 (Current)
- Detect test bookings by keyword
- Show count and list
- Bulk delete all test bookings
- Toast notifications

### 🔄 v1.1 (Planned)
- Toggle to hide test bookings instead of deleting
- Individual delete checkbox (selective deletion)
- Export test bookings to CSV

### 🚀 v2.0 (Future)
- Date-based filtering
- Auto-delete test bookings after X days
- Test booking marker during creation
- Audit log of deleted bookings

---

## Support

If you have questions or issues with this feature:
1. Check the **Troubleshooting** section above
2. Review your test booking names - ensure they contain TEST/FAKE/DEMO
3. Verify you're logged in as **Owner** (feature hidden for other roles)
4. Check browser console for any JavaScript errors (F12)

---

*Last Updated: 11 May 2026*  
*Feature Version: 1.0*  
*Status: Production Ready ✅*
