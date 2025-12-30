const fs = require('fs');
const content = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Case {
  id         String    @id @default(cuid())
  title      String?
  memo       String?
  createdAt  DateTime  @default(now())
  expiryDate DateTime?
  isExpired  Boolean   @default(false)
  userId     String?
  User       User?     @relation(fields: [userId], references: [id])
  File       File[]
  annotations Annotation[]
  links       Link[]
}

model File {
  id     String @id @default(cuid())
  path   String
  type   String
  size   Int    @default(0)
  caseId String
  Case   Case   @relation(fields: [caseId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          String    @default("USER")
  plan          String    @default("FREE")
  planStartDate DateTime?
  planEndDate   DateTime?
  createdAt     DateTime  @default(now())
  isActive      Boolean   @default(true)
  resetToken    String?
  resetTokenExpiry DateTime?
  accounts      Account[]
  sessions      Session[]
  Case          Case[]
  Payment       Payment[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  refresh_token_expires_in Int?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value String
}

model PlanLimit {
  id                String   @id @default(cuid())
  plan              String   @unique
  maxLinks          Int
  linkDurationHours Int
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Payment {
  id         String   @id @default(cuid())
  userId     String
  amount     Float
  currency   String   @default("KRW")
  status     String   @default("PENDING")
  provider   String   @default("PORTONE")
  externalId String?  @unique
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Annotation {
  id        String   @id @default(cuid())
  caseId    String
  x         Float
  y         Float
  z         Float
  nx        Float    @default(0)
  ny        Float    @default(0)
  nz        Float    @default(0)
  text      String
  color     String?  @default("#ff0000")
  createdAt DateTime @default(now())
  Case      Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)
}

model Link {
  id          String    @id @default(cuid())
  slug        String    @unique
  caseId      String
  Case        Case      @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  description String?
  
  expiresAt   DateTime?
  maxViews    Int?
  currentViews Int      @default(0)
  
  isActive    Boolean   @default(true)
  
  createdAt   DateTime  @default(now())
  createdBy   String?
}`;

fs.writeFileSync('prisma/schema.prisma', content.trim());
