from pathlib import Path
import zipfile

root = Path("/mnt/data/university-prisma")
(root / "models").mkdir(parents=True, exist_ok=True)

files = {
"schema.prisma": """generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

"""
,
"enums.prisma": """enum AuthProvider {
  CREDENTIAL
  GOOGLE
}

enum Role {
  SUPER_ADMIN
  ADMIN
  DEPARTMENT_HEAD
  INSTRUCTOR
  STUDENT
  ACCOUNTANT
}

enum Permission {
  USER_READ
  USER_CREATE
  USER_UPDATE
  USER_DELETE
  USER_SUSPEND
  USER_RESTORE

  ADMIN_CREATE
  ADMIN_READ
  ADMIN_PERMISSION_READ
  ADMIN_PERMISSION_UPDATE

  STUDENT_READ
  STUDENT_CREATE
  STUDENT_UPDATE
  STUDENT_DELETE

  INSTRUCTOR_READ
  INSTRUCTOR_CREATE
  INSTRUCTOR_UPDATE
  INSTRUCTOR_DELETE

  DEPARTMENT_READ
  DEPARTMENT_CREATE
  DEPARTMENT_UPDATE
  DEPARTMENT_DELETE

  PROGRAM_READ
  PROGRAM_CREATE
  PROGRAM_UPDATE
  PROGRAM_DELETE

  SUBJECT_READ
  SUBJECT_CREATE
  SUBJECT_UPDATE
  SUBJECT_DELETE

  COURSE_READ
  COURSE_CREATE
  COURSE_UPDATE
  COURSE_DELETE
  COURSE_ASSIGN_INSTRUCTOR

  ACADEMIC_SESSION_READ
  ACADEMIC_SESSION_CREATE
  ACADEMIC_SESSION_UPDATE
  ACADEMIC_SESSION_DELETE

  SEMESTER_READ
  SEMESTER_CREATE
  SEMESTER_UPDATE
  SEMESTER_DELETE

  CLASS_SCHEDULE_READ
  CLASS_SCHEDULE_CREATE
  CLASS_SCHEDULE_UPDATE
  CLASS_SCHEDULE_DELETE

  ENROLLMENT_READ
  ENROLLMENT_CREATE
  ENROLLMENT_UPDATE
  ENROLLMENT_DELETE
  ENROLLMENT_APPROVE

  ATTENDANCE_READ
  ATTENDANCE_CREATE
  ATTENDANCE_UPDATE
  ATTENDANCE_DELETE

  ASSIGNMENT_READ
  ASSIGNMENT_CREATE
  ASSIGNMENT_UPDATE
  ASSIGNMENT_DELETE
  ASSIGNMENT_SUBMIT
  ASSIGNMENT_GRADE

  EXAM_READ
  EXAM_CREATE
  EXAM_UPDATE
  EXAM_DELETE

  GRADE_READ
  GRADE_CREATE
  GRADE_UPDATE
  GRADE_DELETE

  RESULT_READ
  RESULT_CREATE
  RESULT_UPDATE
  RESULT_SUBMIT
  RESULT_APPROVE
  RESULT_REJECT
  RESULT_PUBLISH

  NOTICE_READ
  NOTICE_CREATE
  NOTICE_UPDATE
  NOTICE_DELETE

  EVENT_READ
  EVENT_CREATE
  EVENT_UPDATE
  EVENT_DELETE

  INVOICE_READ
  INVOICE_CREATE
  INVOICE_UPDATE
  INVOICE_DELETE

  PAYMENT_READ
  PAYMENT_CREATE
  PAYMENT_VERIFY
  PAYMENT_REFUND

  SCHOLARSHIP_READ
  SCHOLARSHIP_CREATE
  SCHOLARSHIP_UPDATE
  SCHOLARSHIP_APPROVE
  SCHOLARSHIP_REJECT

  FINANCIAL_TRANSACTION_READ
  FINANCIAL_TRANSACTION_CREATE
  FINANCIAL_TRANSACTION_APPROVE
  FINANCIAL_REPORT_READ

  SYSTEM_SETTING_READ
  SYSTEM_SETTING_UPDATE
  AUDIT_LOG_READ
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum StudentStatus {
  ACTIVE
  INACTIVE
  GRADUATED
  SUSPENDED
  DROPPED
}

enum InstructorStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  SUSPENDED
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  VISITING
}

enum AccountantStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum AcademicSessionStatus {
  UPCOMING
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum SemesterStatus {
  UPCOMING
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum CourseStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum EnrollmentStatus {
  PENDING
  APPROVED
  DROPPED
  COMPLETED
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

enum AssignmentStatus {
  DRAFT
  PUBLISHED
  CLOSED
}

enum SubmissionStatus {
  SUBMITTED
  LATE
  GRADED
  RETURNED
}

enum ExamType {
  MIDTERM
  FINAL
  QUIZ
  CLASS_TEST
  VIVA
  PRACTICAL
}

enum ExamStatus {
  DRAFT
  SCHEDULED
  COMPLETED
  CANCELLED
}

enum ResultStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  PUBLISHED
}

enum InvoiceStatus {
  PENDING
  PARTIAL
  PAID
  OVERDUE
  CANCELLED
}

enum PaymentMethod {
  CASH
  BANK
  CARD
  MOBILE_BANKING
  ONLINE_GATEWAY
}

enum PaymentStatus {
  PENDING
  VERIFIED
  FAILED
  REFUNDED
}

enum ScholarshipType {
  MERIT
  NEED_BASED
  SPORTS
  SPECIAL
}

enum ScholarshipStatus {
  PENDING
  APPROVED
  REJECTED
  ACTIVE
  EXPIRED
}

enum FinancialTransactionType {
  INCOME
  EXPENSE
  ADJUSTMENT
  REFUND
}

enum FinancialTransactionStatus {
  PENDING
  APPROVED
  REJECTED
  REVERSED
}

enum NoticeAudience {
  ALL
  STUDENTS
  INSTRUCTORS
  DEPARTMENT
  STAFF
}

enum PublicationStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum AuditResult {
  SUCCESS
  FAILURE
}
""",
"models/user.prisma": """model User {
  id                 String       @id @default(uuid())
  name               String
  email              String       @unique
  password           String?
  googleId           String?      @unique
  authProvider       AuthProvider @default(CREDENTIAL)
  emailVerified      Boolean      @default(false)

  role               Role         @default(STUDENT)
  permissions        Permission[]

  isActive            Boolean     @default(true)
  needPasswordChange  Boolean     @default(false)
  isDeleted           Boolean     @default(false)
  deletedAt           DateTime?

  studentProfile        StudentProfile?
  instructorProfile     InstructorProfile?
  departmentHeadProfile DepartmentHeadProfile?
  accountantProfile     AccountantProfile?
  adminProfile          AdminProfile?
  superAdminProfile     SuperAdminProfile?

  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  @@index([role])
  @@index([isActive])
  @@index([isDeleted])
  @@map("users")
}
""",
"models/profiles.prisma": """model StudentProfile {
  id                String        @id @default(uuid())
  userId            String        @unique
  studentId         String        @unique
  registrationNo    String        @unique
  departmentId      String
  programId         String?
  currentSemesterId String?

  dateOfBirth       DateTime?
  gender            Gender?
  phone             String?
  address           String?
  guardianName      String?
  guardianPhone     String?
  admissionDate     DateTime?
  status            StudentStatus @default(ACTIVE)

  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  department        Department    @relation(fields: [departmentId], references: [id])
  program           Program?      @relation(fields: [programId], references: [id])
  currentSemester   Semester?     @relation(fields: [currentSemesterId], references: [id])

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([departmentId])
  @@index([programId])
  @@map("student_profiles")
}

model InstructorProfile {
  id             String           @id @default(uuid())
  userId         String           @unique
  employeeId     String           @unique
  departmentId   String
  designation    String
  employmentType EmploymentType   @default(FULL_TIME)
  joiningDate    DateTime?
  phone          String?
  officeRoom     String?
  specialization String?
  qualification  String?
  status         InstructorStatus @default(ACTIVE)

  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  department     Department       @relation(fields: [departmentId], references: [id])

  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  @@index([departmentId])
  @@map("instructor_profiles")
}

model DepartmentHeadProfile {
  id           String   @id @default(uuid())
  userId       String   @unique
  employeeId   String   @unique
  departmentId String   @unique
  designation  String?
  appointedAt  DateTime?
  termEndsAt   DateTime?
  officeRoom   String?
  phone        String?

  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  department   Department @relation(fields: [departmentId], references: [id])

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("department_head_profiles")
}

model AccountantProfile {
  id           String           @id @default(uuid())
  userId       String           @unique
  employeeId   String           @unique
  departmentId String?
  designation  String?
  joiningDate  DateTime?
  phone        String?
  officeRoom   String?
  status       AccountantStatus @default(ACTIVE)

  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  department   Department? @relation(fields: [departmentId], references: [id])

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([departmentId])
  @@map("accountant_profiles")
}

model AdminProfile {
  id           String   @id @default(uuid())
  userId       String   @unique
  employeeId   String?  @unique
  departmentId String?
  designation  String?
  phone        String?
  officeRoom   String?

  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  department   Department? @relation(fields: [departmentId], references: [id])

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([departmentId])
  @@map("admin_profiles")
}

model SuperAdminProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  employeeId  String?  @unique
  designation String?
  phone       String?
  officeRoom  String?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("super_admin_profiles")
}
""",
"models/academic.prisma": """model Department {
  id          String   @id @default(uuid())
  name        String
  code        String   @unique
  description String?

  studentProfiles       StudentProfile[]
  instructorProfiles    InstructorProfile[]
  departmentHeadProfile DepartmentHeadProfile?
  accountantProfiles    AccountantProfile[]
  adminProfiles         AdminProfile[]
  programs              Program[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("departments")
}

model Program {
  id           String          @id @default(uuid())
  name         String
  code         String          @unique
  departmentId String

  department   Department      @relation(fields: [departmentId], references: [id])
  students     StudentProfile[]

  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@index([departmentId])
  @@map("programs")
}

model Semester {
  id        String          @id @default(uuid())
  name      String
  code      String          @unique
  status    SemesterStatus  @default(UPCOMING)
  startDate DateTime?
  endDate   DateTime?

  students  StudentProfile[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("semesters")
}

model AcademicSession {
  id        String                @id @default(uuid())
  name      String
  code      String                @unique
  status    AcademicSessionStatus @default(UPCOMING)
  startDate DateTime
  endDate   DateTime

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("academic_sessions")
}
""",
"README.md": """# University Management System — Prisma Schema

## Architecture

The schema separates common account data from role-specific profile data.

```text
User
 ├── StudentProfile
 ├── InstructorProfile
 ├── DepartmentHeadProfile
 ├── AccountantProfile
 ├── AdminProfile
 └── SuperAdminProfile