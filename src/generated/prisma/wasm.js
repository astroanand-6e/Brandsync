
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  walletId: 'walletId'
};

exports.Prisma.InfluencerScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  bio: 'bio',
  location: 'location',
  website: 'website',
  avatar: 'avatar',
  coverImage: 'coverImage',
  totalEarnings: 'totalEarnings',
  rating: 'rating',
  ratingCount: 'ratingCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BrandScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  companyName: 'companyName',
  industry: 'industry',
  description: 'description',
  website: 'website',
  logo: 'logo',
  coverImage: 'coverImage',
  isVerified: 'isVerified',
  verificationDoc: 'verificationDoc',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SocialAccountScalarFieldEnum = {
  id: 'id',
  influencerId: 'influencerId',
  platform: 'platform',
  username: 'username',
  url: 'url',
  followers: 'followers',
  engagement: 'engagement',
  isVerified: 'isVerified',
  lastUpdated: 'lastUpdated'
};

exports.Prisma.NicheScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.ContentTypeScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.DealScalarFieldEnum = {
  id: 'id',
  brandId: 'brandId',
  influencerId: 'influencerId',
  title: 'title',
  description: 'description',
  requirements: 'requirements',
  deliverables: 'deliverables',
  budget: 'budget',
  timeline: 'timeline',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CollaborationScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  brandId: 'brandId',
  influencerId: 'influencerId',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  paymentStatus: 'paymentStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DeliverableScalarFieldEnum = {
  id: 'id',
  collaborationId: 'collaborationId',
  description: 'description',
  dueDate: 'dueDate',
  status: 'status',
  submissionUrl: 'submissionUrl',
  feedback: 'feedback',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WalletScalarFieldEnum = {
  id: 'id',
  balance: 'balance',
  currency: 'currency',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  walletId: 'walletId',
  amount: 'amount',
  type: 'type',
  status: 'status',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.MilestoneScalarFieldEnum = {
  id: 'id',
  collaborationId: 'collaborationId',
  walletId: 'walletId',
  amount: 'amount',
  description: 'description',
  dueDate: 'dueDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  content: 'content',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  url: 'url',
  type: 'type',
  name: 'name',
  size: 'size',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  content: 'content',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.AnalyticsDataScalarFieldEnum = {
  id: 'id',
  influencerId: 'influencerId',
  platform: 'platform',
  date: 'date',
  followers: 'followers',
  engagement: 'engagement',
  impressions: 'impressions',
  clicks: 'clicks'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  fromBrandId: 'fromBrandId',
  toInfluencerId: 'toInfluencerId',
  rating: 'rating',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  ADMIN: 'ADMIN',
  INFLUENCER: 'INFLUENCER',
  BRAND: 'BRAND'
};

exports.Platform = exports.$Enums.Platform = {
  INSTAGRAM: 'INSTAGRAM',
  TIKTOK: 'TIKTOK',
  YOUTUBE: 'YOUTUBE',
  TWITTER: 'TWITTER',
  LINKEDIN: 'LINKEDIN',
  FACEBOOK: 'FACEBOOK'
};

exports.DealStatus = exports.$Enums.DealStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.CollaborationStatus = exports.$Enums.CollaborationStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED'
};

exports.DeliverableStatus = exports.$Enums.DeliverableStatus = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  DEAL_PROPOSAL: 'DEAL_PROPOSAL',
  MESSAGE: 'MESSAGE',
  PAYMENT: 'PAYMENT',
  REVIEW: 'REVIEW',
  SYSTEM: 'SYSTEM'
};

exports.Prisma.ModelName = {
  User: 'User',
  Influencer: 'Influencer',
  Brand: 'Brand',
  SocialAccount: 'SocialAccount',
  Niche: 'Niche',
  ContentType: 'ContentType',
  Deal: 'Deal',
  Collaboration: 'Collaboration',
  Deliverable: 'Deliverable',
  Wallet: 'Wallet',
  Transaction: 'Transaction',
  Milestone: 'Milestone',
  Message: 'Message',
  Attachment: 'Attachment',
  Notification: 'Notification',
  AnalyticsData: 'AnalyticsData',
  Review: 'Review'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
