/**
 * Seed script — populates the database with initial data.
 * Run: node seed.js
 */
require("dotenv").config();
const sequelize = require("./db");
const { Tenant, Environment, Subscription, User, Booking, Expense, Settings } = require("./models");

// ── Tenant ──
const DEFAULT_TENANT = {
  name: "Sreelakshmi Convention Centre",
  slug: "sreelakshmi",
  ownerName: "Rajan P.K.",
  email: "owner@sreelakshmi.com",
  phone: "+91 94470 12345",
  status: "active",
  sandboxEnabled: true,
  allowEnvironmentSwitch: true,
};

// ── Users (tenantId assigned dynamically) ──
const USERS = [
  { name: "Rajan P.K.", email: "owner@sreelakshmi.com", password: "owner123", role: "Owner", phone: "9447012345" },
  { name: "Suresh Kumar", email: "manager@venueza.com", password: "manager123", role: "Manager", phone: "9447056789" },
  { name: "Anitha Nair", email: "staff@venueza.com", password: "staff123", role: "Staff", phone: "9447098765" },
];

// ── SuperAdmin ──
const SUPERADMIN = { name: "Platform Admin", email: "admin@venueza.com", password: "admin123", role: "SuperAdmin", phone: "" };

const BOOKINGS = [
  { bookingId: "BK001", customerName: "Arun & Divya", phone: "9447012345", eventType: "Wedding", hall: "Main Hall", date: "2026-05-10", session: "Full Day", guests: 450, advance: 10000, totalAmount: 35000, status: "Confirmed", notes: "Sadya for 450 guests, stage decoration needed" },
  { bookingId: "BK002", customerName: "Sreekumar Family", phone: "9447056789", eventType: "Reception", hall: "Main Hall", date: "2026-05-12", session: "Evening", guests: 300, advance: 5000, totalAmount: 20000, status: "Confirmed", notes: "Evening reception, DJ required" },
  { bookingId: "BK003", customerName: "Priya & Vishnu", phone: "9895012345", eventType: "Engagement", hall: "Mini Hall", date: "2026-05-15", session: "Morning", guests: 100, advance: 3000, totalAmount: 10000, status: "Confirmed", notes: "" },
  { bookingId: "BK004", customerName: "St. Mary's Church", phone: "9447098765", eventType: "Baptism", hall: "Mini Hall", date: "2026-05-18", session: "Morning", guests: 80, advance: 2000, totalAmount: 8000, status: "Pending Payment", notes: "Church event, no catering needed" },
  { bookingId: "BK005", customerName: "Anitha Nair", phone: "9946012345", eventType: "Birthday", hall: "Mini Hall", date: "2026-05-20", session: "Evening", guests: 120, advance: 0, totalAmount: 9000, status: "Enquiry", notes: "60th birthday celebration" },
  { bookingId: "BK006", customerName: "Moosa & Fathima", phone: "9747012345", eventType: "Wedding", hall: "Main Hall", date: "2026-05-22", session: "Full Day", guests: 500, advance: 15000, totalAmount: 40000, status: "Confirmed", notes: "Full sadya, need generator backup" },
  { bookingId: "BK007", customerName: "Rajesh Kumar", phone: "9847023456", eventType: "Corporate Event", hall: "Mini Hall", date: "2026-05-25", session: "Full Day", guests: 100, advance: 5000, totalAmount: 15000, status: "Confirmed", notes: "Company annual meeting" },
  { bookingId: "BK008", customerName: "Lakshmi & Suresh", phone: "9447034567", eventType: "Seemantham", hall: "Mini Hall", date: "2026-05-28", session: "Morning", guests: 60, advance: 2000, totalAmount: 7000, status: "Confirmed", notes: "" },
  { bookingId: "BK009", customerName: "Thomas & Mary", phone: "9447045678", eventType: "Wedding", hall: "Main Hall", date: "2026-06-02", session: "Full Day", guests: 400, advance: 10000, totalAmount: 38000, status: "Confirmed", notes: "Christian wedding" },
  { bookingId: "BK010", customerName: "Vinod Family", phone: "9946023456", eventType: "Reception", hall: "Open Stage", date: "2026-06-05", session: "Evening", guests: 250, advance: 4000, totalAmount: 18000, status: "Pending Payment", notes: "Outdoor reception, need extra lights" },
  { bookingId: "BK011", customerName: "Santhosh & Meera", phone: "9747034567", eventType: "Wedding", hall: "Main Hall", date: "2026-06-08", session: "Full Day", guests: 480, advance: 12000, totalAmount: 42000, status: "Confirmed", notes: "" },
  { bookingId: "BK012", customerName: "PTA Taliparamba School", phone: "9447067890", eventType: "Annual Day", hall: "Main Hall", date: "2026-06-15", session: "Full Day", guests: 350, advance: 8000, totalAmount: 25000, status: "Confirmed", notes: "School program, need projector screen" },
  { bookingId: "BK013", customerName: "Rema & Biju", phone: "9895034567", eventType: "Engagement", hall: "Mini Hall", date: "2026-04-22", session: "Morning", guests: 90, advance: 3000, totalAmount: 9000, status: "Completed", notes: "" },
  { bookingId: "BK014", customerName: "Abdul & Safiya", phone: "9447078901", eventType: "Wedding", hall: "Main Hall", date: "2026-04-28", session: "Full Day", guests: 460, advance: 15000, totalAmount: 39000, status: "Completed", notes: "" },
  { bookingId: "BK015", customerName: "Gopalan Nair", phone: "9946045678", eventType: "Birthday", hall: "Mini Hall", date: "2026-04-25", session: "Evening", guests: 70, advance: 2000, totalAmount: 7000, status: "Completed", notes: "75th birthday" },
  { bookingId: "BK016", customerName: "Deepa & Anil", phone: "9747056789", eventType: "Wedding", hall: "Main Hall", date: "2026-06-20", session: "Full Day", guests: 500, advance: 0, totalAmount: 40000, status: "Enquiry", notes: "Referred by Vinod family" },
  { bookingId: "BK017", customerName: "CSI Church Kannur", phone: "9447089012", eventType: "Conference", hall: "Main Hall", date: "2026-06-22", session: "Full Day", guests: 200, advance: 5000, totalAmount: 20000, status: "Confirmed", notes: "" },
  { bookingId: "BK018", customerName: "Nisha & Praveen", phone: "9895056789", eventType: "Reception", hall: "Main Hall", date: "2026-06-25", session: "Evening", guests: 350, advance: 8000, totalAmount: 22000, status: "Confirmed", notes: "" },
  { bookingId: "BK019", customerName: "Manoj Family", phone: "9946067890", eventType: "Seemantham", hall: "Mini Hall", date: "2026-04-30", session: "Morning", guests: 50, advance: 2000, totalAmount: 6000, status: "Completed", notes: "" },
  { bookingId: "BK020", customerName: "Faisal & Reshma", phone: "9747067890", eventType: "Wedding", hall: "Main Hall", date: "2026-07-05", session: "Full Day", guests: 420, advance: 10000, totalAmount: 38000, status: "Confirmed", notes: "Need Halal catering vendor" },
  { bookingId: "BK021", customerName: "Sneha & Rahul", phone: "9447112233", eventType: "Wedding", hall: "Main Hall", date: "2026-06-29", session: "Full Day", guests: 600, advance: 20000, totalAmount: 45000, status: "Confirmed", notes: "VVIP guests attending, special security needed" },
  { bookingId: "BK022", customerName: "Kannan & Meenakshi", phone: "9447122334", eventType: "Engagement", hall: "Mini Hall", date: "2026-06-30", session: "Evening", guests: 150, advance: 5000, totalAmount: 12000, status: "Confirmed", notes: "Floral decorations needed" },
  { bookingId: "BK023", customerName: "Lulu Group", phone: "9447133445", eventType: "Corporate", hall: "Main Hall", date: "2026-07-10", session: "Full Day", guests: 300, advance: 15000, totalAmount: 35000, status: "Confirmed", notes: "Corporate retreat" },
  { bookingId: "BK024", customerName: "Malabar Gold", phone: "9447144556", eventType: "Corporate", hall: "Open Stage", date: "2026-07-12", session: "Evening", guests: 400, advance: 10000, totalAmount: 25000, status: "Confirmed", notes: "Staff annual gathering" },
];

// Sandbox sample bookings (subset, clearly labeled as training data)
const SANDBOX_BOOKINGS = [
  { bookingId: "BK001", customerName: "Sample Wedding Booking", phone: "9000000001", eventType: "Wedding", hall: "Main Hall", date: "2026-08-15", session: "Full Day", guests: 300, advance: 5000, totalAmount: 25000, status: "Confirmed", notes: "This is a sample booking for training" },
  { bookingId: "BK002", customerName: "Sample Birthday Event", phone: "9000000002", eventType: "Birthday", hall: "Mini Hall", date: "2026-08-20", session: "Evening", guests: 80, advance: 2000, totalAmount: 8000, status: "Pending Payment", notes: "Sample — practice updating status" },
  { bookingId: "BK003", customerName: "Sample Enquiry", phone: "9000000003", eventType: "Reception", hall: "Open Stage", date: "2026-08-25", session: "Evening", guests: 200, advance: 0, totalAmount: 15000, status: "Enquiry", notes: "Sample — practice converting to confirmed" },
  { bookingId: "BK051", customerName: "Rahul & Sneha (Sandbox)", phone: "9000000010", eventType: "Wedding", hall: "Main Hall", date: "2026-07-02", session: "Full Day", guests: 400, advance: 15000, totalAmount: 45000, status: "Confirmed", notes: "Sandbox test booking" },
  { bookingId: "BK052", customerName: "TechCorp Meetup", phone: "9000000011", eventType: "Conference", hall: "Mini Hall", date: "2026-07-05", session: "Morning", guests: 80, advance: 5000, totalAmount: 12000, status: "Confirmed", notes: "Sandbox test booking" },
  { bookingId: "BK053", customerName: "Ayesha's Birthday", phone: "9000000012", eventType: "Birthday", hall: "Open Stage", date: "2026-07-08", session: "Evening", guests: 150, advance: 2000, totalAmount: 8000, status: "Pending Payment", notes: "Sandbox test booking" },
  { bookingId: "BK054", customerName: "John's Baptism", phone: "9000000013", eventType: "Baptism", hall: "Mini Hall", date: "2026-07-12", session: "Morning", guests: 100, advance: 4000, totalAmount: 10000, status: "Confirmed", notes: "Sandbox test booking" },
  { bookingId: "BK055", customerName: "Karthik Family", phone: "9000000014", eventType: "Reception", hall: "Main Hall", date: "2026-07-15", session: "Evening", guests: 300, advance: 0, totalAmount: 25000, status: "Enquiry", notes: "Sandbox test booking" },
  { bookingId: "BK056", customerName: "Anita & Rohit", phone: "9000000015", eventType: "Engagement", hall: "Mini Hall", date: "2026-07-20", session: "Morning", guests: 120, advance: 5000, totalAmount: 15000, status: "Confirmed", notes: "Sandbox test booking" },
  { bookingId: "BK057", customerName: "Nair Family Meet", phone: "9000000016", eventType: "Other", hall: "Open Stage", date: "2026-07-24", session: "Full Day", guests: 200, advance: 8000, totalAmount: 18000, status: "Confirmed", notes: "Sandbox test booking" },
  { bookingId: "BK058", customerName: "Sneha & Vishnu", phone: "9000000017", eventType: "Wedding", hall: "Main Hall", date: "2026-07-28", session: "Full Day", guests: 500, advance: 20000, totalAmount: 50000, status: "Pending Payment", notes: "Sandbox test booking" },
  { bookingId: "BK059", customerName: "Global Tech Summit", phone: "9000000018", eventType: "Conference", hall: "Main Hall", date: "2026-07-30", session: "Full Day", guests: 600, advance: 30000, totalAmount: 60000, status: "Confirmed", notes: "Sandbox test booking" },
];

const SANDBOX_EXPENSES = [
  { category: "Staff Salaries", description: "Sample — Manager Salary", amount: 30000, date: "2026-08-01", recurring: true },
  { category: "Utilities", description: "Sample — Electricity Bill", amount: 20000, date: "2026-08-10", recurring: true },
  { category: "Staff Salaries", description: "Sandbox Manager Salary (July)", amount: 35000, date: "2026-07-01", recurring: true },
  { category: "Maintenance", description: "Sandbox AC Repair", amount: 4500, date: "2026-07-05", recurring: false },
  { category: "Utilities", description: "Sandbox Electricity Bill (June)", amount: 18000, date: "2026-07-10", recurring: true },
  { category: "Miscellaneous", description: "Sandbox Office Supplies", amount: 2000, date: "2026-07-15", recurring: false },
  { category: "Catering Prep", description: "Sandbox Kitchen Restock", amount: 8000, date: "2026-07-20", recurring: false },
];

const EXPENSES = [
  { category: "Staff Salaries", description: "Hall Manager – Rajan P.K.", amount: 35000, date: "2026-04-01", recurring: true },
  { category: "Staff Salaries", description: "Caretaker – Suresh Kumar", amount: 18000, date: "2026-04-01", recurring: true },
  { category: "Staff Salaries", description: "Security Guard (2 staff)", amount: 24000, date: "2026-04-01", recurring: true },
  { category: "Staff Salaries", description: "Cleaning Staff (3 members)", amount: 21000, date: "2026-04-01", recurring: true },
  { category: "Maintenance", description: "AC Service – Main Hall", amount: 8500, date: "2026-04-05", recurring: false },
  { category: "Maintenance", description: "Generator Fuel & Service", amount: 12000, date: "2026-04-08", recurring: false },
  { category: "Utilities", description: "Electricity Bill – April", amount: 22000, date: "2026-04-10", recurring: true },
  { category: "Utilities", description: "Water Bill – April", amount: 3500, date: "2026-04-10", recurring: true },
  { category: "Utilities", description: "Internet & Phone", amount: 1800, date: "2026-04-10", recurring: true },
  { category: "Catering Prep", description: "Catering Equipment Restock", amount: 6500, date: "2026-04-18", recurring: false },
  { category: "Miscellaneous", description: "Office Supplies & Stationery", amount: 2200, date: "2026-04-20", recurring: false },
  { category: "Miscellaneous", description: "Flower Decoration (event support)", amount: 3800, date: "2026-04-22", recurring: false },
  { category: "Staff Salaries", description: "Hall Manager – Rajan P.K.", amount: 35000, date: "2026-05-01", recurring: true },
  { category: "Staff Salaries", description: "Caretaker – Suresh Kumar", amount: 18000, date: "2026-05-01", recurring: true },
  { category: "Staff Salaries", description: "Security Guard (2 staff)", amount: 24000, date: "2026-05-01", recurring: true },
  { category: "Staff Salaries", description: "Cleaning Staff (3 members)", amount: 21000, date: "2026-05-01", recurring: true },
  { category: "Utilities", description: "Electricity Bill – May", amount: 24500, date: "2026-05-10", recurring: true },
  { category: "Utilities", description: "Water Bill – May", amount: 3800, date: "2026-05-10", recurring: true },
  { category: "Staff Salaries", description: "Hall Manager – Rajan P.K.", amount: 35000, date: "2026-06-01", recurring: true },
  { category: "Staff Salaries", description: "Caretaker – Suresh Kumar", amount: 18000, date: "2026-06-01", recurring: true },
  { category: "Staff Salaries", description: "Security Guard (2 staff)", amount: 24000, date: "2026-06-01", recurring: true },
  { category: "Staff Salaries", description: "Cleaning Staff (3 members)", amount: 21000, date: "2026-06-01", recurring: true },
  { category: "Utilities", description: "Electricity Bill – June", amount: 25000, date: "2026-06-10", recurring: true },
  { category: "Utilities", description: "Water Bill – June", amount: 4000, date: "2026-06-10", recurring: true },
  { category: "Maintenance", description: "Plumbing repair in Kitchen", amount: 4500, date: "2026-06-15", recurring: false },
  { category: "Miscellaneous", description: "Onam advance for staff", amount: 10000, date: "2026-06-25", recurring: false },
];

const HALLS = [
  { name: "Main Hall", icon: "🏛️", price: 15000, capacity: 600, description: "Grand ballroom with full AV setup" },
  { name: "Mini Hall", icon: "🏠", price: 6000, capacity: 150, description: "Intimate setting for smaller events" },
  { name: "Open Stage", icon: "🌿", price: 8000, capacity: 300, description: "Outdoor stage with natural surroundings" },
];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log("✅ Database synced & tables dropped");

    // ── 1. Create Tenant ──
    const tenant = await Tenant.create(DEFAULT_TENANT);
    console.log(`🏢 Created tenant: ${tenant.name} (slug: ${tenant.slug})`);
    
    // ── 2. Create Environments ──
    const prodEnv = await Environment.create({ tenantId: tenant.id, name: "Production", type: "production", isDefault: true });
    const sandboxEnv = await Environment.create({ tenantId: tenant.id, name: "Sandbox", type: "sandbox", isDefault: false });
    console.log(`🌍 Created environments: ${prodEnv.name}, ${sandboxEnv.name}`);

    // ── 3. Create Subscription ──
    const today = new Date().toISOString().split("T")[0];
    await Subscription.create({
      tenantId: tenant.id,
      plan: "premium",
      status: "active",
      subscriptionStartDate: today,
      subscriptionEndDate: null,
      managedBy: "manual",
      notes: "Default tenant — full access",
    });
    console.log("📦 Created subscription");

    // ── 4. Create SuperAdmin ──
    await User.create({ ...SUPERADMIN, tenantId: tenant.id });
    console.log("🔑 Created SuperAdmin (admin@venueza.com / admin123)");

    // ── 5. Create Users ──
    for (let u of USERS) {
      await User.create({ ...u, tenantId: tenant.id });
    }
    console.log(`👤 Created ${USERS.length} tenant users`);

    // ── 6. Seed PRODUCTION bookings ──
    const prodBookings = BOOKINGS.map(b => ({ ...b, tenantId: tenant.id, environmentId: prodEnv.id }));
    await Booking.bulkCreate(prodBookings);
    console.log(`📋 Created ${BOOKINGS.length} production bookings`);

    // ── 7. Seed SANDBOX bookings ──
    const sandboxBookings = SANDBOX_BOOKINGS.map(b => ({ ...b, tenantId: tenant.id, environmentId: sandboxEnv.id }));
    await Booking.bulkCreate(sandboxBookings);
    console.log(`🧪 Created ${SANDBOX_BOOKINGS.length} sandbox bookings`);

    // ── 8. Seed PRODUCTION expenses ──
    const prodExpenses = EXPENSES.map(e => ({ ...e, tenantId: tenant.id, environmentId: prodEnv.id }));
    await Expense.bulkCreate(prodExpenses);
    console.log(`💰 Created ${EXPENSES.length} production expenses`);

    // ── 9. Seed SANDBOX expenses ──
    const sandboxExpenses = SANDBOX_EXPENSES.map(e => ({ ...e, tenantId: tenant.id, environmentId: sandboxEnv.id }));
    await Expense.bulkCreate(sandboxExpenses);
    console.log(`🧪 Created ${SANDBOX_EXPENSES.length} sandbox expenses`);

    // ── 10. Seed PRODUCTION settings ──
    await Settings.create({ tenantId: tenant.id, environmentId: prodEnv.id, halls: HALLS });
    console.log("⚙️  Created production settings");

    // ── 11. Seed SANDBOX settings (copy of production) ──
    await Settings.create({ tenantId: tenant.id, environmentId: sandboxEnv.id, halls: HALLS });
    console.log("🧪 Created sandbox settings");

    console.log("\n🎉 Seed complete! Login credentials:");
    console.log("   SuperAdmin: admin@venueza.com / admin123");
    console.log("   Owner:      owner@sreelakshmi.com / owner123");
    console.log("   Manager:    manager@venueza.com / manager123");
    console.log("   Staff:      staff@venueza.com / staff123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
