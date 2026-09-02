# University Management System — Prisma Database Architecture

## 1. Overview

This document describes the Prisma database architecture for the University Management System (UMS).

The database follows a **Role-Based Access Control (RBAC)** architecture where:

* Every user has exactly **one role**.
* Common authentication and account information is stored in the `User` table.
* Role-specific information is stored in separate profile tables.
* User permissions are stored directly in `User.permissions`.
* `SUPER_ADMIN` controls customizable permissions for `ADMIN`.
* Other roles receive application-defined default permissions.
* Authorization is enforced on the backend.

---

# 2. User and Profile Architecture

The system separates common user information from role-specific information.

```text
                         ┌─────────────────────┐
                         │        User         │
                         │─────────────────────│
                         │ id                  │
                         │ name                │
                         │ email               │
                         │ password            │
                         │ googleId            │
                         │ authProvider        │
                         │ emailVerified       │
                         │ role                │
                         │ permissions[]       │
                         │ isActive            │
                         │ needPasswordChange  │
                         │ isDeleted            │
                         │ deletedAt            │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
        StudentProfile     InstructorProfile    AdminProfile
                 
                 │                  │
                 ▼                  ▼
       DepartmentHeadProfile   AccountantProfile

                         │
                         ▼
                 SuperAdminProfile
```

Each user must have exactly one application role.

---

# 3. Role → Profile Mapping

| Role              | Profile Table           | Required |
| ----------------- | ----------------------- | -------- |
| `SUPER_ADMIN`     | `SuperAdminProfile`     | Yes      |
| `ADMIN`           | `AdminProfile`          | Yes      |
| `DEPARTMENT_HEAD` | `DepartmentHeadProfile` | Yes      |
| `INSTRUCTOR`      | `InstructorProfile`     | Yes      |
| `STUDENT`         | `StudentProfile`        | Yes      |
| `ACCOUNTANT`      | `AccountantProfile`     | Yes      |

The database uses one-to-one relationships between `User` and each possible profile.

However, Prisma cannot directly enforce:

```text
User.role = STUDENT
        ↓
StudentProfile must exist
        ↓
All other role profiles must not exist
```

Therefore this invariant must be enforced by the application/service layer.

---

# 4. User Table

The `User` table contains only common account, authentication, authorization, and account lifecycle information.

```prisma
model User {
  id                 String       @id @default(uuid())
  name               String
  email              String       @unique
  password           String?
  googleId           String?      @unique
  authProvider       AuthProvider @default(CREDENTIAL)
  emailVerified      Boolean      @default(false)

  role               Role         @default(STUDENT)
  permissions        Permission[]

  isActive           Boolean      @default(true)
  needPasswordChange Boolean      @default(false)
  isDeleted          Boolean      @default(false)
  deletedAt          DateTime?

  studentProfile        StudentProfile?
  instructorProfile     InstructorProfile?
  departmentHeadProfile DepartmentHeadProfile?
  accountantProfile     AccountantProfile?
  adminProfile          AdminProfile?
  superAdminProfile     SuperAdminProfile?

  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  @@index([role])
  @@index([isActive])
  @@index([isDeleted])
  @@map("users")
}
```

## Field Explanation

### `id`

```text
String @id @default(uuid())
```

Unique identifier for every user.

UUID is recommended because it avoids predictable sequential IDs.

---

### `name`

Stores the user's common/full name.

Example:

```text
Ayan Sujon
```

---

### `email`

Unique login identifier.

```prisma
email String @unique
```

Two users cannot have the same email address.

---

### `password`

Stores the **hashed password**.

It is nullable because users authenticated through Google may not have a credential password.

Never store a plaintext password.

---

### `googleId`

Stores the user's Google account identifier.

```prisma
googleId String? @unique
```

It remains nullable for normal credential-based users.

---

### `authProvider`

Identifies the authentication mechanism.

```text
CREDENTIAL
GOOGLE
```

---

### `emailVerified`

Indicates whether the user's email has been verified.

---

### `role`

Every user has exactly one role.

```prisma
role Role @default(STUDENT)
```

Example:

```text
SUPER_ADMIN
ADMIN
DEPARTMENT_HEAD
INSTRUCTOR
STUDENT
ACCOUNTANT
```

There should be no `UserRole` many-to-many table for this architecture.

---

### `permissions`

Stores resource/action permissions directly on the user.

```prisma
permissions Permission[]
```

Example:

```text
STUDENT_READ
STUDENT_UPDATE
COURSE_READ
RESULT_READ
```

Permissions are separate from roles.

The role identifies **who the user is**.

Permissions identify **what the user can do**.

---

### `isActive`

Controls whether the account is currently allowed to access the system.

```text
true  → active
false → disabled
```

---

### `needPasswordChange`

Useful for newly created accounts.

For example, an administrator creates a user with a temporary password:

```text
User created
      ↓
Temporary password
      ↓
needPasswordChange = true
      ↓
User logs in
      ↓
Must change password
```

---

### `isDeleted` and `deletedAt`

The system should preferably use soft deletion.

Instead of permanently deleting:

```text
User
```

mark the account as:

```text
isDeleted = true
deletedAt = current timestamp
```

This preserves academic, financial, and audit history.

---

# 5. Student Profile

`StudentProfile` contains student-specific information.

Typical fields:

```text
studentId
registrationNo
departmentId
programId
currentSemesterId
dateOfBirth
gender
phone
address
guardianName
guardianPhone
admissionDate
status
```

Important relationships:

```text
StudentProfile
      │
      ├── User
      ├── Department
      ├── Program
      └── Semester
```

A student should not store these fields directly inside `User`.

---

# 6. Instructor Profile

`InstructorProfile` contains instructor-specific information.

Typical fields:

```text
employeeId
departmentId
designation
employmentType
joiningDate
phone
officeRoom
specialization
qualification
status
```

Relationships:

```text
InstructorProfile
        │
        ├── User
        └── Department
```

Course teaching assignments should be modeled separately rather than putting course IDs directly into the instructor profile.

---

# 7. Department Head Profile

`DepartmentHeadProfile` represents the user responsible for a department.

Important fields:

```text
employeeId
departmentId
designation
appointedAt
termEndsAt
officeRoom
phone
```

Relationship:

```text
DepartmentHeadProfile
          │
          ├── User
          └── Department
```

`departmentId` can be unique if the system requires one current department head per department.

If the university requires historical department-head assignments, use a separate assignment/history model instead.

---

# 8. Accountant Profile

`AccountantProfile` contains finance-office employee information.

Typical fields:

```text
employeeId
departmentId
designation
joiningDate
phone
officeRoom
status
```

`departmentId` is optional because an accountant may be responsible for university-wide financial operations.

---

# 9. Admin Profile

`AdminProfile` contains administrative identity information.

Typical fields:

```text
employeeId
departmentId
designation
phone
officeRoom
```

The important distinction is:

```text
AdminProfile
    ↓
Identity / organizational information

User.permissions
    ↓
Authorization
```

Admin permissions should **not** be stored inside `AdminProfile`.

---

# 10. Super Admin Profile

`SuperAdminProfile` contains optional organizational/contact information for the highest-level administrator.

Typical fields:

```text
employeeId
designation
phone
officeRoom
```

The `SUPER_ADMIN` role has the highest authorization level in this architecture.

---

# 11. Permission Architecture

The system uses:

```text
Role
+
User.permissions
+
Scope
+
Business Rules
```

Authorization should not depend only on the role.

For example:

```text
INSTRUCTOR
+
RESULT_CREATE
+
Own assigned course
+
Valid result state
=
Allowed
```

While:

```text
INSTRUCTOR
+
RESULT_CREATE
+
Another instructor's course
=
Denied
```

---

# 12. Authorization Flow

The backend should follow this sequence:

```text
Request
  ↓
Authentication
  ↓
Is User Active?
  ↓
Is User Deleted?
  ↓
Identify Role
  ↓
Check Permission
  ↓
Check Scope
  ↓
Check Business Rules
  ↓
Check Resource State
  ↓
ALLOW / DENY
```

The frontend may hide buttons based on permissions, but the backend must always perform the real authorization check.

---

# 13. Admin Permission **Governance**

This is one of the most important rules of the system.

## SUPER_ADMIN

`SUPER_ADMIN` can:

```text
Create ADMIN
Read ADMIN
Update ADMIN
Read ADMIN permissions
Modify ADMIN permissions
```

## ADMIN

`ADMIN` can:

```text
Create another ADMIN
```

But when an ADMIN creates another ADMIN:

```text
ADMIN
  ↓
Create ADMIN
  ↓
DEFAULT_ADMIN_PERMISSIONS
  ↓
New ADMIN
```

The creating admin cannot submit custom permissions.

### Correct

```ts
await prisma.user.create({
  data: {
    name: input.name,
    email: input.email,
    role: "ADMIN",
    permissions: DEFAULT_ADMIN_PERMISSIONS,
  },
});
```

### Incorrect

```ts
await prisma.user.create({
  data: {
    name: input.name,
    email: input.email,
    role: "ADMIN",
    permissions: input.permissions,
  },
});
```

An ADMIN must never be able to use client-provided permissions to escalate another ADMIN.

---

# 14. Default Permissions

Recommended permission constants:

```text
DEFAULT_SUPER_ADMIN_PERMISSIONS
DEFAULT_ADMIN_PERMISSIONS
DEFAULT_DEPARTMENT_HEAD_PERMISSIONS
DEFAULT_INSTRUCTOR_PERMISSIONS
DEFAULT_STUDENT_PERMISSIONS
DEFAULT_ACCOUNTANT_PERMISSIONS
```

These should be maintained in application code.

Example:

```ts
export const DEFAULT_ADMIN_PERMISSIONS: Permission[] = [
  Permission.USER_READ,
  Permission.USER_CREATE,
  Permission.STUDENT_READ,
  Permission.STUDENT_CREATE,
  Permission.STUDENT_UPDATE,
  Permission.INSTRUCTOR_READ,
  Permission.COURSE_READ,
  Permission.ENROLLMENT_READ,
];
```

The exact default set can evolve according to university policy.

---

# 15. Department Scope

Department-level roles must be restricted by `departmentId`.

Example:

```text
DEPARTMENT_HEAD
        ↓
departmentId = CSE
        ↓
Can manage CSE resources
        ↓
Cannot manage EEE resources
```

Permission alone is not enough.

The backend should check:

```ts
user.departmentId === resource.departmentId
```

or derive the department through the user's role-specific profile.

---

# 16. Student Scope

Students should normally have self-access.

Example:

```text
STUDENT
   ↓
STUDENT_READ
   ↓
Own StudentProfile
   ↓
Allowed
```

But:

```text
STUDENT
   ↓
STUDENT_READ
   ↓
Another student's profile
   ↓
Denied
```

Ownership must be checked on the backend.

---

# 17. Instructor Scope

Instructor access should be restricted to assigned courses.

Recommended relationship:

```text
InstructorProfile
       │
       ▼
CourseInstructor
       │
       ▼
Course
```

This allows the backend to verify:

```text
Is this instructor assigned to this course?
```

before allowing attendance, assignments, grades, or results operations.

---

# 18. Profile Creation

User and profile creation should happen inside a transaction.

Example:

```ts
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      name,
      email,
      password,
      role: "STUDENT",
      permissions: DEFAULT_STUDENT_PERMISSIONS,
    },
  });

  await tx.studentProfile.create({
    data: {
      userId: user.id,
      studentId,
      registrationNo,
      departmentId,
      programId,
    },
  });

  return user;
});
```

This prevents a situation where:

```text
User created
     ↓
Profile creation fails
     ↓
User exists without required profile
```

---

# 19. Role Change

Changing a user's role should be treated as a sensitive operation.

For example:

```text
STUDENT
   ↓
INSTRUCTOR
```

should not simply execute:

```ts
user.role = "INSTRUCTOR";
```

Instead:

```text
Validate role change
        ↓
Archive/remove old profile
        ↓
Create new profile
        ↓
Assign new default permissions
        ↓
Update role
        ↓
Create audit record
        ↓
Commit transaction
```

---

# 20. Authentication Rules

## Credential Authentication

For:

```text
authProvider = CREDENTIAL
```

the application should require a password hash.

```text
password != null
```

## Google Authentication

For:

```text
authProvider = GOOGLE
```

the application should normally require:

```text
googleId != null
```

These are application/service-layer validations.

---

# 21. Soft Delete Rules

User deletion should normally be implemented as:

```ts
await prisma.user.update({
  where: { id },
  data: {
    isDeleted: true,
    isActive: false,
    deletedAt: new Date(),
  },
});
```

Authentication queries should reject:

```text
isDeleted = true
```

or:

```text
isActive = false
```

Do not permanently delete users whose historical records are required for:

* academic history
* payment history
* result history
* audit logs
* financial transactions

---

# 22. Recommended Database Relationship Structure

The overall architecture should eventually look like:

```text
User
 │
 ├── StudentProfile
 │      ├── Department
 │      ├── Program
 │      └── Semester
 │
 ├── InstructorProfile
 │      └── Department
 │
 ├── DepartmentHeadProfile
 │      └── Department
 │
 ├── AccountantProfile
 │      └── Department
 │
 ├── AdminProfile
 │      └── Department
 │
 └── SuperAdminProfile


Department
 │
 ├── Programs
 ├── Students
 ├── Instructors
 ├── Courses
 └── Department Head


Program
 │
 └── Students


Course
 │
 ├── Subject
 ├── Instructor(s)
 ├── Schedule
 ├── Enrollment
 ├── Assignment
 ├── Exam
 └── Result
```

---

# 23. Prisma File Organization

Keep the Prisma schema modular.

Recommended structure:

```text
prisma/
│
├── schema.prisma
├── enums.prisma
│
└── models/
    ├── user.prisma
    ├── profiles.prisma
    ├── academic.prisma
    ├── course.prisma
    ├── enrollment.prisma
    ├── attendance.prisma
    ├── assignment.prisma
    ├── exam.prisma
    ├── result.prisma
    ├── finance.prisma
    ├── communication.prisma
    └── audit.prisma
```

### `schema.prisma`

Contains:

```text
generator
datasource
```

### `enums.prisma`

Contains all enums:

```text
Role
Permission
AuthProvider
Gender
Status enums
Academic enums
Financial enums
etc.
```

### `models/user.prisma`

Contains:

```text
User
```

### `models/profiles.prisma`

Contains:

```text
StudentProfile
InstructorProfile
DepartmentHeadProfile
AccountantProfile
AdminProfile
SuperAdminProfile
```

Other domain models should remain separated by business domain.

---

# 24. Required vs Optional Fields

A field should be required when the system cannot function correctly without it.

Examples:

### User

Required:

```text
id
name
email
role
isActive
isDeleted
createdAt
updatedAt
```

Optional:

```text
password
googleId
deletedAt
```

### StudentProfile

Required:

```text
userId
studentId
registrationNo
departmentId
```

Optional:

```text
programId
currentSemesterId
dateOfBirth
gender
phone
address
guardianName
guardianPhone
admissionDate
```

### InstructorProfile

Required:

```text
userId
employeeId
departmentId
designation
```

Optional:

```text
joiningDate
phone
officeRoom
specialization
qualification
```

---

# 25. Database Constraints

Use database constraints whenever possible.

Examples:

```prisma
email String @unique
googleId String? @unique
userId String @unique
studentId String @unique
registrationNo String @unique
employeeId String @unique
```

These prevent duplicate identities.

Use indexes for frequently filtered fields:

```prisma
@@index([role])
@@index([isActive])
@@index([isDeleted])
@@index([departmentId])
```

---

# 26. Important Security Rules

Never trust these values directly from the frontend:

```text
role
permissions
userId
departmentId
ownerId
```

The backend should derive sensitive authorization information from the authenticated user and database.

For example, do not allow:

```json
{
  "role": "SUPER_ADMIN"
}
```

from a normal user request to determine authorization.

---

# 27. Audit Sensitive Actions

The following operations should be audited:

```text
Role changes
Permission changes
Admin creation
User suspension
User restoration
User deletion
Result approval
Result publication
Payment verification
Payment refund
Financial transaction approval
System setting changes
```

Recommended audit information:

```text
actor
action
resource
resourceId
timestamp
result
metadata
IP address
user agent
```

---

# 28. Financial History

Financial records should not be silently overwritten.

Instead of changing historical transactions:

```text
Old Transaction
      ↓
Adjustment / Reversal / Refund
      ↓
New Transaction
```

This provides traceability.

---

# 29. Result Workflow

Recommended academic result workflow:

```text
Instructor
    ↓
Create Result
    ↓
Submit Result
    ↓
Department Head
    ↓
Approve / Reject
    ↓
Authorized Publisher
    ↓
Publish Result
    ↓
Student
    ↓
Read Published Result
```

A student should not be able to read unpublished results.

---

# 30. Payment Workflow

Recommended payment flow:

```text
Student
   ↓
Create Payment Intent
   ↓
Payment Gateway
   ↓
Gateway / Webhook
   ↓
Payment Record
   ↓
Accountant Verification
   ↓
Financial Transaction
```

The frontend redirect should never be treated as the final proof of payment.

The backend should verify payment using the payment provider's trusted response/webhook.

---

# 31. Prisma Commands

After placing the Prisma files correctly:

```bash
npx prisma format
```

Validate:

```bash
npx prisma validate
```

Generate Prisma Client:

```bash
npx prisma generate
```

Create development migration:

```bash
npx prisma migrate dev --name init
```

Deploy migrations:

```bash
npx prisma migrate deploy
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

# 32. Recommended Service Architecture

The backend should separate responsibilities:

```text
Controller
    ↓
Authentication Middleware
    ↓
Authorization Middleware
    ↓
Scope Validation
    ↓
Business Service
    ↓
Prisma
    ↓
PostgreSQL
```

Example:

```ts
authorize(Permission.STUDENT_UPDATE);

assertStudentDepartmentScope(user, student);

return studentService.updateStudent(...);
```

This keeps authorization logic out of controllers and makes it reusable.

---

# 33. Final Architecture Principles

The most important principles are:

1. **One User = One Role**
2. **One Role = One Matching Profile**
3. **User stores common account/auth data**
4. **Profiles store role-specific data**
5. **Permissions are stored in ****`User.permissions`**
6. **SUPER_ADMIN controls ADMIN permission customization**
7. **ADMIN-created ADMIN receives predefined default permissions**
8. **ADMIN cannot customize another ADMIN's permissions**
9. **Backend is the final authority**
10. **Permission checks must be combined with scope checks**
11. **Use soft deletion for users**
12. **Use transactions for User + Profile creation**
13. **Audit sensitive authorization and financial actions**
14. **Do not silently rewrite financial history**
15. **Do not trust role/permission values from the client**
16. **Keep Prisma models organized by business domain**
17. **Keep enums in a separate ****`enums.prisma`**** file**

---

# 34. Recommended Next Step

After completing the User/Profile foundation, the next schema layer should be implemented in this order:

```text
1. User + Profiles
        ↓
2. Department
        ↓
3. Program
        ↓
4. Subject
        ↓
5. Academic Session
        ↓
6. Semester
        ↓
7. Course
        ↓
8. Course Instructor
        ↓
9. Student Enrollment
        ↓
10. Attendance
        ↓
11. Assignment
        ↓
12. Exam
        ↓
13. Grade / Result
        ↓
14. Invoice / Payment
        ↓
15. Scholarship
        ↓
16. Financial Transaction
        ↓
17. Notice / Event
        ↓
18. Audit Log
        ↓
19. System Settings
```

This order minimizes relationship problems and provides a clean foundation for implementing the University Management System.
