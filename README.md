# CampusFlow-API
ERD: https://drawsql.app/teams/ayansujon/diagrams/campusflow-university-management-system-erd


# University Management System — Prisma Database Architecture

## Overview

This Prisma schema is designed for a University Management System with a role-based access control architecture.

The system contains six primary roles:

* `SUPER_ADMIN`
* `ADMIN`
* `DEPARTMENT_HEAD`
* `INSTRUCTOR`
* `STUDENT`
* `ACCOUNTANT`

The database separates:

1. Authentication/account data
2. Role data
3. Role-specific profile data
4. Academic data
5. Course and enrollment data
6. Attendance and assignment data
7. Examination and result data
8. Financial data
9. Communication data
10. Audit and system configuration data

---

# 1. Core User Architecture

The `User` table contains common account and authentication information.

```text
User
│
├── StudentProfile
├── InstructorProfile
├── DepartmentHeadProfile
├── AccountantProfile
├── AdminProfile
└── SuperAdminProfile
```

A user must have exactly one role.

```text
User.role
   │
   ├── STUDENT         → StudentProfile
   ├── INSTRUCTOR      → InstructorProfile
   ├── DEPARTMENT_HEAD → DepartmentHeadProfile
   ├── ACCOUNTANT      → AccountantProfile
   ├── ADMIN           → AdminProfile
   └── SUPER_ADMIN     → SuperAdminProfile
```

Prisma can enforce each profile's `userId` as unique, but Prisma cannot automatically enforce that the selected profile exactly matches `User.role`.

Therefore, role/profile consistency must be enforced by the service layer.

---

# 2. User Table Responsibilities

The `User` table should contain only common information.

### Authentication

* email
* password
* Google ID
* authentication provider
* email verification

### Authorization

* role
* permissions

### Account lifecycle

* active/inactive state
* password-change requirement
* soft deletion

### Timestamps

* createdAt
* updatedAt

Role-specific academic or employee fields should not be added to `User`.

---

# 3. Role-Based Profiles

## STUDENT

Uses:

```text
StudentProfile
```

Contains:

* student ID
* registration number
* department
* program
* semester
* admission information
* guardian information
* student status

---

## INSTRUCTOR

Uses:

```text
InstructorProfile
```

Contains:

* employee ID
* department
* designation
* employment type
* specialization
* qualification
* joining date
* office information

---

## DEPARTMENT_HEAD

Uses:

```text
DepartmentHeadProfile
```

Contains:

* employee ID
* department
* appointment period
* designation
* office/contact information

---

## ACCOUNTANT

Uses:

```text
AccountantProfile
```

Contains:

* employee ID
* department
* designation
* joining date
* office information
* accountant status

---

## ADMIN

Uses:

```text
AdminProfile
```

Contains administrative employee information.

Permissions are stored in:

```text
User.permissions
```

The profile itself does not control authorization.

---

## SUPER_ADMIN

Uses:

```text
SuperAdminProfile
```

Contains top-level administrative employee information.

---

# 4. Permission Architecture

Permissions are stored directly on the user:

```prisma
permissions Permission[]
```

There is intentionally no:

```text
UserRole
```

and no:

```text
RolePermission
```

join table.

The system uses:

```text
User
 ├── role
 └── permissions[]
```

---

# 5. Authorization Flow

Every protected request should follow:

```text
Authentication
      ↓
User exists
      ↓
User is active
      ↓
User is not deleted
      ↓
Role check
      ↓
Permission check
      ↓
Scope check
      ↓
Business rule check
      ↓
Resource state check
      ↓
ALLOW / DENY
```

The backend must be the authoritative authorization layer.

Frontend permission checks are only for UI/UX.

---

# 6. Admin Permission Governance

The system follows these rules:

### SUPER_ADMIN

Can:

* create ADMIN
* read ADMIN
* read ADMIN permissions
* update ADMIN permissions

### ADMIN

Can:

* create another ADMIN
* use the permissions assigned to itself

But an ADMIN cannot:

* customize another ADMIN's permissions
* grant permissions to another ADMIN
* revoke permissions from another ADMIN
* submit arbitrary permissions when creating another ADMIN

---

# 7. ADMIN Creation Rule

When an ADMIN creates another ADMIN:

```text
ADMIN
  ↓
Create ADMIN
  ↓
DEFAULT_ADMIN_PERMISSIONS
  ↓
Create AdminProfile
```

The creating admin must not send custom permissions.

Bad:

```ts
permissions: input.permissions
```

Correct:

```ts
permissions: DEFAULT_ADMIN_PERMISSIONS
```

Only `SUPER_ADMIN` can later customize the new ADMIN's permissions.

---

# 8. Role/Profile Creation

Create role and profile inside a transaction.

Example:

```ts
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
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

This prevents a user from being created without its required profile.

---

# 9. Authentication Rules

## Credential Authentication

For:

```text
authProvider = CREDENTIAL
```

the service should require a password.

The database should contain a password hash, never the raw password.

---

## Google Authentication

For:

```text
authProvider = GOOGLE
```

the service should normally require:

```text
googleId
```

The password may remain null.

These conditional requirements should be validated in the application layer.

---

# 10. Department Scope

Department-specific resources must be protected using `departmentId`.

Example:

```text
DEPARTMENT_HEAD
       ↓
Department A
       ↓
Can manage Department A
       ↓
Cannot manage Department B
```

Do not rely only on:

```ts
role === "DEPARTMENT_HEAD"
```

Also verify:

```text
user's departmentId === resource.departmentId
```

---

# 11. Instructor Course Scope

Instructor access to course data should be validated through:

```text
CourseInstructor
```

Example:

```text
Instructor
    ↓
CourseInstructor
    ↓
Course
```

An instructor should only modify attendance, assignment, exam, grade, or result data for courses they are assigned to.

---

# 12. Student Ownership Scope

Students should normally only access their own records.

Example:

```text
Student A
   ↓
StudentProfile A
   ↓
Enrollments
   ↓
Results
   ↓
Payments
```

A student should not be able to request another student's private academic or financial data simply by changing an ID in the request.

---

# 13. Result Workflow

The result workflow is:

```text
INSTRUCTOR
    ↓
Create Result
    ↓
Submit Result
    ↓
DEPARTMENT_HEAD
    ↓
Review
    ↓
Approve / Reject
    ↓
Authorized Publisher
    ↓
Publish
    ↓
STUDENT
    ↓
Read Published Result
```

Result status:

```text
DRAFT
SUBMITTED
APPROVED
REJECTED
PUBLISHED
```

---

# 14. Financial Workflow

Payment workflow:

```text
STUDENT
    ↓
Initiate Payment
    ↓
Payment Gateway
    ↓
Webhook / Payment Confirmation
    ↓
ACCOUNTANT
    ↓
Verify / Reconcile
    ↓
Financial Record
```

Financial history should not be silently overwritten.

Use:

```text
ADJUSTMENT
REFUND
REVERSAL
```

when correcting historical financial records.

---

# 15. Soft Delete

Users should normally use soft deletion.

Example:

```ts
await prisma.user.update({
  where: {
    id: userId,
  },
  data: {
    isDeleted: true,
    isActive: false,
    deletedAt: new Date(),
  },
});
```

Authentication should reject:

```text
isDeleted = true
```

or:

```text
isActive = false
```

Do not permanently delete academic or financial history simply because a user account is deactivated.

---

# 16. Main Database Domains

```text
Authentication
     │
     └── User

Role Profiles
     │
     ├── StudentProfile
     ├── InstructorProfile
     ├── DepartmentHeadProfile
     ├── AccountantProfile
     ├── AdminProfile
     └── SuperAdminProfile

Academic
     │
     ├── Department
     ├── Program
     ├── Subject
     ├── AcademicSession
     └── Semester

Course
     │
     ├── Course
     ├── CourseInstructor
     └── ClassSchedule

Student Academic
     │
     ├── StudentEnrollment
     ├── Attendance
     ├── Assignment
     ├── AssignmentSubmission
     ├── Exam
     ├── Grade
     └── Result

Finance
     │
     ├── Invoice
     ├── Payment
     ├── Scholarship
     └── FinancialTransaction

Communication
     │
     ├── Notice
     └── Event

System
     │
     ├── AuditLog
     └── SystemSetting
```

---

# 17. Important Relationships

## User → Profile

```text
User 1 ─── 0..1 StudentProfile
User 1 ─── 0..1 InstructorProfile
User 1 ─── 0..1 DepartmentHeadProfile
User 1 ─── 0..1 AccountantProfile
User 1 ─── 0..1 AdminProfile
User 1 ─── 0..1 SuperAdminProfile
```

The application must guarantee that only the correct profile exists for the selected role.

---

## Department Relationships

```text
Department
 ├── StudentProfile[]
 ├── InstructorProfile[]
 ├── DepartmentHeadProfile
 ├── AccountantProfile[]
 ├── AdminProfile[]
 ├── Program[]
 ├── Subject[]
 └── Course[]
```

---

## Program Relationships

```text
Program
 ├── Department
 ├── StudentProfile[]
 └── Subject[]
```

---

## Course Relationships

```text
Course
 ├── Department
 ├── Subject
 ├── AcademicSession
 ├── Semester
 ├── CourseInstructor[]
 ├── ClassSchedule[]
 ├── StudentEnrollment[]
 ├── Assignment[]
 ├── Exam[]
 ├── Grade[]
 └── Result[]
```

---

# 18. Database Constraints

Important uniqueness rules include:

```text
User.email
User.googleId

StudentProfile.userId
StudentProfile.studentId
StudentProfile.registrationNo

InstructorProfile.userId
InstructorProfile.employeeId

DepartmentHeadProfile.userId
DepartmentHeadProfile.employeeId
DepartmentHeadProfile.departmentId

AccountantProfile.userId
AccountantProfile.employeeId

AdminProfile.userId
SuperAdminProfile.userId

Department.code
Program.code
Subject.code
Course.code
AcademicSession.code
Semester.code

CourseInstructor(courseId, instructorId)

StudentEnrollment(studentId, courseId)

AssignmentSubmission(assignmentId, studentId)

Result(studentId, courseId)
```

---

# 19. Recommended Delete Strategy

Use `onDelete: Cascade` carefully.

Good candidates:

```text
User → Role Profile
Course → CourseInstructor
Course → ClassSchedule
Assignment → AssignmentSubmission
```

Avoid cascading deletion for important academic or financial history.

For example, deleting a course should not automatically destroy historical financial or examination records unless that is explicitly intended by the business rules.

---

# 20. Prisma Commands

Format:

```bash
npx prisma format
```

Validate:

```bash
npx prisma validate
```

Generate client:

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

# 21. Recommended Backend Architecture

Authorization should not be implemented directly inside controllers.

Recommended:

```text
Controller
    ↓
Authentication Middleware
    ↓
Authorization Middleware
    ↓
Scope Validation
    ↓
Service
    ↓
Prisma
    ↓
PostgreSQL
```

Example:

```ts
authorize(Permission.STUDENT_UPDATE);

assertDepartmentScope(
  currentUser,
  student.departmentId
);

return studentService.update(...);
```

---

# 22. Security Rules

Never trust the following values directly from the client:

```text
role
permissions
userId
departmentId
studentId
instructorId
financial ownership
approval status
```

Always derive or validate them on the backend.

---

# 23. Audit Sensitive Actions

The following actions should normally be audited:

* user creation
* user deletion
* user suspension
* role change
* admin permission change
* result submission
* result approval
* result rejection
* result publication
* payment verification
* payment refund
* scholarship approval
* financial transaction approval
* system setting changes

Use:

```text
AuditLog
```

for these actions.

---

# 24. Production Checklist

* [ ] One role per user
* [ ] One matching profile per user
* [ ] User permissions stored in `User.permissions`
* [ ] No `UserRole` table
* [ ] No `RolePermission` table
* [ ] SUPER_ADMIN controls ADMIN permissions
* [ ] ADMIN-created ADMIN receives default permissions
* [ ] ADMIN cannot customize another ADMIN
* [ ] Passwords are hashed
* [ ] Google authentication is validated
* [ ] Soft delete is enabled
* [ ] Backend authorization is authoritative
* [ ] Department scope is validated
* [ ] Instructor course scope is validated
* [ ] Student ownership is validated
* [ ] Financial permissions are separated
* [ ] Result workflow is enforced
* [ ] Sensitive actions are audited
* [ ] Financial history is immutable through normal updates
* [ ] Database indexes are added for frequent filters
* [ ] Transactions are used for multi-table operations
* [ ] Client-supplied role/permission values are not trusted
