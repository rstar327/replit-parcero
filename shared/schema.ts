import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  bio: text("bio"),
  avatar: text("avatar"),
  country: text("country"), // ISO country code (e.g., "US", "MX", "CA")
  role: text("role").notNull().default("student"), // student, instructor, admin, superadmin
  tokenBalance: decimal("token_balance", { precision: 18, scale: 8 }).default("0"),
  walletAddress: text("wallet_address"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"), // active, canceled, past_due, etc.
  subscriptionPlan: text("subscription_plan"), // plus, pro, vip
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: json("content"), // Rich content from Strapi
  instructorId: varchar("instructor_id").references(() => users.id),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  duration: integer("duration"), // in minutes
  price: decimal("price", { precision: 18, scale: 8 }).default("0"), // Cost in tokens to enroll
  tokenReward: decimal("token_reward", { precision: 18, scale: 8 }).default("0"),
  completionReward: decimal("completion_reward", { precision: 18, scale: 8 }).default("0"),
  quizReward: decimal("quiz_reward", { precision: 18, scale: 8 }).default("0"),
  isPublished: boolean("is_published").default(false),
  language: text("language").notNull().default("en"), // en, es, pt, etc.
  strapiId: text("strapi_id"), // Reference to Strapi content
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id),
  title: text("title").notNull(),
  content: json("content"), // Rich content from Strapi
  exercise: json("exercise"), // Fill-in-the-blank exercise data (backward compatibility)
  exercises: json("exercises"), // Array of multiple exercises
  orderIndex: integer("order_index").notNull(),
  duration: integer("duration"), // in minutes
  tokenReward: decimal("token_reward", { precision: 18, scale: 8 }).default("0"),
  strapiId: text("strapi_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  moduleId: varchar("module_id").references(() => courseModules.id),
  completed: boolean("completed").default(false),
  progress: integer("progress").default(0), // percentage
  timeSpent: integer("time_spent").default(0), // in minutes
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tokenTransactions = pgTable("token_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(), // earned, spent, transfer
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  reason: text("reason").notNull(),
  courseId: varchar("course_id").references(() => courses.id),
  moduleId: varchar("module_id").references(() => courseModules.id),
  transactionHash: text("transaction_hash"), // Polygon transaction hash
  blockchainStatus: text("blockchain_status").default("pending"), // pending, confirmed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  moduleId: varchar("module_id").references(() => courseModules.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // discussion, question, answer
  parentId: varchar("parent_id").references((): any => communityPosts.id),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  metric: text("metric").notNull(), // daily_users, course_completions, tokens_distributed, revenue
  value: decimal("value", { precision: 18, scale: 2 }).notNull(),
  metadata: json("metadata"), // Additional context data
  createdAt: timestamp("created_at").defaultNow(),
});

// CMS Pages for content management with multi-language support
export const cmsPages = pgTable("cms_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: json("content").notNull(), // Rich content editor data with YouTube video support
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  status: text("status").notNull().default("draft"), // draft, published, archived
  language: text("language").notNull().default("en"), // en, es, pt, etc.
  authorId: varchar("author_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Multi-language content translations
export const pageTranslations = pgTable("page_translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").references(() => cmsPages.id),
  language: text("language").notNull(), // es, pt, etc.
  title: text("title").notNull(),
  content: json("content").notNull(),
  excerpt: text("excerpt"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course translations for multi-language course support
export const courseTranslations = pgTable("course_translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id),
  language: text("language").notNull(), // es, pt, etc.
  title: text("title").notNull(),
  description: text("description"),
  content: json("content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin activity logs for tracking changes
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => users.id),
  action: text("action").notNull(), // create, update, delete, login, etc.
  entityType: text("entity_type").notNull(), // user, course, page, etc.
  entityId: varchar("entity_id"),
  details: json("details"), // Additional details about the action
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced analytics for detailed reporting
export const detailedAnalytics = pgTable("detailed_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  category: text("category").notNull(), // user_activity, course_performance, financial, etc.
  metric: text("metric").notNull(),
  value: decimal("value", { precision: 18, scale: 8 }).notNull(),
  dimensions: json("dimensions"), // Additional categorization
  userId: varchar("user_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exerciseAnswers = pgTable("exercise_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  moduleId: varchar("module_id").references(() => courseModules.id),
  exerciseIndex: integer("exercise_index").notNull(), // Which exercise in the module (0, 1, 2, etc.)
  answers: json("answers").notNull(), // Array of user's answers
  isSubmitted: boolean("is_submitted").default(false),
  isCorrect: boolean("is_correct").default(false),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const moduleRatings = pgTable("module_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: varchar("module_id").references(() => courseModules.id).notNull(),
  rating: text("rating").notNull(), // "thumbs_up" or "thumbs_down"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseReviews = pgTable("course_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id),
  addresseeId: varchar("addressee_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, blocked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPosts = pgTable("user_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull().default("post"), // post, achievement, course_completion
  visibility: text("visibility").notNull().default("public"), // public, friends, private
  metadata: json("metadata"), // Additional data like course completed, tokens earned, etc.
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => userPosts.id),
  authorId: varchar("author_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User online status for live calling
export const userOnlineStatus = pgTable("user_online_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  socketId: text("socket_id"), // WebSocket connection ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Call requests for live exercises
export const callRequests = pgTable("call_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  moduleId: varchar("module_id").references(() => courseModules.id).notNull(),
  exerciseIndex: integer("exercise_index").notNull(),
  exerciseType: text("exercise_type").notNull().default("live_call"),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, expired, completed
  message: text("message"), // Optional message from requester
  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at").notNull(), // Auto-expire after some time
});

// Active call sessions
export const callSessions = pgTable("call_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => callRequests.id).notNull(),
  participant1Id: varchar("participant1_id").references(() => users.id).notNull(),
  participant2Id: varchar("participant2_id").references(() => users.id).notNull(),
  moduleId: varchar("module_id").references(() => courseModules.id).notNull(),
  exerciseIndex: integer("exercise_index").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default("active"), // active, completed, disconnected
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  participant1Joined: boolean("participant1_joined").default(false),
  participant2Joined: boolean("participant2_joined").default(false),
  actualDuration: integer("actual_duration"), // actual call duration in seconds
});

// Peer evaluations for live practice sessions
export const peerEvaluations = pgTable("peer_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => callSessions.id).notNull(),
  evaluatorId: varchar("evaluator_id").references(() => users.id).notNull(), // The peer who evaluates
  evaluatedUserId: varchar("evaluated_user_id").references(() => users.id).notNull(), // The user being evaluated
  moduleId: varchar("module_id").references(() => courseModules.id).notNull(),
  exerciseIndex: integer("exercise_index").notNull(),
  // Skill ratings (1-5)
  grammarRating: integer("grammar_rating").notNull(), // 1-5 stars
  vocabularyRating: integer("vocabulary_rating").notNull(), // 1-5 stars
  pronunciationRating: integer("pronunciation_rating").notNull(), // 1-5 stars
  // Evaluation outcome
  approved: boolean("approved").notNull(), // true = approved, false = needs more practice
  feedback: text("feedback").notNull(), // 140 character feedback
  createdAt: timestamp("created_at").defaultNow(),
});

// Magic tokens for email verification
export const magicTokens = pgTable("magic_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: varchar("token").notNull().unique(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  password: true,
  tokenBalance: true,
  walletAddress: true,
}).partial();

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Define exercise schema for fill-in-the-blank exercises
const fillInBlankExerciseSchema = z.object({
  type: z.literal("fill_in_blank").default("fill_in_blank"),
  text: z.string().min(1, "Exercise text is required"),
  blanks: z.array(z.object({
    position: z.number().min(0, "Position must be non-negative"),
    correctAnswer: z.string().optional(),
    placeholder: z.string().optional(),
    acceptsAnyAnswer: z.boolean().default(false)
  }).refine((data) => data.acceptsAnyAnswer || (data.correctAnswer && data.correctAnswer.length > 0), {
    message: "Either specify a correct answer or enable 'accepts any answer'",
  })).min(1, "At least one blank is required")
});

// Define live call exercise schema
const liveCallExerciseSchema = z.object({
  type: z.literal("live_call"),
  title: z.string().min(1, "Live call exercise title is required"),
  description: z.string().min(1, "Live call exercise description is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(60, "Duration cannot exceed 60 minutes"),
  instructions: z.string().optional(),
  topics: z.array(z.string()).optional(), // Discussion topics or conversation prompts
});

// Combined exercise schema
const exerciseSchema = z.discriminatedUnion("type", [
  fillInBlankExerciseSchema,
  liveCallExerciseSchema
]).optional();

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
}).extend({
  exercise: exerciseSchema
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
});

export const insertTokenTransactionSchema = createInsertSchema(tokenTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageTranslationSchema = createInsertSchema(pageTranslations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDetailedAnalyticsSchema = createInsertSchema(detailedAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPostSchema = createInsertSchema(userPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExerciseAnswerSchema = createInsertSchema(exerciseAnswers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModuleRatingSchema = createInsertSchema(moduleRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseReviewSchema = createInsertSchema(courseReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserOnlineStatusSchema = createInsertSchema(userOnlineStatus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCallRequestSchema = createInsertSchema(callRequests).omit({
  id: true,
  requestedAt: true,
});

export const insertCallSessionSchema = createInsertSchema(callSessions).omit({
  id: true,
  startedAt: true,
});

export const insertPeerEvaluationSchema = createInsertSchema(peerEvaluations).omit({
  id: true,
  createdAt: true,
}).extend({
  feedback: z.string().max(140, "Feedback must be 140 characters or less").min(1, "Feedback is required"),
  grammarRating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  vocabularyRating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  pronunciationRating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type CourseModule = typeof courseModules.$inferSelect;
export type Exercise = z.infer<typeof exerciseSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertTokenTransaction = z.infer<typeof insertTokenTransactionSchema>;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertPageTranslation = z.infer<typeof insertPageTranslationSchema>;
export type PageTranslation = typeof pageTranslations.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertDetailedAnalytics = z.infer<typeof insertDetailedAnalyticsSchema>;
export type DetailedAnalytics = typeof detailedAnalytics.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertUserPost = z.infer<typeof insertUserPostSchema>;
export type UserPost = typeof userPosts.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;
export type InsertExerciseAnswer = z.infer<typeof insertExerciseAnswerSchema>;
export type ExerciseAnswer = typeof exerciseAnswers.$inferSelect;
export type InsertModuleRating = z.infer<typeof insertModuleRatingSchema>;
export type ModuleRating = typeof moduleRatings.$inferSelect;
export type InsertCourseReview = z.infer<typeof insertCourseReviewSchema>;
export type CourseReview = typeof courseReviews.$inferSelect;
export type InsertUserOnlineStatus = z.infer<typeof insertUserOnlineStatusSchema>;
export type UserOnlineStatus = typeof userOnlineStatus.$inferSelect;
export type InsertCallRequest = z.infer<typeof insertCallRequestSchema>;
export type CallRequest = typeof callRequests.$inferSelect;
export type InsertCallSession = z.infer<typeof insertCallSessionSchema>;
export type CallSession = typeof callSessions.$inferSelect;
export type InsertPeerEvaluation = z.infer<typeof insertPeerEvaluationSchema>;
export type PeerEvaluation = typeof peerEvaluations.$inferSelect;
