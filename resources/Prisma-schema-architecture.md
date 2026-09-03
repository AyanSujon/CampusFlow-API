অবশ্যই। নিচে আমি আপনার requirements অনুযায়ী **complete copy-paste-ready Prisma schema architecture** এবং তার জন্য **README.md** দিচ্ছি।

এই design-এর মূল নিয়মগুলো:

* `User` table-এ আপনার দেওয়া authentication/account fields থাকবে।
* একজন `User`-এর **exactly one `Role`** থাকবে।
* Role অনুযায়ী আলাদা **Profile table** থাকবে।
* `Permission[]` সরাসরি `User`-এর মধ্যে থাকবে।
* `UserRole` বা `RolePermission` join table থাকবে না।
* `SUPER_ADMIN` → `ADMIN`-এর permissions customize করতে পারবে।
* `ADMIN` → নতুন `ADMIN` create করতে পারবে, কিন্তু custom permission দিতে পারবে না।
* Department scope, instructor course scope, student ownership এবং financial scope backend-এ enforce করতে হবে।
* Enum আলাদা `enums.prisma` file-এ থাকবে।
* Model আলাদা domain files-এ রাখা হবে।

---

# 1. Recommended Prisma Folder Structure

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

---

# 2. `schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["prismaSchemaFolder"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

> আপনার Prisma version অনুযায়ী multi-file schema configuration পরিবর্তিত হতে পারে। যদি আপনার version-এ `prismaSchemaFolder` আর প্রয়োজন না হয়, তাহলে `previewFeatures` line বাদ দিতে হবে।

---

# 3. `enums.prisma`

```prisma
enum AuthProvider {
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
  // User Management
  USER_READ
  USER_CREATE
  USER_UPDATE
  USER_DELETE
  USER_SUSPEND
  USER_RESTORE

  // Admin Management
  ADMIN_CREATE
  ADMIN_READ
  ADMIN_PERMISSION_READ
  ADMIN_PERMISSION_UPDATE

  // Student Management
  STUDENT_READ
  STUDENT_CREATE
  STUDENT_UPDATE
  STUDENT_DELETE

  // Instructor Management
  INSTRUCTOR_READ
  INSTRUCTOR_CREATE
  INSTRUCTOR_UPDATE
  INSTRUCTOR_DELETE

  // Department
  DEPARTMENT_READ
  DEPARTMENT_CREATE
  DEPARTMENT_UPDATE
  DEPARTMENT_DELETE

  // Program
  PROGRAM_READ
  PROGRAM_CREATE
  PROGRAM_UPDATE
  PROGRAM_DELETE

  // Subject
  SUBJECT_READ
  SUBJECT_CREATE
  SUBJECT_UPDATE
  SUBJECT_DELETE

  // Course
  COURSE_READ
  COURSE_CREATE
  COURSE_UPDATE
  COURSE_DELETE
  COURSE_ASSIGN_INSTRUCTOR

  // Academic Session
  ACADEMIC_SESSION_READ
  ACADEMIC_SESSION_CREATE
  ACADEMIC_SESSION_UPDATE
  ACADEMIC_SESSION_DELETE

  // Semester
  SEMESTER_READ
  SEMESTER_CREATE
  SEMESTER_UPDATE
  SEMESTER_DELETE

  // Schedule
  CLASS_SCHEDULE_READ
  CLASS_SCHEDULE_CREATE
  CLASS_SCHEDULE_UPDATE
  CLASS_SCHEDULE_DELETE

  // Enrollment
  ENROLLMENT_READ
  ENROLLMENT_CREATE
  ENROLLMENT_UPDATE
  ENROLLMENT_DELETE
  ENROLLMENT_APPROVE

  // Attendance
  ATTENDANCE_READ
  ATTENDANCE_CREATE
  ATTENDANCE_UPDATE
  ATTENDANCE_DELETE

  // Assignment
  ASSIGNMENT_READ
  ASSIGNMENT_CREATE
  ASSIGNMENT_UPDATE
  ASSIGNMENT_DELETE
  ASSIGNMENT_SUBMIT
  ASSIGNMENT_GRADE

  // Exam
  EXAM_READ
  EXAM_CREATE
  EXAM_UPDATE
  EXAM_DELETE

  // Grade
  GRADE_READ
  GRADE_CREATE
  GRADE_UPDATE
  GRADE_DELETE

  // Result
  RESULT_READ
  RESULT_CREATE
  RESULT_UPDATE
  RESULT_SUBMIT
  RESULT_APPROVE
  RESULT_REJECT
  RESULT_PUBLISH

  // Notice
  NOTICE_READ
  NOTICE_CREATE
  NOTICE_UPDATE
  NOTICE_DELETE

  // Event
  EVENT_READ
  EVENT_CREATE
  EVENT_UPDATE
  EVENT_DELETE

  // Invoice
  INVOICE_READ
  INVOICE_CREATE
  INVOICE_UPDATE
  INVOICE_DELETE

  // Payment
  PAYMENT_READ
  PAYMENT_CREATE
  PAYMENT_VERIFY
  PAYMENT_REFUND

  // Scholarship
  SCHOLARSHIP_READ
  SCHOLARSHIP_CREATE
  SCHOLARSHIP_UPDATE
  SCHOLARSHIP_APPROVE
  SCHOLARSHIP_REJECT

  // Financial Transaction
  FINANCIAL_TRANSACTION_READ
  FINANCIAL_TRANSACTION_CREATE
  FINANCIAL_TRANSACTION_APPROVE

  // Financial Report
  FINANCIAL_REPORT_READ

  // System
  SYSTEM_SETTING_READ
  SYSTEM_SETTING_UPDATE

  // Audit
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

enum AccountantStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  VISITING
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

enum DayOfWeek {
  SATURDAY
  SUNDAY
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
}
```

---

# 4. `models/user.prisma`

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

  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  @@index([role])
  @@index([isActive])
  @@index([isDeleted])
  @@map("users")
}
```

---

# 5. `models/profiles.prisma`

```prisma
model StudentProfile {
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

  enrollments       StudentEnrollment[]
  attendances       Attendance[]
  submissions       AssignmentSubmission[]
  grades            Grade[]
  invoices          Invoice[]
  payments          Payment[]
  scholarships      Scholarship[]

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

  courseAssignments CourseInstructor[]
  assignments       Assignment[]
  exams             Exam[]
  results           Result[]

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

  reviewedEnrollments StudentEnrollment[]
  reviewedResults     Result[]
  approvedScholarships Scholarship[] @relation("ScholarshipApprover")

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

  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  department   Department?      @relation(fields: [departmentId], references: [id])

  verifiedPayments Payment[]
  approvedTransactions FinancialTransaction[]

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

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("super_admin_profiles")
}
```

---

# 6. `models/academic.prisma`

```prisma
model Department {
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
  subjects              Subject[]
  courses               Course[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@map("departments")
}


model Program {
  id           String       @id @default(uuid())
  name         String
  code         String       @unique

  departmentId String

  department   Department   @relation(fields: [departmentId], references: [id])
  students     StudentProfile[]
  subjects     Subject[]

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([departmentId])
  @@map("programs")
}


model Subject {
  id           String       @id @default(uuid())
  name         String
  code         String       @unique
  credit       Decimal      @db.Decimal(4, 2)

  departmentId String
  programId    String?

  department   Department   @relation(fields: [departmentId], references: [id])
  program      Program?     @relation(fields: [programId], references: [id])

  courses      Course[]

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([departmentId])
  @@index([programId])
  @@map("subjects")
}


model AcademicSession {
  id          String                @id @default(uuid())
  name        String
  code        String                @unique

  startDate   DateTime
  endDate     DateTime

  status      AcademicSessionStatus @default(UPCOMING)

  semesters   Semester[]
  courses     Course[]

  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt

  @@map("academic_sessions")
}


model Semester {
  id                String          @id @default(uuid())
  name              String
  code              String          @unique

  academicSessionId String
  semesterNumber    Int

  status            SemesterStatus  @default(UPCOMING)

  startDate         DateTime?
  endDate           DateTime?

  academicSession   AcademicSession @relation(fields: [academicSessionId], references: [id])
  students          StudentProfile[]
  courses           Course[]

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@unique([academicSessionId, semesterNumber])
  @@index([academicSessionId])
  @@map("semesters")
}
```

---

# 7. `models/course.prisma`

```prisma
model Course {
  id                String       @id @default(uuid())

  code              String       @unique
  title             String

  credit            Decimal      @db.Decimal(4, 2)

  departmentId      String
  subjectId         String
  academicSessionId String
  semesterId        String

  status            CourseStatus @default(DRAFT)

  department        Department   @relation(fields: [departmentId], references: [id])
  subject           Subject      @relation(fields: [subjectId], references: [id])
  academicSession   AcademicSession @relation(fields: [academicSessionId], references: [id])
  semester          Semester     @relation(fields: [semesterId], references: [id])

  instructors       CourseInstructor[]
  schedules          ClassSchedule[]
  enrollments        StudentEnrollment[]
  assignments        Assignment[]
  exams              Exam[]
  grades             Grade[]
  results            Result[]

  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  @@index([departmentId])
  @@index([subjectId])
  @@index([academicSessionId])
  @@index([semesterId])
  @@map("courses")
}


model CourseInstructor {
  id           String             @id @default(uuid())

  courseId     String
  instructorId String

  isPrimary    Boolean            @default(false)

  course       Course             @relation(fields: [courseId], references: [id], onDelete: Cascade)
  instructor   InstructorProfile  @relation(fields: [instructorId], references: [id], onDelete: Cascade)

  assignedAt   DateTime           @default(now())

  @@unique([courseId, instructorId])
  @@index([instructorId])
  @@map("course_instructors")
}


model ClassSchedule {
  id          String      @id @default(uuid())

  courseId    String

  dayOfWeek   DayOfWeek
  startTime   String
  endTime     String

  room        String?
  building    String?

  course      Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([courseId])
  @@map("class_schedules")
}
```

---

# 8. `models/enrollment.prisma`

```prisma
model StudentEnrollment {
  id              String           @id @default(uuid())

  studentId       String
  courseId        String

  enrollmentDate  DateTime         @default(now())
  status          EnrollmentStatus @default(PENDING)

  reviewedById    String?
  reviewedAt      DateTime?
  reviewNote      String?

  student         StudentProfile   @relation(fields: [studentId], references: [id])
  course          Course           @relation(fields: [courseId], references: [id])

  reviewedBy      DepartmentHeadProfile? @relation(fields: [reviewedById], references: [id])

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@unique([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
  @@index([reviewedById])
  @@map("student_enrollments")
}
```

---

# 9. `models/attendance.prisma`

```prisma
model Attendance {
  id          String           @id @default(uuid())

  studentId   String
  courseId    String

  date        DateTime
  status      AttendanceStatus

  remarks     String?

  student     StudentProfile   @relation(fields: [studentId], references: [id])
  course      Course           @relation(fields: [courseId], references: [id])

  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@unique([studentId, courseId, date])
  @@index([studentId])
  @@index([courseId])
  @@index([date])
  @@map("attendances")
}
```

---

# 10. `models/assignment.prisma`

```prisma
model Assignment {
  id           String           @id @default(uuid())

  title        String
  description  String?

  courseId     String
  instructorId String

  dueDate      DateTime
  totalMarks   Decimal          @db.Decimal(6, 2)

  status       AssignmentStatus @default(DRAFT)

  course       Course           @relation(fields: [courseId], references: [id])
  instructor   InstructorProfile @relation(fields: [instructorId], references: [id])

  submissions  AssignmentSubmission[]

  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@index([courseId])
  @@index([instructorId])
  @@map("assignments")
}


model AssignmentSubmission {
  id            String           @id @default(uuid())

  assignmentId  String
  studentId     String

  submittedAt   DateTime         @default(now())
  fileUrl       String?
  content       String?

  marks         Decimal?         @db.Decimal(6, 2)
  feedback      String?

  status        SubmissionStatus @default(SUBMITTED)

  assignment    Assignment       @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student       StudentProfile   @relation(fields: [studentId], references: [id])

  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@unique([assignmentId, studentId])
  @@index([studentId])
  @@map("assignment_submissions")
}
```

---

# 11. `models/exam.prisma`

```prisma
model Exam {
  id           String      @id @default(uuid())

  title        String
  courseId     String
  instructorId String

  type         ExamType
  examDate     DateTime

  totalMarks   Decimal     @db.Decimal(6, 2)
  durationMin  Int?

  status       ExamStatus  @default(DRAFT)

  course       Course      @relation(fields: [courseId], references: [id])
  instructor   InstructorProfile @relation(fields: [instructorId], references: [id])

  grades       Grade[]

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([courseId])
  @@index([instructorId])
  @@map("exams")
}


model Grade {
  id          String         @id @default(uuid())

  studentId   String
  courseId    String
  examId      String?

  marks       Decimal        @db.Decimal(6, 2)
  gradeLetter String?
  gradePoint  Decimal?       @db.Decimal(4, 2)

  student     StudentProfile @relation(fields: [studentId], references: [id])
  course      Course         @relation(fields: [courseId], references: [id])
  exam        Exam?          @relation(fields: [examId], references: [id])

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([studentId])
  @@index([courseId])
  @@index([examId])
  @@map("grades")
}
```

---

# 12. `models/result.prisma`

```prisma
model Result {
  id              String        @id @default(uuid())

  studentId       String
  courseId        String
  instructorId    String

  totalMarks      Decimal       @db.Decimal(6, 2)
  gradeLetter     String?
  gradePoint      Decimal?      @db.Decimal(4, 2)

  status          ResultStatus  @default(DRAFT)

  submittedAt     DateTime?
  reviewedAt      DateTime?
  publishedAt     DateTime?

  reviewedById    String?

  student         StudentProfile      @relation(fields: [studentId], references: [id])
  course          Course              @relation(fields: [courseId], references: [id])
  instructor      InstructorProfile   @relation(fields: [instructorId], references: [id])
  reviewedBy      DepartmentHeadProfile? @relation(fields: [reviewedById], references: [id])

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([studentId, courseId])
  @@index([courseId])
  @@index([instructorId])
  @@index([reviewedById])
  @@map("results")
}
```

---

# 13. `models/finance.prisma`

```prisma
model Invoice {
  id            String        @id @default(uuid())

  invoiceNumber String        @unique

  studentId     String

  description   String?
  amount        Decimal       @db.Decimal(12, 2)
  dueDate       DateTime

  status        InvoiceStatus @default(PENDING)

  issuedById    String?

  student       StudentProfile @relation(fields: [studentId], references: [id])
  issuedBy      User?          @relation("InvoiceIssuer", fields: [issuedById], references: [id])

  payments      Payment[]

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([studentId])
  @@index([issuedById])
  @@map("invoices")
}


model Payment {
  id            String        @id @default(uuid())

  transactionId String        @unique

  invoiceId     String
  studentId     String

  amount        Decimal       @db.Decimal(12, 2)

  method        PaymentMethod
  status        PaymentStatus @default(PENDING)

  paymentDate   DateTime      @default(now())

  gatewayRef    String?
  note          String?

  verifiedById  String?
  verifiedAt    DateTime?

  invoice       Invoice       @relation(fields: [invoiceId], references: [id])
  student       StudentProfile @relation(fields: [studentId], references: [id])

  verifiedBy    AccountantProfile? @relation(fields: [verifiedById], references: [id])

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([invoiceId])
  @@index([studentId])
  @@index([verifiedById])
  @@map("payments")
}


model Scholarship {
  id            String             @id @default(uuid())

  studentId     String

  type          ScholarshipType
  title         String
  amount        Decimal            @db.Decimal(12, 2)

  status        ScholarshipStatus  @default(PENDING)

  requestedAt   DateTime           @default(now())
  approvedAt    DateTime?

  requesterId   String?
  approverId    String?

  student       StudentProfile     @relation(fields: [studentId], references: [id])
  approver      DepartmentHeadProfile? @relation("ScholarshipApprover", fields: [approverId], references: [id])

  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  @@index([studentId])
  @@index([approverId])
  @@map("scholarships")
}


model FinancialTransaction {
  id            String                     @id @default(uuid())

  reference     String                     @unique

  type          FinancialTransactionType
  status        FinancialTransactionStatus @default(PENDING)

  amount        Decimal                    @db.Decimal(12, 2)
  description   String?

  createdById   String
  approvedById  String?

  transactionDate DateTime                 @default(now())

  createdBy     User                       @relation("TransactionCreator", fields: [createdById], references: [id])
  approvedBy    AccountantProfile?         @relation("TransactionApprover", fields: [approvedById], references: [id])

  createdAt     DateTime                   @default(now())
  updatedAt     DateTime                   @updatedAt

  @@index([createdById])
  @@index([approvedById])
  @@index([type])
  @@map("financial_transactions")
}
```

**Note:** `Invoice`, `User`, `FinancialTransaction`-এর named relations-এর opposite fields `User` model-এ যোগ করতে হবে। নিচের final `user.prisma` version-এ সেগুলো দেওয়া আছে।

---

# 14. Final `models/user.prisma`

উপরের user model-এর বদলে **এই complete version** ব্যবহার করুন:

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

  issuedInvoices        Invoice[] @relation("InvoiceIssuer")
  createdTransactions   FinancialTransaction[] @relation("TransactionCreator")

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([role])
  @@index([isActive])
  @@index([isDeleted])
  @@map("users")
}
```

---

# 15. `models/communication.prisma`

```prisma
model Notice {
  id          String            @id @default(uuid())

  title       String
  content     String

  audience    NoticeAudience
  departmentId String?

  status      PublicationStatus @default(DRAFT)

  createdById String

  department  Department?       @relation(fields: [departmentId], references: [id])
  createdBy   User              @relation("NoticeCreator", fields: [createdById], references: [id])

  publishedAt DateTime?

  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([departmentId])
  @@index([createdById])
  @@map("notices")
}


model Event {
  id           String            @id @default(uuid())

  title        String
  description  String?

  startDate    DateTime
  endDate      DateTime?

  location     String?

  status       PublicationStatus @default(DRAFT)

  createdById  String

  createdBy   User              @relation("EventCreator", fields: [createdById], references: [id])

  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([createdById])
  @@map("events")
}
```

---

# 16. `models/audit.prisma`

```prisma
model AuditLog {
  id          String      @id @default(uuid())

  actorId     String?

  action      String
  resource    String
  resourceId  String?

  method      String?
  endpoint    String?

  ipAddress   String?
  userAgent   String?

  oldData     Json?
  newData     Json?

  result      AuditResult @default(SUCCESS)
  reason      String?

  createdAt   DateTime    @default(now())

  actor       User?       @relation("AuditActor", fields: [actorId], references: [id])

  @@index([actorId])
  @@index([resource])
  @@index([resourceId])
  @@index([createdAt])
  @@map("audit_logs")
}


model SystemSetting {
  id          String   @id @default(uuid())

  key         String   @unique
  value       Json

  description String?

  updatedById String?

  updatedBy   User?    @relation("SettingUpdater", fields: [updatedById], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([updatedById])
  @@map("system_settings")
}
```

---

# 17. Important `User` relations

যেহেতু উপরের অন্য model-গুলো `User`-এর সাথে relation করছে, final `User` model-এ নিচের fields-গুলোও রাখা উচিত:

```prisma
createdNotices       Notice[]              @relation("NoticeCreator")
createdEvents         Event[]               @relation("EventCreator")
auditLogs             AuditLog[]            @relation("AuditActor")
updatedSettings       SystemSetting[]       @relation("SettingUpdater")
```

তাই **সব relation সহ final User model** হবে:

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

  isActive            Boolean     @default(true)
  needPasswordChange  Boolean     @default(false)
  isDeleted           Boolean     @default(false)
  deletedAt           DateTime?

  // Role-based profiles
  studentProfile        StudentProfile?
  instructorProfile     InstructorProfile?
  departmentHeadProfile DepartmentHeadProfile?
  accountantProfile     AccountantProfile?
  adminProfile          AdminProfile?
  superAdminProfile     SuperAdminProfile?

  // Finance
  issuedInvoices        Invoice[]             @relation("InvoiceIssuer")
  createdTransactions   FinancialTransaction[] @relation("TransactionCreator")

  // Communication
  createdNotices        Notice[]              @relation("NoticeCreator")
  createdEvents         Event[]               @relation("EventCreator")

  // Audit & Settings
  auditLogs             AuditLog[]            @relation("AuditActor")
  updatedSettings       SystemSetting[]       @relation("SettingUpdater")

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([role])
  @@index([isActive])
  @@index([isDeleted])
  @@map("users")
}
```

---

# 18. Field Explanation — All Tables

## `users`

| Field                | Type         | Required | Purpose                          |
| -------------------- | ------------ | -------: | -------------------------------- |
| `id`                 | String       |      Yes | Primary key                      |
| `name`               | String       |      Yes | User full/display name           |
| `email`              | String       |      Yes | Unique login email               |
| `password`           | String?      |       No | Hashed password                  |
| `googleId`           | String?      |       No | Google account identifier        |
| `authProvider`       | AuthProvider |      Yes | Credential/Google authentication |
| `emailVerified`      | Boolean      |      Yes | Email verification status        |
| `role`               | Role         |      Yes | Exactly one role                 |
| `permissions`        | Permission[] |      Yes | User-specific permissions        |
| `isActive`           | Boolean      |      Yes | Account active/inactive          |
| `needPasswordChange` | Boolean      |      Yes | Temporary password change flag   |
| `isDeleted`          | Boolean      |      Yes | Soft-delete flag                 |
| `deletedAt`          | DateTime?    |       No | Soft-delete timestamp            |
| `createdAt`          | DateTime     |      Yes | Creation timestamp               |
| `updatedAt`          | DateTime     |      Yes | Last update timestamp            |

---

## `student_profiles`

| Field               | Type          | Required | Purpose                  |
| ------------------- | ------------- | -------: | ------------------------ |
| `id`                | String        |      Yes | Primary key              |
| `userId`            | String        |      Yes | One-to-one User relation |
| `studentId`         | String        |      Yes | Institutional student ID |
| `registrationNo`    | String        |      Yes | Registration number      |
| `departmentId`      | String        |      Yes | Student department       |
| `programId`         | String?       |       No | Academic program         |
| `currentSemesterId` | String?       |       No | Current semester         |
| `dateOfBirth`       | DateTime?     |       No | Date of birth            |
| `gender`            | Gender?       |       No | Gender                   |
| `phone`             | String?       |       No | Contact number           |
| `address`           | String?       |       No | Address                  |
| `guardianName`      | String?       |       No | Guardian name            |
| `guardianPhone`     | String?       |       No | Guardian contact         |
| `admissionDate`     | DateTime?     |       No | Admission date           |
| `status`            | StudentStatus |      Yes | Student lifecycle status |

---

## `instructor_profiles`

| Field            | Type             | Required | Purpose                 |
| ---------------- | ---------------- | -------: | ----------------------- |
| `id`             | String           |      Yes | Primary key             |
| `userId`         | String           |      Yes | User relation           |
| `employeeId`     | String           |      Yes | Employee ID             |
| `departmentId`   | String           |      Yes | Instructor department   |
| `designation`    | String           |      Yes | Lecturer/Professor/etc. |
| `employmentType` | EmploymentType   |      Yes | Employment category     |
| `joiningDate`    | DateTime?        |       No | Joining date            |
| `phone`          | String?          |       No | Contact number          |
| `officeRoom`     | String?          |       No | Office location         |
| `specialization` | String?          |       No | Academic specialization |
| `qualification`  | String?          |       No | Academic qualification  |
| `status`         | InstructorStatus |      Yes | Employment status       |

---

## `department_head_profiles`

| Field          | Type      | Required | Purpose            |
| -------------- | --------- | -------: | ------------------ |
| `id`           | String    |      Yes | Primary key        |
| `userId`       | String    |      Yes | User relation      |
| `employeeId`   | String    |      Yes | Employee ID        |
| `departmentId` | String    |      Yes | Managed department |
| `designation`  | String?   |       No | Head designation   |
| `appointedAt`  | DateTime? |       No | Appointment date   |
| `termEndsAt`   | DateTime? |       No | End of appointment |
| `officeRoom`   | String?   |       No | Office             |
| `phone`        | String?   |       No | Contact            |

---

## `accountant_profiles`

| Field          | Type             | Required | Purpose                  |
| -------------- | ---------------- | -------: | ------------------------ |
| `id`           | String           |      Yes | Primary key              |
| `userId`       | String           |      Yes | User relation            |
| `employeeId`   | String           |      Yes | Employee ID              |
| `departmentId` | String?          |       No | Department if applicable |
| `designation`  | String?          |       No | Job title                |
| `joiningDate`  | DateTime?        |       No | Joining date             |
| `phone`        | String?          |       No | Contact                  |
| `officeRoom`   | String?          |       No | Office                   |
| `status`       | AccountantStatus |      Yes | Accountant status        |

---

## `admin_profiles`

| Field          | Type    | Required | Purpose                   |
| -------------- | ------- | -------: | ------------------------- |
| `id`           | String  |      Yes | Primary key               |
| `userId`       | String  |      Yes | User relation             |
| `employeeId`   | String? |       No | Employee ID               |
| `departmentId` | String? |       No | Optional department scope |
| `designation`  | String? |       No | Admin designation         |
| `phone`        | String? |       No | Contact                   |
| `officeRoom`   | String? |       No | Office                    |

---

## `super_admin_profiles`

| Field         | Type    | Required | Purpose       |
| ------------- | ------- | -------: | ------------- |
| `id`          | String  |      Yes | Primary key   |
| `userId`      | String  |      Yes | User relation |
| `employeeId`  | String? |       No | Employee ID   |
| `designation` | String? |       No | Position      |
| `phone`       | String? |       No | Contact       |
| `officeRoom`  | String? |       No | Office        |

---

## `departments`

| Field         | Type    | Required | Purpose                |
| ------------- | ------- | -------: | ---------------------- |
| `id`          | String  |      Yes | Primary key            |
| `name`        | String  |      Yes | Department name        |
| `code`        | String  |      Yes | Unique department code |
| `description` | String? |       No | Description            |

---

## `programs`

| Field          | Type   | Required | Purpose             |
| -------------- | ------ | -------: | ------------------- |
| `id`           | String |      Yes | Primary key         |
| `name`         | String |      Yes | Program name        |
| `code`         | String |      Yes | Unique program code |
| `departmentId` | String |      Yes | Owning department   |

---

## `subjects`

| Field          | Type    | Required | Purpose             |
| -------------- | ------- | -------: | ------------------- |
| `id`           | String  |      Yes | Primary key         |
| `name`         | String  |      Yes | Subject name        |
| `code`         | String  |      Yes | Unique subject code |
| `credit`       | Decimal |      Yes | Credit hours        |
| `departmentId` | String  |      Yes | Department          |
| `programId`    | String? |       No | Program             |

---

## `academic_sessions`

| Field       | Type     | Required | Purpose             |
| ----------- | -------- | -------: | ------------------- |
| `id`        | String   |      Yes | Primary key         |
| `name`      | String   |      Yes | Session name        |
| `code`      | String   |      Yes | Unique session code |
| `startDate` | DateTime |      Yes | Session start       |
| `endDate`   | DateTime |      Yes | Session end         |
| `status`    | Enum     |      Yes | Session state       |

---

## `semesters`

| Field               | Type      | Required | Purpose           |
| ------------------- | --------- | -------: | ----------------- |
| `id`                | String    |      Yes | Primary key       |
| `name`              | String    |      Yes | Semester name     |
| `code`              | String    |      Yes | Unique code       |
| `academicSessionId` | String    |      Yes | Parent session    |
| `semesterNumber`    | Int       |      Yes | Semester sequence |
| `status`            | Enum      |      Yes | Semester state    |
| `startDate`         | DateTime? |       No | Start             |
| `endDate`           | DateTime? |       No | End               |

---

## `courses`

| Field               | Type         | Required | Purpose          |
| ------------------- | ------------ | -------: | ---------------- |
| `id`                | String       |      Yes | Primary key      |
| `code`              | String       |      Yes | Course code      |
| `title`             | String       |      Yes | Course title     |
| `credit`            | Decimal      |      Yes | Course credit    |
| `departmentId`      | String       |      Yes | Department       |
| `subjectId`         | String       |      Yes | Subject          |
| `academicSessionId` | String       |      Yes | Academic session |
| `semesterId`        | String       |      Yes | Semester         |
| `status`            | CourseStatus |      Yes | Course lifecycle |

---

## `course_instructors`

| Field          | Type     | Required | Purpose              |
| -------------- | -------- | -------: | -------------------- |
| `id`           | String   |      Yes | Primary key          |
| `courseId`     | String   |      Yes | Course               |
| `instructorId` | String   |      Yes | Instructor           |
| `isPrimary`    | Boolean  |      Yes | Primary instructor   |
| `assignedAt`   | DateTime |      Yes | Assignment timestamp |

---

## `class_schedules`

| Field       | Type      | Required | Purpose     |
| ----------- | --------- | -------: | ----------- |
| `id`        | String    |      Yes | Primary key |
| `courseId`  | String    |      Yes | Course      |
| `dayOfWeek` | DayOfWeek |      Yes | Class day   |
| `startTime` | String    |      Yes | Start time  |
| `endTime`   | String    |      Yes | End time    |
| `room`      | String?   |       No | Room        |
| `building`  | String?   |       No | Building    |

---

## `student_enrollments`

| Field            | Type             | Required | Purpose          |
| ---------------- | ---------------- | -------: | ---------------- |
| `id`             | String           |      Yes | Primary key      |
| `studentId`      | String           |      Yes | Student          |
| `courseId`       | String           |      Yes | Course           |
| `enrollmentDate` | DateTime         |      Yes | Enrollment time  |
| `status`         | EnrollmentStatus |      Yes | Enrollment state |
| `reviewedById`   | String?          |       No | Department head  |
| `reviewedAt`     | DateTime?        |       No | Review time      |
| `reviewNote`     | String?          |       No | Review note      |

---

## `attendances`

| Field       | Type             | Required | Purpose             |
| ----------- | ---------------- | -------: | ------------------- |
| `id`        | String           |      Yes | Primary key         |
| `studentId` | String           |      Yes | Student             |
| `courseId`  | String           |      Yes | Course              |
| `date`      | DateTime         |      Yes | Attendance date     |
| `status`    | AttendanceStatus |      Yes | Present/Absent/etc. |
| `remarks`   | String?          |       No | Additional note     |

---

## `assignments`

| Field          | Type             | Required | Purpose          |
| -------------- | ---------------- | -------: | ---------------- |
| `id`           | String           |      Yes | Primary key      |
| `title`        | String           |      Yes | Assignment title |
| `description`  | String?          |       No | Description      |
| `courseId`     | String           |      Yes | Course           |
| `instructorId` | String           |      Yes | Creator          |
| `dueDate`      | DateTime         |      Yes | Deadline         |
| `totalMarks`   | Decimal          |      Yes | Maximum marks    |
| `status`       | AssignmentStatus |      Yes | Assignment state |

---

## `assignment_submissions`

| Field          | Type             | Required | Purpose             |
| -------------- | ---------------- | -------: | ------------------- |
| `id`           | String           |      Yes | Primary key         |
| `assignmentId` | String           |      Yes | Assignment          |
| `studentId`    | String           |      Yes | Student             |
| `submittedAt`  | DateTime         |      Yes | Submission time     |
| `fileUrl`      | String?          |       No | Uploaded file       |
| `content`      | String?          |       No | Text submission     |
| `marks`        | Decimal?         |       No | Obtained marks      |
| `feedback`     | String?          |       No | Instructor feedback |
| `status`       | SubmissionStatus |      Yes | Submission state    |

---

## `exams`

| Field          | Type       | Required | Purpose                |
| -------------- | ---------- | -------: | ---------------------- |
| `id`           | String     |      Yes | Primary key            |
| `title`        | String     |      Yes | Exam title             |
| `courseId`     | String     |      Yes | Course                 |
| `instructorId` | String     |      Yes | Responsible instructor |
| `type`         | ExamType   |      Yes | Exam type              |
| `examDate`     | DateTime   |      Yes | Exam date              |
| `totalMarks`   | Decimal    |      Yes | Total marks            |
| `durationMin`  | Int?       |       No | Duration               |
| `status`       | ExamStatus |      Yes | Exam state             |

---

## `grades`

| Field         | Type     | Required | Purpose        |
| ------------- | -------- | -------: | -------------- |
| `id`          | String   |      Yes | Primary key    |
| `studentId`   | String   |      Yes | Student        |
| `courseId`    | String   |      Yes | Course         |
| `examId`      | String?  |       No | Related exam   |
| `marks`       | Decimal  |      Yes | Obtained marks |
| `gradeLetter` | String?  |       No | Letter grade   |
| `gradePoint`  | Decimal? |       No | GPA point      |

---

## `results`

| Field          | Type         | Required | Purpose               |
| -------------- | ------------ | -------: | --------------------- |
| `id`           | String       |      Yes | Primary key           |
| `studentId`    | String       |      Yes | Student               |
| `courseId`     | String       |      Yes | Course                |
| `instructorId` | String       |      Yes | Result creator        |
| `totalMarks`   | Decimal      |      Yes | Total                 |
| `gradeLetter`  | String?      |       No | Grade                 |
| `gradePoint`   | Decimal?     |       No | Grade point           |
| `status`       | ResultStatus |      Yes | Workflow state        |
| `submittedAt`  | DateTime?    |       No | Instructor submission |
| `reviewedAt`   | DateTime?    |       No | Department review     |
| `publishedAt`  | DateTime?    |       No | Publication           |
| `reviewedById` | String?      |       No | Reviewer              |

---

# 19. README.md — Copy/Paste Version

নিচের অংশটি সরাসরি `README.md` হিসেবে ব্যবহার করতে পারবেন:

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

### একটি গুরুত্বপূর্ণ বিষয়

উপরের schema-তে **role/profile separation** আপনার requirement অনুযায়ী করা হয়েছে। তবে production implementation-এ আমি strongly recommend করব `User.role` পরিবর্তনকে সাধারণ update হিসেবে না রেখে একটি dedicated **Role Change Service** দিয়ে পরিচালনা করতে। কারণ:

```text
User.role = STUDENT
```

থেকে

```text
User.role = INSTRUCTOR
```

করলে শুধু `role` change করলেই হবে না; profile, permissions, scope এবং audit record-ও transaction-এর মধ্যে update করতে হবে।

এছাড়া পরবর্তী ধাপে আপনার জন্য সবচেয়ে গুরুত্বপূর্ণ হবে **`DEFAULT_*_PERMISSIONS` সহ complete permission seed file + Prisma seed.ts + RBAC middleware/authorization service**, যাতে এই schema সরাসরি backend implementation-এ ব্যবহার করা যায়।
