# Salon Management Platform

## 1. Project Goal

Convert the existing Hair Salon PWA into a complete salon platform with two connected sides:

### Customer Side
- Professional salon website
- Mobile PWA
- Service browsing
- Salon information
- Offers
- Guest appointment booking
- Optional customer account
- Appointment management
- Customer history
- Bills
- Notifications

### Owner/Staff Side
- Owner dashboard
- Staff dashboard
- Appointment management
- Customer CRM
- Service management
- Staff management
- Billing
- Payments
- Offers
- Reports
- Excel export
- Email reports
- Google Sheets integration

The customer, owner and staff systems must use the same backend and database.

---

# 2. EXISTING APPLICATION

An existing salon PWA already exists.

The existing project uses:

- Firebase Authentication
- Firebase/Firestore database
- Existing frontend/PWA functionality

DO NOT replace Firebase unless there is a strong technical reason.

Before implementing major changes, inspect the existing codebase.

## First task: Code Audit

Do not immediately rewrite the application.

Inspect:

- Frontend
- Backend/server logic if present
- Firebase Authentication
- Firestore
- Firestore Security Rules
- Current database structure
- Existing customer flow
- Existing booking flow
- Existing owner/admin functionality
- PWA configuration
- Routing
- API/serverless functions
- Environment variables
- Deployment
- Storage
- Existing notification implementation

Identify:

- What works
- What is incomplete
- What is reusable
- What needs modification
- What needs refactoring
- What should be rewritten
- Security issues
- Performance issues
- Architectural issues

Then recommend:

### A. Continue modifying existing code

OR

### B. Keep useful parts and rebuild the core

OR

### C. Rebuild from scratch

Do not make this decision based simply on the project being old.

---

# 3. CORE ARCHITECTURE

The system should be:

```text
                    SALON PLATFORM
                          |
             +------------+------------+
             |                         |
       CUSTOMER SIDE              OWNER SIDE
             |                         |
      Website + PWA              Owner Dashboard
                                       |
                                  Staff Dashboard
             |                         |
             +------------+------------+
                          |
                     Firebase
                          |
              +-----------+-----------+
              |                       |
        Firebase Auth            Firestore
              |                       |
        Authentication          Application Data
```

External integrations:

```text
Firestore
   |
   +---- Excel
   |
   +---- Email
   |
   +---- Google Sheets
   |
   +---- WhatsApp
   |
   +---- PWA Notifications
```

Firestore remains the source of truth.

---

# 4. USER TYPES

## 4.1 Guest Customer

No account.

Can:

- Visit website
- View all public pages
- View services
- View prices
- View offers
- View gallery
- View salon information
- Book appointment
- View appointment through secure booking link
- Cancel/reschedule if enabled

## 4.2 Registered Customer

Uses Firebase Authentication.

Can:

- Everything a guest can do
- Profile
- Upcoming appointments
- Appointment history
- Previous bills
- Offers
- Notifications
- Saved/favourite services if implemented
- Future rewards/loyalty

Account creation is optional.

## 4.3 Staff

Uses Firebase Authentication.

Can:

- View authorized appointments
- View today's appointments
- View customer/service information
- Update appointment status
- Mark completed
- Mark no-show
- Create/update bill if permission is granted

Cannot access owner-only functions unless explicitly authorized.

## 4.4 Owner

Full salon access:

- Dashboard
- Appointments
- Customers
- Staff
- Services
- Billing
- Payments
- Offers
- Reports
- Excel
- Email reports
- Google Sheets
- Settings

---

# 5. CUSTOMER WEBSITE

The customer side must look and behave like a traditional professional salon website.

It must NOT look like a booking form.

## Public Navigation

- Home
- Services
- About
- Gallery
- Offers
- Salon/Shop Info
- Contact
- Book Appointment
- Login / My Account

All public pages must work without login.

---

# 6. HOME PAGE

Include:

## Hero

Animated but lightweight.

Example:

"Look Good. Feel Confident."

Buttons:

- Book Appointment
- View Services

## Additional sections

- Featured services
- About salon
- Why choose us
- Gallery
- Offers
- Reviews
- Opening hours
- Location
- Contact
- Footer

Animation must not significantly hurt mobile performance.

---

# 7. SERVICES PAGE

Each service should include:

- Name
- Description
- Price
- Duration
- Image if available
- Book button

Example:

```text
Haircut
₹300
30 minutes

[Book This Service]
```

Customers should be able to select multiple services.

---

# 8. ABOUT

Include:

- Salon story
- Experience
- Team/owner information if desired
- Values
- Images

Content can eventually be editable by owner.

---

# 9. GALLERY

Include salon and service images.

Use:

- Optimized images
- Lazy loading
- Mobile-friendly layout

---

# 10. SALON INFORMATION

Show:

- Address
- Phone
- Opening hours
- Weekly schedule
- Map/location
- Contact information
- Social media links if required

---

# 11. OFFERS

Public users can see active offers.

Owner can:

- Create
- Edit
- Activate/deactivate
- Set start date
- Set expiry date
- Set discount
- Add description

Registered customers should also see offers in their account.

---

# 12. CUSTOMER BOOKING

Booking must NOT require login.

Flow:

```text
Website/PWA
↓
Explore salon
↓
Book Appointment
↓
Select service(s)
↓
Select preferred staff OR Any Available Staff
↓
Select date
↓
Available time slots
↓
Enter name + phone
↓
Optional email
↓
Confirm
↓
Appointment created
↓
Confirmation
↓
Secure booking link
```

---

# 13. MULTIPLE SERVICES

Example:

Haircut = 30 minutes

Beard = 20 minutes

Customer selects both.

Total appointment duration:

50 minutes

The availability engine must calculate the combined duration.

The appointment should store all selected services.

---

# 14. STAFF SELECTION

Customer can:

### Option 1
Select a specific staff member.

### Option 2
Select:

"Any Available Staff"

If a specific staff member is selected, only that staff member's availability is shown.

If "Any Available Staff" is selected, show slots where a qualified available staff member exists.

---

# 15. SERVICE + STAFF COMPATIBILITY

Not every staff member necessarily performs every service.

Owner should be able to assign:

Staff → Services they can perform.

Availability must respect this.

Example:

Rahul can perform:

- Haircut
- Beard

Neha can perform:

- Hair Spa
- Hair Colour

If customer selects Hair Spa and Rahul is not qualified, Rahul should not appear as an available staff member.

---

# 16. AVAILABILITY ENGINE

Availability must be calculated by backend/server-side logic.

Consider:

- Salon hours
- Staff working hours
- Staff days off
- Staff availability
- Existing appointments
- Appointment duration
- Multiple selected services
- Staff/service compatibility
- Holidays
- Salon closed days
- Booking buffer if configured

The frontend must never be trusted as the final availability check.

---

# 17. DOUBLE BOOKING PROTECTION

The backend must prevent:

Two customers
+
same staff
+
overlapping time
=
NOT ALLOWED

This must be protected against simultaneous booking attempts.

Do not rely only on frontend checks.

Use appropriate Firestore/server-side transaction or reservation logic.

---

# 18. GUEST CUSTOMER

Guest customer does not need Firebase Authentication.

However, create a customer record in Firestore.

Example:

```text
customers/{customerId}

{
    name,
    phone,
    email,
    authUid: null,
    hasAccount: false,
    createdAt
}
```

The guest still becomes part of the salon CRM.

---

# 19. REGISTERED CUSTOMER

Registered customer:

```text
customers/{customerId}

{
    name,
    phone,
    email,
    authUid: "firebase-user-id",
    hasAccount: true,
    createdAt
}
```

Firebase Auth handles authentication.

Firestore stores salon/customer information.

---

# 20. GUEST → REGISTERED CUSTOMER

If Rahul books as a guest:

```text
Customer
Rahul
Phone: 9876543210
authUid: null
```

Later Rahul creates an account.

DO NOT create another Rahul.

Instead attach the Firebase Auth UID to the existing customer record.

Previous:

- Appointments
- Bills
- Services
- Customer history

must remain connected.

This is critical for CRM.

---

# 21. CUSTOMER IDENTIFICATION

Do not use phone number as the primary database ID.

Use an internal customer ID.

Phone number can be used for:

- Matching
- Search
- OTP
- Contact

But avoid exposing phone numbers as public identifiers.

---

# 22. GUEST BOOKING SECURITY

After guest booking, generate a secure random booking token.

Example:

```text
/booking/{random-secure-token}
```

Do not expose sensitive data using predictable appointment IDs.

The token should allow access only to that specific appointment.

---

# 23. BOOKING MANAGEMENT

Guest can use the secure link to:

- View appointment
- See service
- See date/time
- See staff
- See salon information
- Cancel if allowed
- Reschedule if allowed

Rescheduling must re-check availability.

---

# 24. LOST BOOKING LINK

Add:

"Find My Appointment"

Customer enters phone number.

Verify using OTP before showing appointment information.

Do not show appointments simply because someone knows another person's phone number.

---

# 25. CUSTOMER ACCOUNT

Account is optional.

After guest booking:

```text
Appointment Confirmed

Create an account for:

✓ Booking history
✓ Faster future booking
✓ Offers
✓ Bills
✓ Notifications

[Create Account]

[Maybe Later]
```

Do not interrupt successful booking.

---

# 26. CUSTOMER ACCOUNT DASHBOARD

Show:

```text
Welcome, Rahul

Next Appointment
Haircut
10 September
5:30 PM
```

Sections:

- My Profile
- My Appointments
- Booking History
- Bills
- Offers
- Notifications

---

# 27. OWNER DASHBOARD

Owner homepage should show today's business.

Example:

```text
Today's Appointments: 18
Completed: 12
Upcoming: 5
Cancelled: 1
No-show: 0

Revenue: ₹8,450
```

Also show:

- Upcoming appointments
- Today's staff
- Recent customers
- Revenue summary
- Quick actions

---

# 28. OWNER NAVIGATION

```text
Dashboard
Appointments
Customers
Staff
Services
Billing
Offers
Reports
Settings
```

---

# 29. OWNER APPOINTMENTS

Owner can:

- Create appointment
- Edit
- Reschedule
- Cancel
- Assign staff
- Change service
- Change status
- View customer
- View billing status

Owner can also manually create bookings for walk-in/phone customers.

This is important because not every salon booking will come through the website.

---

# 30. STAFF DASHBOARD

Staff sees:

- Today's appointments
- Upcoming appointments
- Customer details
- Services
- Appointment status

Actions:

- Start/complete service
- Mark completed
- Mark no-show
- Update service performed
- Billing if authorized

---

# 31. STAFF WORKING HOURS

Owner can define:

- Working days
- Start time
- End time
- Breaks
- Days off
- Leave

Availability engine must use these settings.

---

# 32. CUSTOMER CRM

Customer profile:

```text
Name
Phone
Email
Account status
Total visits
Total spending
Last visit
Upcoming appointment
```

History:

- Appointments
- Services
- Invoices
- Payments

Future:

- Preferred staff
- Favourite services
- Notes
- Birthday
- Customer segments

---

# 33. CUSTOMER NOTES

Owner/staff with permission may add internal notes.

Example:

"Prefers short haircut."

These notes must NOT be visible to the customer unless specifically intended.

---

# 34. BILLING

When service is completed:

```text
Appointment
↓
Services performed
↓
Invoice
↓
Payment
↓
Customer history
```

Invoice includes:

- Invoice number
- Date
- Customer
- Services
- Price
- Discount
- Tax if applicable
- Total
- Payment method
- Salon details

---

# 35. PAYMENT METHODS

Initial:

- Cash
- UPI
- Card
- Other

Manual payment recording is enough for V1.

---

# 36. INVOICE

Owner/staff with permission can:

- View
- Generate PDF
- Print
- Send to customer

Customer can see previous bills after login.

Guest can access their invoice through secure booking/invoice link if desired.

---

# 37. PRICE HISTORY

IMPORTANT:

If service price changes from:

₹300 → ₹350

old invoices must remain ₹300.

Do not dynamically recalculate historical invoices from the current service price.

When an appointment/invoice is created, save the actual price used.

---

# 38. CANCELLATION POLICY

Owner should eventually be able to configure:

- Cancellation allowed/not allowed
- Minimum cancellation time
- Rescheduling allowed/not allowed

Example:

Cancellation allowed until 2 hours before appointment.

For V1, a simple cancellation policy is sufficient.

---

# 39. NO-SHOW

Appointment status:

NO_SHOW

Owner/staff can mark no-show.

Customer history should record it.

Future CRM can use no-show history.

Do not automatically punish/block customers in V1.

---

# 40. WALK-IN / PHONE BOOKINGS

Owner/staff should be able to create an appointment manually.

Example:

Customer calls salon.

Owner enters:

Name
Phone
Service
Staff
Date
Time

This appointment must enter the SAME appointment system as website bookings.

Booking source:

```text
website
pwa
owner
staff
walk-in
```

---

# 41. NOTIFICATION SYSTEM

Create a separate notification service.

Architecture:

```text
Appointment Event
↓
Notification Service
├── Email
├── WhatsApp
└── PWA Notification
```

Do not tightly couple appointment logic to one notification provider.

---

# 42. APPOINTMENT CONFIRMATION

After successful booking:

Customer should receive confirmation through available channels.

Information:

- Salon
- Service
- Date
- Time
- Staff
- Appointment reference
- Manage appointment link

---

# 43. APPOINTMENT REMINDERS

Potential reminders:

- 24 hours before
- 2 hours before

Owner should eventually be able to enable/disable reminders.

Do not send duplicate reminders.

---

# 44. WHATSAPP

Requirement:

Customer should receive WhatsApp appointment confirmation.

However, automated WhatsApp messaging depends on the current WhatsApp Business/API/provider rules and pricing.

For the initial free period:

1. Investigate a genuinely free/low-cost method.
2. Do not silently introduce a paid service.
3. Keep WhatsApp integration replaceable.

Fallback:

Generate a pre-filled WhatsApp message.

Example:

```text
Hi Rahul,

Your appointment at XYZ Salon is confirmed.

Service: Haircut
Date: 10 September
Time: 5:30 PM
Staff: Amit

Thank you.
```

If automated WhatsApp becomes possible within the free/available setup, use it.

If it requires paid messaging, keep it modular so it can be enabled later.

---

# 45. EMAIL

Email should be used for:

- Appointment confirmation if enabled
- Owner reports
- Other important notifications

Use an email provider with a suitable free tier during the initial period where possible.

Provider should be replaceable.

---

# 46. OWNER EXCEL REPORT

Owner-only feature:

```text
[Send Today's Excel Report]
```

When clicked:

1. Get today's data from Firestore.
2. Generate XLSX.
3. Create workbook.
4. Send it to registered owner email.
5. Show success/failure.

Only owner should be able to execute this function.

Backend authorization is required.

---

# 47. EXCEL STRUCTURE

Workbook:

### Sheet 1 — Daily Summary

- Date
- Total appointments
- Completed
- Cancelled
- No-show
- Revenue

### Sheet 2 — Appointments

- Date
- Time
- Customer
- Phone
- Service
- Staff
- Amount
- Status
- Booking source

### Sheet 3 — Customers

- Name
- Phone
- Email
- Total visits
- Total spending
- Last visit

### Sheet 4 — Billing

- Invoice number
- Customer
- Services
- Subtotal
- Discount
- Tax
- Total
- Payment method

### Sheet 5 — Staff

- Staff
- Appointments
- Completed
- Revenue

---

# 48. EXCEL DOWNLOAD

Owner should also have:

```text
[Download Today's Excel]
```

Optional future:

- Date range
- Monthly export
- Custom report

---

# 49. GOOGLE SHEETS

Google Sheets is an integration, not the database.

Architecture:

```text
Firestore
↓
Google Sheets
```

Owner should eventually be able to:

- Connect Google account
- Select/create salon spreadsheet
- Sync data
- Open spreadsheet
- Sync manually

Potential:

```text
[Connect Google Sheets]
```

After connection:

```text
Google Sheets Connected ✓

[Open Sheet]
[Sync Now]
```

---

# 50. GOOGLE SHEETS SYNC

Recommended tabs:

- Appointments
- Customers
- Billing
- Staff
- Daily Summary

Firestore remains the source of truth.

Google Sheets should not be used to directly modify critical data in V1.

Start with one-way:

Firestore → Google Sheets

Two-way sync can be considered later.

---

# 51. PWA

The PWA should provide the same customer website experience.

Public:

- Home
- Services
- About
- Gallery
- Offers
- Salon info
- Contact
- Booking

Logged in:

- Account
- Appointments
- Bills
- Offers
- Notifications

PWA should be:

- Installable
- Responsive
- Mobile optimized
- Fast
- Offline-aware where practical

Do not make offline mode create appointments.

Appointment creation requires online backend validation.

---

# 52. MOBILE PERFORMANCE

Important:

- Optimize images
- Lazy load gallery
- Minimize unnecessary JavaScript
- Keep hero animation lightweight
- Optimize Firebase reads
- Avoid unnecessary real-time listeners
- Use pagination for large customer/appointment lists

---

# 53. FIREBASE AUTH

Use Firebase Authentication for:

- Owner
- Staff
- Registered Customers

Guest customers do not require Firebase Auth.

Use role-based access.

Possible role:

```text
owner
staff
customer
```

Role should be securely enforced.

Do not rely only on frontend role checks.

---

# 54. FIRESTORE

Suggested collections:

```text
salons
customers
staff
services
appointments
invoices
invoiceItems
payments
offers
notifications
settings
integrations
```

All relevant records should contain:

```text
salonId
```

This allows future multi-salon support.

---

# 55. MULTI-SALON PREPARATION

Current project may be for one salon.

Still include:

```text
salonId
```

on relevant records.

Do not build a complete multi-tenant SaaS system yet.

Simply avoid architecture that prevents future expansion.

---

# 56. SECURITY RULES

Critical.

Customer:

- Can access only their own customer data
- Can access only their own authenticated account data

Staff:

- Can access only authorized salon/staff data

Owner:

- Full access to their salon

Guest:

- Must NOT receive unrestricted Firestore access

Guest booking should use controlled backend/server-side logic where appropriate.

---

# 57. OWNER-ONLY EXCEL SECURITY

Do not simply hide the Excel button from customers/staff.

The backend must verify owner authorization.

Unauthorized request:

```text
403 / Permission Denied
```

---

# 58. DATA VALIDATION

Validate:

- Phone number
- Email
- Service IDs
- Staff IDs
- Date
- Time
- Appointment duration
- Price
- Discount
- Payment values

Never trust values sent by the browser.

---

# 59. AUDIT LOG

Future/optional but recommended.

Record important owner actions:

- Appointment changed
- Appointment cancelled
- Invoice changed
- Staff changed
- Service price changed
- Offer changed

This becomes valuable when multiple staff use the system.

Not required for initial MVP unless easy to implement.

---

# 60. SETTINGS

Owner settings should include:

## Salon

- Name
- Logo
- Address
- Phone
- Email
- Opening hours

## Booking

- Booking enabled
- Advance booking limit
- Cancellation policy
- Rescheduling policy

## Notifications

- Email
- WhatsApp
- PWA notifications

## Reports

- Registered owner email
- Google Sheets connection

---

# 61. DATA BACKUP

Do not rely only on the owner's Excel email as backup.

Firestore is the primary database.

Excel is a reporting/export feature.

Consider automated database backup as a future production requirement.

---

# 62. FREE-FIRST REQUIREMENT

For the initial period:

The salon owner should not be charged for using the software.

Do not implement subscription billing initially.

However, external services may have their own limits/costs.

Before adding a service that creates recurring charges:

Tell me:

1. What service is needed?
2. Why is it needed?
3. Is there a free tier?
4. What is the free limit?
5. What happens after the limit?
6. Is there a free alternative?

Do not silently introduce paid services.

---

# 63. FUTURE SUBSCRIPTION

Keep the architecture ready for:

```text
plan
subscriptionStatus
trialStartDate
trialEndDate
```

Possible future:

```text
Free Trial
↓
Salon Pro
↓
Premium
```

Do not build subscription billing in V1.

---

# 64. PAYMENT GATEWAY

Optional.

Do not make it a dependency for V1.

Manual payments:

- Cash
- UPI
- Card

Online gateway can be added later.

Future requirements:

- Success
- Failure
- Refund
- Webhooks
- Payment status
- Reconciliation

---

# 65. REPORTING

Owner reports:

- Daily appointments
- Completed
- Cancelled
- No-show
- Revenue
- Staff performance
- Service performance
- Customer statistics

Start simple.

Do not build complex analytics before the basic system works.

---

# 66. SEARCH

Owner should be able to search customers by:

- Name
- Phone

Appointments can be filtered by:

- Date
- Staff
- Status
- Customer

---

# 67. PAGINATION

Do not load every customer/appointment record at once.

Use pagination or appropriate Firestore query strategies for larger datasets.

---

# 68. TIMEZONE

Salon appointments must use the salon's local timezone.

Do not rely blindly on the customer's device timezone.

Store timestamps consistently and display them in salon timezone.

---

# 69. TIME SLOT EDGE CASES

Handle:

- Salon closed
- Staff on leave
- Staff break
- Existing appointment
- Appointment duration longer than remaining working time
- Multiple services
- Past dates
- Past times
- Same-time booking race condition

---

# 70. APPOINTMENT PRICE

When appointment is booked, record the applicable price.

When invoice is created, record final actual price.

Historical invoices must never change because service pricing changes later.

---

# 71. DEVELOPMENT PHASES

## PHASE 0 — AUDIT

No major coding.

Deliver:

- Architecture audit
- Firebase review
- Firestore review
- Auth review
- Security review
- Reuse/rewrite recommendation

---

## PHASE 1 — FOUNDATION

- Firebase architecture
- Roles
- Owner
- Staff
- Customer
- Firestore structure
- Security rules
- Services
- Staff
- Salon settings

---

## PHASE 2 — CUSTOMER WEBSITE

- Home
- Hero
- Services
- About
- Gallery
- Offers
- Salon info
- Contact
- Responsive design
- PWA

---

## PHASE 3 — GUEST BOOKING

- Service selection
- Multiple services
- Staff selection
- Any available staff
- Date
- Availability
- Customer details
- Appointment
- Double booking protection
- Secure booking link
- Booking retrieval

---

## PHASE 4 — OWNER + STAFF

- Dashboard
- Appointment calendar
- Appointment management
- Manual bookings
- Staff dashboard
- Working hours
- Leave/availability
- Appointment status

---

## PHASE 5 — CUSTOMER ACCOUNT + CRM

- Firebase customer authentication
- Guest-to-account linking
- Profile
- History
- Customer CRM
- Offers
- Bills

---

## PHASE 6 — BILLING

- Invoice
- Invoice numbering
- Payment recording
- PDF
- Print
- Customer bill access
- Price history

---

## PHASE 7 — NOTIFICATIONS

- PWA
- Email
- WhatsApp
- Confirmation
- Reminder
- Cancellation/reschedule

---

## PHASE 8 — REPORTS

- Dashboard reports
- Daily summary
- Excel generation
- Excel download
- Email Excel

---

## PHASE 9 — GOOGLE SHEETS

- Google OAuth
- Connect sheet
- Create/select spreadsheet
- Sync
- Open sheet
- One-way Firestore → Sheets

---

## PHASE 10 — OPTIONAL FEATURES

- Payment gateway
- Loyalty
- Rewards
- Advanced CRM
- Marketing automation
- Advanced analytics
- Audit logs
- Automated database backup

---

# 72. TESTING

Every phase must be tested before moving forward.

## Customer

Test:

- Website without login
- Services
- Guest booking
- Multiple services
- Staff selection
- Any available staff
- Availability
- Booking confirmation
- Secure booking link
- Cancellation
- Rescheduling
- Account creation
- Guest → registered customer linking
- History

## Owner

Test:

- Login
- Dashboard
- Appointments
- Customers
- Staff
- Services
- Billing
- Reports
- Excel
- Email
- Google Sheets

## Staff

Test:

- Login
- Appointments
- Customer details
- Completion
- No-show
- Billing permission

## Security

Test:

- Guest cannot access owner dashboard
- Customer cannot access owner dashboard
- Staff cannot access owner-only features
- Customer cannot access another customer
- Guest cannot access arbitrary appointments
- Unauthorized Excel request denied
- Unauthorized Firestore access denied

## Booking

Test:

- Double booking
- Simultaneous booking
- Staff leave
- Staff break
- Closed salon
- Multiple service duration
- Past time
- Invalid service
- Invalid staff
- Rescheduling

---

# 73. DEVELOPMENT RULES

Do not build the entire system at once.

Each phase must be functional.

After each phase provide:

1. What was changed
2. Files/components changed
3. Database changes
4. Firebase changes
5. Security rule changes
6. APIs/functions added
7. How to test
8. Known issues

Do not silently modify unrelated features.

Do not delete existing functionality without approval.

---

# 74. FINAL CUSTOMER EXPERIENCE

```text
Customer opens website
↓
Professional salon homepage
↓
Explore services/about/gallery/offers/info
↓
Book Appointment
↓
Select service(s)
↓
Select staff or any available
↓
Select date
↓
Select available time
↓
Enter name + phone
↓
Confirm
↓
Appointment created
↓
Confirmation
↓
Secure booking link
↓
Optional account creation
↓
Future bookings/history/offers/bills
```

---

# 75. FINAL OWNER EXPERIENCE

```text
Owner Login
↓
Dashboard
↓
Today's appointments
↓
Staff
↓
Customers
↓
Services
↓
Billing
↓
Reports
↓
Excel
↓
Email
↓
Google Sheets
```

---

# 76. FINAL STAFF EXPERIENCE

```text
Staff Login
↓
Today's appointments
↓
Customer/service information
↓
Complete appointment
↓
No-show if applicable
↓
Billing if authorized
```

---

# 77. SUCCESS CRITERIA

The system is successful when:

- Customer can explore the salon without login.
- Customer can book without account creation.
- Guest customer becomes part of CRM.
- Guest can later create account without losing history.
- Double bookings are prevented.
- Owner sees website bookings immediately.
- Staff sees authorized appointments.
- Owner can create manual/walk-in bookings.
- Billing works.
- Historical invoices remain correct.
- Customer history works.
- Offers work.
- Notifications work through available channels.
- Owner can generate Excel.
- Owner can email Excel.
- Google Sheets can be connected/synced.
- Security rules prevent unauthorized access.
- PWA works on mobile.
- Core software remains free during the initial free period.
- Future paid plans can be added without rebuilding the core system.