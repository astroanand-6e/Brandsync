import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  pgEnum,
  uniqueIndex,
  primaryKey,
  foreignKey,
  unique, // Import unique for constraints within pgTable
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// We might need a CUID or UUID generation library if we don't rely solely on Firebase UIDs
// import { createId } from '@paralleldrive/cuid2'; // Example if using CUID

// --- Enums ---

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'INFLUENCER', 'BRAND']);
export const platformEnum = pgEnum('platform', ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'FACEBOOK']);
export const dealStatusEnum = pgEnum('deal_status', ['DRAFT', 'PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const collaborationStatusEnum = pgEnum('collaboration_status', ['IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const deliverableStatusEnum = pgEnum('deliverable_status', ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED']);
export const transactionTypeEnum = pgEnum('transaction_type', ['DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND']);
export const transactionStatusEnum = pgEnum('transaction_status', ['PENDING', 'COMPLETED', 'FAILED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID', 'FAILED']);
export const notificationTypeEnum = pgEnum('notification_type', ['DEAL_PROPOSAL', 'MESSAGE', 'PAYMENT', 'REVIEW', 'SYSTEM']);

// --- Tables ---

// User Table (Corresponds to Prisma User model)
export const users = pgTable('users', {
  // Using text for ID to accommodate Firebase UIDs
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(), // Store hashed password
  role: userRoleEnum('role').default('INFLUENCER').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(), // Drizzle doesn't auto-update; handle in application logic or DB trigger
  walletId: text('wallet_id').unique(), // Nullable, unique reference to wallet
});

// Wallet Table (Corresponds to Prisma Wallet model)
export const wallets = pgTable('wallets', {
  // Assuming wallets also use string IDs, adjust if needed
  id: text('id').primaryKey(),
  userId: text('user_id').unique().references(() => users.id),
  balance: doublePrecision('balance').default(0.0).notNull(),
  currency: text('currency').default('USD').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Add foreign key constraint from users to wallets after wallets is defined
// This creates the constraint in the database schema generated by drizzle-kit
// Note: Drizzle ORM itself infers relations from the `relations` helper below,
// but explicit foreignKey() helps ensure DB integrity.
export const usersFk = foreignKey({
    columns: [users.walletId],
    foreignColumns: [wallets.id],
}).onDelete('set null'); // Or 'cascade' depending on desired behavior

// Influencer Table (Corresponds to Prisma Influencer model)
export const influencers = pgTable('influencers', {
  id: text('id').primaryKey(),
  userId: text('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }), // Cascade delete if user is deleted
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  avatar: text('avatar'),
  coverImage: text('cover_image'),
  totalEarnings: doublePrecision('total_earnings').default(0.0).notNull(),
  rating: doublePrecision('rating').default(0.0).notNull(),
  ratingCount: integer('rating_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Brand Table (Corresponds to Prisma Brand model)
export const brands = pgTable('brands', {
  id: text('id').primaryKey(),
  userId: text('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  industry: text('industry').notNull(),
  description: text('description'),
  website: text('website'),
  logo: text('logo'),
  coverImage: text('cover_image'),
  isVerified: boolean('is_verified').default(false).notNull(),
  verificationDoc: text('verification_doc'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// SocialAccount Table (Corresponds to Prisma SocialAccount model)
export const socialAccounts = pgTable('social_accounts', {
  id: text('id').primaryKey(),
  influencerId: text('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),
  username: text('username').notNull(),
  url: text('url').notNull(),
  followers: integer('followers').default(0).notNull(),
  engagement: doublePrecision('engagement').default(0.0).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Define compound unique constraint
  influencerPlatformUnique: unique('influencer_platform_unique_idx').on(table.influencerId, table.platform),
}));

// Niche Table
export const niches = pgTable('niches', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
});

// ContentType Table
export const contentTypes = pgTable('content_types', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
});

// Deal Table (Corresponds to Prisma Deal model)
export const deals = pgTable('deals', {
  id: text('id').primaryKey(),
  brandId: text('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  influencerId: text('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements').notNull(),
  deliverables: text('deliverables').notNull(),
  budget: doublePrecision('budget').notNull(),
  timeline: integer('timeline').notNull(), // Duration in days
  status: dealStatusEnum('status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Collaboration Table (Corresponds to Prisma Collaboration model)
export const collaborations = pgTable('collaborations', {
  id: text('id').primaryKey(),
  // One-to-one with Deal
  dealId: text('deal_id').unique().notNull().references(() => deals.id, { onDelete: 'cascade' }),
  brandId: text('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }), // Redundant? Already in Deal. Keep for easier querying? Prisma had it.
  influencerId: text('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }), // Redundant? Already in Deal. Keep for easier querying? Prisma had it.
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  status: collaborationStatusEnum('status').default('IN_PROGRESS').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('PENDING').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Deliverable Table (Corresponds to Prisma Deliverable model)
export const deliverables = pgTable('deliverables', {
  id: text('id').primaryKey(),
  collaborationId: text('collaboration_id').notNull().references(() => collaborations.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  status: deliverableStatusEnum('status').default('PENDING').notNull(),
  submissionUrl: text('submission_url'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Transaction Table (Corresponds to Prisma Transaction model)
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  walletId: text('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  amount: doublePrecision('amount').notNull(),
  type: transactionTypeEnum('type').notNull(),
  status: transactionStatusEnum('status').default('PENDING').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Milestone Table (Corresponds to Prisma Milestone model)
export const milestones = pgTable('milestones', {
  id: text('id').primaryKey(),
  collaborationId: text('collaboration_id').notNull().references(() => collaborations.id, { onDelete: 'cascade' }),
  walletId: text('wallet_id').notNull().references(() => wallets.id), // Should this cascade? Maybe not, keep record?
  amount: doublePrecision('amount').notNull(),
  description: text('description').notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  status: paymentStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Message Table (Corresponds to Prisma Message model)
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // User who sent
  receiverId: text('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // User who received
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Attachment Table (Corresponds to Prisma Attachment model)
export const attachments = pgTable('attachments', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  type: text('type').notNull(), // e.g., 'image/jpeg', 'application/pdf'
  name: text('name').notNull(), // Original filename
  size: integer('size').notNull(), // Size in bytes
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Notification Table (Corresponds to Prisma Notification model)
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// AnalyticsData Table (Corresponds to Prisma AnalyticsData model)
export const analyticsData = pgTable('analytics_data', {
  id: text('id').primaryKey(),
  influencerId: text('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(), // Timestamp for the data point
  followers: integer('followers').notNull(),
  engagement: doublePrecision('engagement').notNull(),
  impressions: integer('impressions').notNull(),
  clicks: integer('clicks').notNull(),
}, (table) => ({
  // Define compound unique constraint
  influencerPlatformDateUnique: unique('influencer_platform_date_unique_idx').on(table.influencerId, table.platform, table.date),
}));

// Review Table (Corresponds to Prisma Review model)
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  fromBrandId: text('from_brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  toInfluencerId: text('to_influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  rating: doublePrecision('rating').notNull(), // Consider constraints (e.g., 1-5) if needed at DB level
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});


// --- Junction Tables for Many-to-Many Relations ---

// Influencers <-> Niches
export const influencersToNiches = pgTable('influencers_to_niches', {
  influencerId: text('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  nicheId: text('niche_id').notNull().references(() => niches.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.influencerId, t.nicheId] }),
}));

// Influencers <-> ContentTypes
export const influencersToContentTypes = pgTable('influencers_to_content_types', {
  influencerId: text('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  contentTypeId: text('content_type_id').notNull().references(() => contentTypes.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.influencerId, t.contentTypeId] }),
}));

// Deals <-> Niches
export const dealsToNiches = pgTable('deals_to_niches', {
  dealId: text('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  nicheId: text('niche_id').notNull().references(() => niches.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.dealId, t.nicheId] }),
}));

// Deals <-> ContentTypes
export const dealsToContentTypes = pgTable('deals_to_content_types', {
  dealId: text('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  contentTypeId: text('content_type_id').notNull().references(() => contentTypes.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.dealId, t.contentTypeId] }),
}));


// --- Relations ---

// User Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  influencer: one(influencers, {
    fields: [users.id],
    references: [influencers.userId],
  }),
  brand: one(brands, {
    fields: [users.id],
    references: [brands.userId],
  }),
  wallet: one(wallets, {
    fields: [users.walletId],
    references: [wallets.id],
  }),
  sentMessages: many(messages, { relationName: 'SentMessages' }),
  receivedMessages: many(messages, { relationName: 'ReceivedMessages' }),
  notifications: many(notifications),
}));

// Wallet Relations
export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  milestones: many(milestones),
}));

// Influencer Relations
export const influencersRelations = relations(influencers, ({ one, many }) => ({
  user: one(users, {
    fields: [influencers.userId],
    references: [users.id],
  }),
  socialAccounts: many(socialAccounts),
  analytics: many(analyticsData),
  deals: many(deals),
  collaborations: many(collaborations),
  receivedReviews: many(reviews, { relationName: 'InfluencerReceivedReviews' }),
  influencersToNiches: many(influencersToNiches),
  influencersToContentTypes: many(influencersToContentTypes),
}));

// Brand Relations
export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, {
    fields: [brands.userId],
    references: [users.id],
  }),
  deals: many(deals),
  collaborations: many(collaborations),
  givenReviews: many(reviews, { relationName: 'BrandGivenReviews' }),
}));

// SocialAccount Relations
export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  influencer: one(influencers, {
    fields: [socialAccounts.influencerId],
    references: [influencers.id],
  }),
}));

// Niche Relations
export const nichesRelations = relations(niches, ({ many }) => ({
  influencersToNiches: many(influencersToNiches),
  dealsToNiches: many(dealsToNiches),
}));

// ContentType Relations
export const contentTypesRelations = relations(contentTypes, ({ many }) => ({
  influencersToContentTypes: many(influencersToContentTypes),
  dealsToContentTypes: many(dealsToContentTypes),
}));

// Deal Relations
export const dealsRelations = relations(deals, ({ one, many }) => ({
  brand: one(brands, {
    fields: [deals.brandId],
    references: [brands.id],
  }),
  influencer: one(influencers, {
    fields: [deals.influencerId],
    references: [influencers.id],
  }),
  collaboration: one(collaborations, {
    fields: [deals.id],
    references: [collaborations.dealId],
  }),
  dealsToNiches: many(dealsToNiches),
  dealsToContentTypes: many(dealsToContentTypes),
}));

// Collaboration Relations
export const collaborationsRelations = relations(collaborations, ({ one, many }) => ({
  deal: one(deals, {
    fields: [collaborations.dealId],
    references: [deals.id],
  }),
  brand: one(brands, {
    fields: [collaborations.brandId],
    references: [brands.id],
  }),
  influencer: one(influencers, {
    fields: [collaborations.influencerId],
    references: [influencers.id],
  }),
  deliverables: many(deliverables),
  milestones: many(milestones),
}));

// Deliverable Relations
export const deliverablesRelations = relations(deliverables, ({ one }) => ({
  collaboration: one(collaborations, {
    fields: [deliverables.collaborationId],
    references: [collaborations.id],
  }),
}));

// Transaction Relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));

// Milestone Relations
export const milestonesRelations = relations(milestones, ({ one }) => ({
  collaboration: one(collaborations, {
    fields: [milestones.collaborationId],
    references: [collaborations.id],
  }),
  wallet: one(wallets, {
    fields: [milestones.walletId],
    references: [wallets.id],
  }),
}));

// Message Relations
export const messagesRelations = relations(messages, ({ one, many }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'SentMessages',
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: 'ReceivedMessages',
  }),
  attachments: many(attachments),
}));

// Attachment Relations
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id],
  }),
}));

// Notification Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// AnalyticsData Relations
export const analyticsDataRelations = relations(analyticsData, ({ one }) => ({
  influencer: one(influencers, {
    fields: [analyticsData.influencerId],
    references: [influencers.id],
  }),
}));

// Review Relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  fromBrand: one(brands, {
    fields: [reviews.fromBrandId],
    references: [brands.id],
    relationName: 'BrandGivenReviews',
  }),
  toInfluencer: one(influencers, {
    fields: [reviews.toInfluencerId],
    references: [influencers.id],
    relationName: 'InfluencerReceivedReviews',
  }),
}));

// --- Many-to-Many Relations through Junction Tables ---

// influencersToNiches Relations
export const influencersToNichesRelations = relations(influencersToNiches, ({ one }) => ({
	influencer: one(influencers, {
		fields: [influencersToNiches.influencerId],
		references: [influencers.id],
	}),
	niche: one(niches, {
		fields: [influencersToNiches.nicheId],
		references: [niches.id],
	}),
}));

// influencersToContentTypes Relations
export const influencersToContentTypesRelations = relations(influencersToContentTypes, ({ one }) => ({
	influencer: one(influencers, {
		fields: [influencersToContentTypes.influencerId],
		references: [influencers.id],
	}),
	contentType: one(contentTypes, {
		fields: [influencersToContentTypes.contentTypeId],
		references: [contentTypes.id],
	}),
}));

// dealsToNiches Relations
export const dealsToNichesRelations = relations(dealsToNiches, ({ one }) => ({
	deal: one(deals, {
		fields: [dealsToNiches.dealId],
		references: [deals.id],
	}),
	niche: one(niches, {
		fields: [dealsToNiches.nicheId],
		references: [niches.id],
	}),
}));

// dealsToContentTypes Relations
export const dealsToContentTypesRelations = relations(dealsToContentTypes, ({ one }) => ({
	deal: one(deals, {
		fields: [dealsToContentTypes.dealId],
		references: [deals.id],
	}),
	contentType: one(contentTypes, {
		fields: [dealsToContentTypes.contentTypeId],
		references: [contentTypes.id],
	}),
}));
