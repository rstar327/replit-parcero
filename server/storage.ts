import { 
  type User, 
  type InsertUser, 
  type UpdateUserProfile,
  type Course,
  type InsertCourse,
  type CourseModule,
  type InsertCourseModule,
  type UserProgress,
  type InsertUserProgress,
  type TokenTransaction,
  type InsertTokenTransaction,
  type CommunityPost,
  type InsertCommunityPost,
  type Analytics,
  type InsertAnalytics,
  type Friendship,
  type InsertFriendship,
  type UserPost,
  type InsertUserPost,
  type PostComment,
  type InsertPostComment,
  type CmsPage,
  type InsertCmsPage,
  type AdminLog,
  type InsertAdminLog,
  type DetailedAnalytics,
  type InsertDetailedAnalytics,
  type ExerciseAnswer,
  type InsertExerciseAnswer,
  type UserOnlineStatus,
  type InsertUserOnlineStatus,
  type CallRequest,
  type InsertCallRequest,
  type CallSession,
  type InsertCallSession,
  type ModuleRating,
  type InsertModuleRating,
  type CourseReview,
  type InsertCourseReview,
  type PeerEvaluation,
  type InsertPeerEvaluation,
  users,
  courses,
  courseModules,
  userProgress,
  tokenTransactions,
  communityPosts,
  analytics,
  friendships,
  userPosts,
  postComments,
  cmsPages,
  courseTranslations,
  adminLogs,
  detailedAnalytics,
  exerciseAnswers,
  moduleRatings,
  courseReviews,
  userOnlineStatus,
  callRequests,
  callSessions,
  peerEvaluations,
  magicTokens
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql, like, or, gte, lte } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Courses
  getCourse(id: string): Promise<Course | undefined>;
  getCoursesByInstructor(instructorId: string): Promise<Course[]>;
  getAllCourses(): Promise<Course[]>;
  getPublishedCourses(): Promise<Course[]>;
  getEnrolledCourses(userId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  // Course Translations
  getCourseTranslations(courseId: string): Promise<any[]>;
  getAllCourseTranslations(): Promise<any[]>;
  createOrUpdateCourseTranslation(translation: any): Promise<any>;

  // Course Modules
  getModule(id: string): Promise<CourseModule | undefined>;
  getAllModules(): Promise<CourseModule[]>;
  getModulesByCourse(courseId: string): Promise<CourseModule[]>;
  createModule(module: InsertCourseModule): Promise<CourseModule>;
  updateModule(id: string, updates: Partial<CourseModule>): Promise<CourseModule | undefined>;
  deleteModule(id: string): Promise<boolean>;

  // User Progress
  getUserProgress(userId: string, courseId: string): Promise<UserProgress[]>;
  getUserProgressByModule(userId: string, moduleId: string): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: string, updates: Partial<UserProgress>): Promise<UserProgress | undefined>;

  // Token Transactions
  getTokenTransactionsByUser(userId: string): Promise<TokenTransaction[]>;
  createTokenTransaction(transaction: InsertTokenTransaction): Promise<TokenTransaction>;
  updateTokenTransaction(id: string, updates: Partial<TokenTransaction>): Promise<TokenTransaction | undefined>;

  // Enrollment
  enrollUserInCourse(userId: string, courseId: string): Promise<{ success: boolean; message: string; newBalance?: string }>;
  isUserEnrolledInCourse(userId: string, courseId: string): Promise<boolean>;
  getCourseCompletion(userId: string, courseId: string): Promise<{ isCompleted: boolean; completedModules: number; totalModules: number }>;

  // Community Posts
  getCommunityPosts(courseId?: string): Promise<CommunityPost[]>;
  searchCommunityPosts(query: string): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost | undefined>;
  deleteCommunityPost(id: string): Promise<boolean>;

  // Analytics
  getAnalytics(metric: string, startDate: Date, endDate: Date): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeLearners: number;
    totalCourses: number;
    tokensDistributed: string;
    revenue: string;
  }>;

  // Friendships
  createFriendship(friendship: InsertFriendship): Promise<Friendship>;
  getFriendshipStatus(requesterId: string, addresseeId: string): Promise<Friendship | undefined>;
  updateFriendshipStatus(id: string, status: string): Promise<Friendship | undefined>;
  getUserFriends(userId: string): Promise<User[]>;

  // User Posts
  createUserPost(post: InsertUserPost): Promise<UserPost>;
  getUserPosts(userId: string): Promise<UserPost[]>;
  getUserPostsWithComments(userId: string): Promise<any[]>;

  // Post Comments
  createPostComment(comment: InsertPostComment): Promise<PostComment>;
  getPostComments(postId: string): Promise<PostComment[]>;

  // CMS Pages
  createCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  getCmsPage(id: string): Promise<CmsPage | undefined>;
  getCmsPageBySlug(slug: string): Promise<CmsPage | undefined>;
  getAllCmsPages(): Promise<CmsPage[]>;
  getPublishedCmsPages(): Promise<CmsPage[]>;
  updateCmsPage(id: string, updates: Partial<CmsPage>): Promise<CmsPage | undefined>;
  deleteCmsPage(id: string): Promise<boolean>;

  // Admin Logs
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  getAdminLogsByUser(adminId: string): Promise<AdminLog[]>;

  // Detailed Analytics
  createDetailedAnalytics(analytics: InsertDetailedAnalytics): Promise<DetailedAnalytics>;
  getDetailedAnalytics(category: string, startDate?: Date, endDate?: Date): Promise<DetailedAnalytics[]>;
  getAnalyticsSummary(): Promise<{
    totalRevenue: string;
    monthlyRevenue: string;
    totalTokensDistributed: string;
    monthlyTokensDistributed: string;
    userGrowth: number;
    courseCompletions: number;
    activeSubscriptions: number;
  }>;

  // SuperAdmin User Management
  getUsersWithPagination(page: number, limit: number, search?: string): Promise<{
    users: User[];
    total: number;
    totalPages: number;
  }>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;
  deleteUser(userId: string): Promise<boolean>;

  // CMS Methods
  getAllCmsPages(language?: string): Promise<CmsPage[]>;
  getCmsPageBySlug(slug: string): Promise<CmsPage | undefined>;
  createCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  updateCmsPage(id: string, updates: Partial<CmsPage>): Promise<CmsPage | undefined>;
  deleteCmsPage(id: string): Promise<boolean>;

  // Exercise Answers
  getExerciseAnswer(userId: string, moduleId: string, exerciseIndex: number): Promise<ExerciseAnswer | undefined>;
  saveExerciseAnswer(answer: InsertExerciseAnswer): Promise<ExerciseAnswer>;
  updateExerciseAnswer(id: string, updates: Partial<ExerciseAnswer>): Promise<ExerciseAnswer | undefined>;

  // Live Calling - User Online Status
  updateUserOnlineStatus(userId: string, isOnline: boolean, socketId?: string): Promise<UserOnlineStatus>;
  getOnlineUsers(): Promise<(User & { isOnline: boolean })[]>;
  getUserOnlineStatus(userId: string): Promise<UserOnlineStatus | undefined>;

  // Live Calling - Call Requests
  createCallRequest(request: InsertCallRequest): Promise<CallRequest>;
  getCallRequest(id: string): Promise<CallRequest | undefined>;
  updateCallRequestStatus(id: string, status: string): Promise<CallRequest | undefined>;
  getUserCallRequests(userId: string): Promise<CallRequest[]>;

  // Live Calling - Call Sessions
  createCallSession(session: InsertCallSession): Promise<CallSession>;
  getCallSession(id: string): Promise<CallSession | undefined>;
  endCallSession(id: string): Promise<CallSession | undefined>;
  getUserActiveSessions(userId: string): Promise<CallSession[]>;

  // Module Ratings
  rateModule(userId: string, moduleId: string, rating: "thumbs_up" | "thumbs_down"): Promise<ModuleRating>;
  getModuleRatings(moduleId: string): Promise<{ thumbsUp: number; thumbsDown: number; userRating?: string }>;
  getUserModuleRating(userId: string, moduleId: string): Promise<string | null>;

  // Course Reviews
  createCourseReview(userId: string, courseId: string, rating: number, comment?: string): Promise<CourseReview>;
  getCourseReviews(courseId: string): Promise<CourseReview[]>;
  getCourseRatingStats(courseId: string): Promise<{ 
    averageRating: number; 
    totalReviews: number; 
    ratingDistribution: { [key: number]: number };
  }>;
  getUserCourseReview(userId: string, courseId: string): Promise<CourseReview | null>;

  // Peer Evaluations
  createPeerEvaluation(evaluation: InsertPeerEvaluation): Promise<PeerEvaluation>;
  getUserPeerEvaluations(userId: string, moduleId: string): Promise<PeerEvaluation[]>;

  // Magic Tokens for Authentication
  createMagicToken(token: string, email: string, expiresAt: Date): Promise<void>;
  getMagicToken(token: string): Promise<{ email: string; expiresAt: Date } | null>;
  deleteMagicToken(token: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;

  // User ID Migration
  migrateUserIdsToSequential(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Generate the next sequential user ID
    const existingUsers = await db.select({ id: users.id }).from(users)
      .where(sql`${users.id} ~ '^user-[0-9]+$'`)
      .orderBy(sql`CAST(SUBSTRING(${users.id} FROM 6) AS INTEGER) DESC`)
      .limit(1);
    
    let nextUserId = 'user-1';
    if (existingUsers.length > 0) {
      const lastUserId = existingUsers[0].id;
      const lastNumber = parseInt(lastUserId.replace('user-', ''));
      nextUserId = `user-${lastNumber + 1}`;
    }

    const [user] = await db.insert(users).values({
      id: nextUserId,
      email: insertUser.email,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName,
      bio: insertUser.bio,
      avatar: insertUser.avatar,
      role: insertUser.role || 'student',
      tokenBalance: insertUser.tokenBalance || "0",
      walletAddress: insertUser.walletAddress,
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Course methods
  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.instructorId, instructorId));
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getPublishedCourses(): Promise<Course[]> {
    return await db.select().from(courses)
      .where(eq(courses.isPublished, true))
      .orderBy(desc(courses.createdAt));
  }

  async getEnrolledCourses(userId: string): Promise<Course[]> {
    return await db.select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      content: courses.content,
      instructorId: courses.instructorId,
      category: courses.category,
      difficulty: courses.difficulty,
      duration: courses.duration,
      tokenReward: courses.tokenReward,
      completionReward: courses.completionReward,
      quizReward: courses.quizReward,
      price: courses.price,
      isPublished: courses.isPublished,
      language: courses.language,
      strapiId: courses.strapiId,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt
    })
    .from(courses)
    .innerJoin(userProgress, eq(courses.id, userProgress.courseId))
    .where(eq(userProgress.userId, userId))
    .orderBy(desc(courses.createdAt));
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined> {
    const [course] = await db.update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      // First delete all modules belonging to this course
      await db.delete(courseModules).where(eq(courseModules.courseId, id));
      // Then delete all progress records for this course
      await db.delete(userProgress).where(eq(userProgress.courseId, id));
      // Finally delete the course itself
      await db.delete(courses).where(eq(courses.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      return false;
    }
  }

  // Course Translation methods
  async getCourseTranslations(courseId: string): Promise<any[]> {
    return await db.select().from(courseTranslations).where(eq(courseTranslations.courseId, courseId));
  }

  async getAllCourseTranslations(): Promise<any[]> {
    return await db.select().from(courseTranslations);
  }

  async createOrUpdateCourseTranslation(translation: any): Promise<any> {
    const { courseId, language, title, description } = translation;
    
    // Check if translation already exists
    const [existing] = await db.select().from(courseTranslations)
      .where(and(eq(courseTranslations.courseId, courseId), eq(courseTranslations.language, language)));
    
    if (existing) {
      // Update existing translation
      const [updated] = await db.update(courseTranslations)
        .set({ title, description, updatedAt: new Date() })
        .where(and(eq(courseTranslations.courseId, courseId), eq(courseTranslations.language, language)))
        .returning();
      return updated;
    } else {
      // Create new translation
      const [created] = await db.insert(courseTranslations)
        .values({ courseId, language, title, description })
        .returning();
      return created;
    }
  }

  // Course Module methods
  async getModule(id: string): Promise<CourseModule | undefined> {
    const [module] = await db.select().from(courseModules).where(eq(courseModules.id, id));
    return module;
  }

  async getAllModules(): Promise<CourseModule[]> {
    return await db.select().from(courseModules).orderBy(courseModules.orderIndex);
  }

  async getModulesByCourse(courseId: string): Promise<CourseModule[]> {
    return await db.select().from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(courseModules.orderIndex);
  }

  async createModule(insertModule: InsertCourseModule): Promise<CourseModule> {
    const [module] = await db.insert(courseModules).values(insertModule).returning();
    return module;
  }

  async updateModule(id: string, updates: Partial<CourseModule>): Promise<CourseModule | undefined> {
    const [module] = await db.update(courseModules)
      .set(updates)
      .where(eq(courseModules.id, id))
      .returning();
    return module;
  }

  async deleteModule(id: string): Promise<boolean> {
    try {
      console.log('Storage: Deleting progress records for module:', id);
      // First delete all progress records for this module
      const progressResult = await db.delete(userProgress).where(eq(userProgress.moduleId, id));
      console.log('Storage: Deleted progress records:', progressResult);
      
      console.log('Storage: Deleting module:', id);
      // Then delete the module itself
      const moduleResult = await db.delete(courseModules).where(eq(courseModules.id, id));
      console.log('Storage: Delete module result:', moduleResult);
      
      // Check if any rows were actually deleted (for some db drivers, rowCount is available)
      return true;
    } catch (error) {
      console.error('Storage: Error deleting module:', error);
      return false;
    }
  }

  // User Progress methods
  async getUserProgress(userId: string, courseId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.courseId, courseId)));
  }

  async getUserProgressByModule(userId: string, moduleId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId)));
    return progress;
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values(insertProgress).returning();
    return progress;
  }

  async updateUserProgress(id: string, updates: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const [progress] = await db.update(userProgress)
      .set(updates)
      .where(eq(userProgress.id, id))
      .returning();
    return progress;
  }

  // Token Transaction methods
  async getTokenTransactionsByUser(userId: string): Promise<TokenTransaction[]> {
    return await db.select().from(tokenTransactions)
      .where(eq(tokenTransactions.userId, userId))
      .orderBy(desc(tokenTransactions.createdAt));
  }

  async createTokenTransaction(insertTransaction: InsertTokenTransaction): Promise<TokenTransaction> {
    const [transaction] = await db.insert(tokenTransactions).values(insertTransaction).returning();
    return transaction;
  }

  async updateTokenTransaction(id: string, updates: Partial<TokenTransaction>): Promise<TokenTransaction | undefined> {
    const [transaction] = await db.update(tokenTransactions)
      .set(updates)
      .where(eq(tokenTransactions.id, id))
      .returning();
    return transaction;
  }

  // Enrollment methods
  async enrollUserInCourse(userId: string, courseId: string): Promise<{ success: boolean; message: string; newBalance?: string }> {
    try {
      // Get user and course information
      const user = await this.getUser(userId);
      const course = await this.getCourse(courseId);

      if (!user) {
        return { success: false, message: "User not found" };
      }
      if (!course) {
        return { success: false, message: "Course not found" };
      }

      const currentBalance = parseFloat((user.tokenBalance || "0").toString());
      const coursePrice = parseFloat((course.price || "0").toString());

      // Check if user has sufficient tokens
      if (currentBalance < coursePrice) {
        return { 
          success: false, 
          message: `Insufficient tokens. You need ${coursePrice} tokens but only have ${currentBalance}.` 
        };
      }

      // Check if user is already enrolled
      const existingProgress = await db.select().from(userProgress)
        .where(and(
          eq(userProgress.userId, userId),
          eq(userProgress.courseId, courseId)
        ));

      if (existingProgress.length > 0) {
        return { success: false, message: "Already enrolled in this course" };
      }

      // Calculate new balance
      const newBalance = (currentBalance - coursePrice).toString();

      // Start transaction to ensure atomicity
      await db.transaction(async (tx) => {
        // Deduct tokens from user balance
        await tx.update(users)
          .set({ 
            tokenBalance: newBalance,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));

        // Create token transaction record
        await tx.insert(tokenTransactions).values({
          userId,
          type: "spent",
          amount: coursePrice.toString(),
          reason: `Course enrollment: ${course.title}`,
          courseId,
        });

        // Create user progress record for enrollment
        await tx.insert(userProgress).values({
          userId,
          courseId,
          completed: false,
          progress: 0,
        });
      });

      return { 
        success: true, 
        message: "Successfully enrolled in course", 
        newBalance 
      };

    } catch (error) {
      console.error("Enrollment error:", error);
      return { success: false, message: "Failed to enroll in course" };
    }
  }

  async isUserEnrolledInCourse(userId: string, courseId: string): Promise<boolean> {
    const existingProgress = await db.select().from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.courseId, courseId)
      ));
    return existingProgress.length > 0;
  }

  async getCourseCompletion(userId: string, courseId: string): Promise<{ isCompleted: boolean; completedModules: number; totalModules: number }> {
    // Get all modules for this course
    const courseModulesList = await db.select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId));
    
    const totalModules = courseModulesList.length;
    
    // Get user progress for all modules in this course
    const progressList = await db.select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.courseId, courseId)
      ));
    
    // Count completed modules (progress >= 100 or completed = true)
    const completedModules = progressList.filter(progress => 
      progress.completed === true || (progress.progress !== null && progress.progress >= 100)
    ).length;
    
    const isCompleted = totalModules > 0 && completedModules === totalModules;
    
    return {
      isCompleted,
      completedModules,
      totalModules
    };
  }

  // Community Post methods
  async getCommunityPosts(courseId?: string, moduleId?: string): Promise<any[]> {
    const baseQuery = db.select({
      id: communityPosts.id,
      title: communityPosts.title,
      content: communityPosts.content,
      authorId: communityPosts.authorId,
      authorName: sql<string>`COALESCE(${users.fullName}, ${users.username})`.as('authorName'),
      authorAvatar: users.avatar,
      courseId: communityPosts.courseId,
      moduleId: communityPosts.moduleId,
      parentId: communityPosts.parentId,
      createdAt: communityPosts.createdAt,
      updatedAt: communityPosts.updatedAt
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.authorId, users.id));
    
    if (moduleId) {
      return await baseQuery
        .where(eq(communityPosts.moduleId, moduleId))
        .orderBy(desc(communityPosts.createdAt));
    } else if (courseId) {
      return await baseQuery
        .where(eq(communityPosts.courseId, courseId))
        .orderBy(desc(communityPosts.createdAt));
    }
    
    return await baseQuery.orderBy(desc(communityPosts.createdAt));
  }

  async searchCommunityPosts(query: string): Promise<CommunityPost[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(communityPosts)
      .where(
        or(
          sql`LOWER(${communityPosts.title}) LIKE ${searchTerm}`,
          sql`LOWER(${communityPosts.content}) LIKE ${searchTerm}`
        )
      )
      .orderBy(desc(communityPosts.createdAt))
      .limit(10);
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const [post] = await db.insert(communityPosts).values(insertPost).returning();
    return post;
  }

  async updateCommunityPost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost | undefined> {
    const [post] = await db.update(communityPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(communityPosts.id, id))
      .returning();
    return post;
  }

  async deleteCommunityPost(id: string): Promise<boolean> {
    try {
      // First, delete all replies to this post (and their sub-replies)
      await db.delete(communityPosts).where(eq(communityPosts.parentId, id));
      
      // Get all first-level replies to delete their sub-replies too
      const replies = await db.select().from(communityPosts).where(eq(communityPosts.parentId, id));
      for (const reply of replies) {
        await db.delete(communityPosts).where(eq(communityPosts.parentId, reply.id));
      }
      
      // Finally, delete the main post
      const result = await db.delete(communityPosts).where(eq(communityPosts.id, id));
      console.log('Delete result:', result);
      return true; // Assume success if no error is thrown
    } catch (error) {
      console.error('Error deleting community post:', error);
      return false;
    }
  }

  // Module Rating methods
  async rateModule(userId: string, moduleId: string, rating: "thumbs_up" | "thumbs_down"): Promise<ModuleRating> {
    // Check if user already rated this module
    const existingRating = await db.select().from(moduleRatings)
      .where(and(eq(moduleRatings.userId, userId), eq(moduleRatings.moduleId, moduleId)));
    
    if (existingRating.length > 0) {
      // Update existing rating
      const [updatedRating] = await db.update(moduleRatings)
        .set({ rating, updatedAt: new Date() })
        .where(and(eq(moduleRatings.userId, userId), eq(moduleRatings.moduleId, moduleId)))
        .returning();
      return updatedRating;
    } else {
      // Create new rating
      const [newRating] = await db.insert(moduleRatings)
        .values({ userId, moduleId, rating })
        .returning();
      return newRating;
    }
  }

  async getModuleRatings(moduleId: string): Promise<{ thumbsUp: number; thumbsDown: number; userRating?: string }> {
    const ratings = await db.select({
      rating: moduleRatings.rating,
      count: sql<number>`count(*)`.as('count')
    })
    .from(moduleRatings)
    .where(eq(moduleRatings.moduleId, moduleId))
    .groupBy(moduleRatings.rating);

    let thumbsUp = 0;
    let thumbsDown = 0;

    ratings.forEach(r => {
      if (r.rating === 'thumbs_up') thumbsUp = Number(r.count);
      if (r.rating === 'thumbs_down') thumbsDown = Number(r.count);
    });

    return { thumbsUp, thumbsDown };
  }

  async getUserModuleRating(userId: string, moduleId: string): Promise<string | null> {
    const [rating] = await db.select().from(moduleRatings)
      .where(and(eq(moduleRatings.userId, userId), eq(moduleRatings.moduleId, moduleId)));
    
    return rating?.rating || null;
  }

  // Course Review methods
  async createCourseReview(userId: string, courseId: string, rating: number, comment?: string): Promise<CourseReview> {
    // Check if user already reviewed this course
    const existingReview = await db.select().from(courseReviews)
      .where(and(eq(courseReviews.userId, userId), eq(courseReviews.courseId, courseId)));
    
    if (existingReview.length > 0) {
      // Update existing review
      const [updatedReview] = await db.update(courseReviews)
        .set({ rating, comment, updatedAt: new Date() })
        .where(and(eq(courseReviews.userId, userId), eq(courseReviews.courseId, courseId)))
        .returning();
      return updatedReview;
    } else {
      // Create new review
      const [newReview] = await db.insert(courseReviews)
        .values({ userId, courseId, rating, comment })
        .returning();
      return newReview;
    }
  }

  async getCourseReviews(courseId: string): Promise<CourseReview[]> {
    return await db.select({
      id: courseReviews.id,
      userId: courseReviews.userId,
      courseId: courseReviews.courseId,
      rating: courseReviews.rating,
      comment: courseReviews.comment,
      createdAt: courseReviews.createdAt,
      updatedAt: courseReviews.updatedAt,
      username: users.username,
      fullName: users.fullName,
      avatar: users.avatar
    })
    .from(courseReviews)
    .leftJoin(users, eq(courseReviews.userId, users.id))
    .where(eq(courseReviews.courseId, courseId))
    .orderBy(desc(courseReviews.createdAt));
  }

  async getCourseRatingStats(courseId: string): Promise<{ 
    averageRating: number; 
    totalReviews: number; 
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await db.select({
      rating: courseReviews.rating,
      count: sql<number>`count(*)`.as('count')
    })
    .from(courseReviews)
    .where(eq(courseReviews.courseId, courseId))
    .groupBy(courseReviews.rating);

    let totalReviews = 0;
    let totalRating = 0;
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach(r => {
      const count = Number(r.count);
      totalReviews += count;
      totalRating += r.rating * count;
      ratingDistribution[r.rating] = count;
    });

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return { averageRating, totalReviews, ratingDistribution };
  }

  async getUserCourseReview(userId: string, courseId: string): Promise<CourseReview | null> {
    const [review] = await db.select().from(courseReviews)
      .where(and(eq(courseReviews.userId, userId), eq(courseReviews.courseId, courseId)));
    
    return review || null;
  }

  // Analytics methods
  async getAnalytics(metric: string, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return await db.select().from(analytics)
      .where(and(
        eq(analytics.metric, metric),
        // TODO: Add date range filtering
      ))
      .orderBy(desc(analytics.date));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analyticsRecord] = await db.insert(analytics).values(insertAnalytics).returning();
    return analyticsRecord;
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeLearners: number;
    totalCourses: number;
    tokensDistributed: string;
    revenue: string;
  }> {
    // Get total users
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(users);
    
    // Get total courses
    const [{ totalCourses }] = await db.select({ totalCourses: count() })
      .from(courses)
      .where(eq(courses.isPublished, true));
    
    // Enhanced with token distribution calculation
    const tokenResult = await db.select({
      total: sql`COALESCE(SUM(CAST(${tokenTransactions.amount} AS DECIMAL)), 0)`.as('total')
    })
    .from(tokenTransactions)
    .where(eq(tokenTransactions.type, 'earned'));
    
    const tokensDistributed = tokenResult[0]?.total || "0";

    return {
      totalUsers: totalUsers || 0,
      activeLearners: Math.floor(totalUsers * 0.7), // Estimate 70% active
      totalCourses: totalCourses || 0,
      tokensDistributed: tokensDistributed.toString(),
      revenue: "0" // TODO: Integrate with Stripe for real revenue
    };
  }

  // Friendship operations
  async createFriendship(friendship: InsertFriendship): Promise<Friendship> {
    const [newFriendship] = await db.insert(friendships).values(friendship).returning();
    return newFriendship;
  }

  async getFriendshipStatus(requesterId: string, addresseeId: string): Promise<Friendship | undefined> {
    const [friendship] = await db.select().from(friendships)
      .where(
        or(
          and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)),
          and(eq(friendships.requesterId, addresseeId), eq(friendships.addresseeId, requesterId))
        )
      );
    return friendship;
  }

  async updateFriendshipStatus(id: string, status: string): Promise<Friendship | undefined> {
    const [friendship] = await db.update(friendships)
      .set({ status, updatedAt: new Date() })
      .where(eq(friendships.id, id))
      .returning();
    return friendship;
  }

  async getUserFriends(userId: string): Promise<User[]> {
    const friendshipResults = await db.select({
      friendId: sql`CASE 
        WHEN ${friendships.requesterId} = ${userId} THEN ${friendships.addresseeId}
        ELSE ${friendships.requesterId}
      END`.as('friendId')
    })
    .from(friendships)
    .where(
      and(
        eq(friendships.status, 'accepted'),
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId)
        )
      )
    );

    const friendIds = friendshipResults.map(f => f.friendId);
    if (friendIds.length === 0) return [];

    if (friendIds.length === 0) return [];
    return await db.select().from(users);
  }

  // User posts operations
  async createUserPost(post: InsertUserPost): Promise<UserPost> {
    const [newPost] = await db.insert(userPosts).values(post).returning();
    return newPost;
  }

  async getUserPosts(userId: string): Promise<UserPost[]> {
    return await db.select().from(userPosts)
      .where(eq(userPosts.authorId, userId))
      .orderBy(desc(userPosts.createdAt));
  }

  async getUserPostsWithComments(userId: string): Promise<any[]> {
    const posts = await this.getUserPosts(userId);
    const postsWithComments = [];

    for (const post of posts) {
      const comments = await db.select({
        id: postComments.id,
        content: postComments.content,
        createdAt: postComments.createdAt,
        author: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.authorId, users.id))
      .where(eq(postComments.postId, post.id))
      .orderBy(postComments.createdAt);

      postsWithComments.push({
        ...post,
        comments
      });
    }

    return postsWithComments;
  }

  // Post comments operations
  async createPostComment(comment: InsertPostComment): Promise<PostComment> {
    const [newComment] = await db.insert(postComments).values(comment).returning();
    return newComment;
  }

  async getPostComments(postId: string): Promise<PostComment[]> {
    return await db.select().from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);
  }

  // CMS Pages implementation
  async createCmsPage(insertPage: InsertCmsPage): Promise<CmsPage> {
    const [page] = await db.insert(cmsPages).values(insertPage).returning();
    return page;
  }

  async getCmsPage(id: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.id, id));
    return page;
  }

  async getCmsPageBySlug(slug: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    return page;
  }

  async getAllCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages).orderBy(desc(cmsPages.updatedAt));
  }

  async getPublishedCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages)
      .where(eq(cmsPages.status, 'published'))
      .orderBy(desc(cmsPages.publishedAt));
  }

  async updateCmsPage(id: string, updates: Partial<CmsPage>): Promise<CmsPage | undefined> {
    const [page] = await db.update(cmsPages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cmsPages.id, id))
      .returning();
    return page;
  }

  async deleteCmsPage(id: string): Promise<boolean> {
    try {
      await db.delete(cmsPages).where(eq(cmsPages.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting CMS page:', error);
      return false;
    }
  }

  // Admin Logs implementation
  async createAdminLog(insertLog: InsertAdminLog): Promise<AdminLog> {
    const [log] = await db.insert(adminLogs).values(insertLog).returning();
    return log;
  }

  async getAdminLogs(limit: number = 100): Promise<AdminLog[]> {
    return await db.select().from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit);
  }

  async getAdminLogsByUser(adminId: string): Promise<AdminLog[]> {
    return await db.select().from(adminLogs)
      .where(eq(adminLogs.adminId, adminId))
      .orderBy(desc(adminLogs.createdAt));
  }

  // Detailed Analytics implementation
  async createDetailedAnalytics(insertAnalytics: InsertDetailedAnalytics): Promise<DetailedAnalytics> {
    const [analyticsRecord] = await db.insert(detailedAnalytics).values(insertAnalytics).returning();
    return analyticsRecord;
  }

  async getDetailedAnalytics(category: string, startDate?: Date, endDate?: Date): Promise<DetailedAnalytics[]> {
    if (startDate && endDate) {
      return await db.select().from(detailedAnalytics)
        .where(
          and(
            eq(detailedAnalytics.category, category),
            gte(detailedAnalytics.date, startDate),
            lte(detailedAnalytics.date, endDate)
          )
        )
        .orderBy(desc(detailedAnalytics.date));
    }

    return await db.select().from(detailedAnalytics)
      .where(eq(detailedAnalytics.category, category))
      .orderBy(desc(detailedAnalytics.date));
  }

  async getAnalyticsSummary(): Promise<{
    totalRevenue: string;
    monthlyRevenue: string;
    totalTokensDistributed: string;
    monthlyTokensDistributed: string;
    userGrowth: number;
    courseCompletions: number;
    activeSubscriptions: number;
  }> {
    // Get basic user counts
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(users);
    
    // Get active subscriptions count
    const [{ activeSubscriptions }] = await db.select({ activeSubscriptions: count() })
      .from(users)
      .where(eq(users.subscriptionStatus, 'active'));

    // Get total tokens distributed
    const tokenTransactionsResult = await db.select({
      total: sql`COALESCE(SUM(CAST(${tokenTransactions.amount} AS DECIMAL)), 0)`.as('total')
    })
    .from(tokenTransactions)
    .where(eq(tokenTransactions.type, 'earned'));
    
    const totalTokensDistributed = tokenTransactionsResult[0]?.total || "0";

    // For now, return basic calculated stats - can be enhanced with real financial data
    return {
      totalRevenue: "0", // TODO: Implement with Stripe data
      monthlyRevenue: "0", // TODO: Implement with Stripe data
      totalTokensDistributed: totalTokensDistributed.toString(),
      monthlyTokensDistributed: "0", // TODO: Implement with date filtering
      userGrowth: totalUsers || 0,
      courseCompletions: 0, // TODO: Calculate from user progress
      activeSubscriptions: activeSubscriptions || 0
    };
  }

  // SuperAdmin User Management implementation
  async getUsersWithPagination(page: number, limit: number, search?: string): Promise<{
    users: User[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    
    let userQuery = db.select().from(users);
    let countQuery = db.select({ count: count() }).from(users);
    
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      const searchCondition = or(
        sql`LOWER(${users.username}) LIKE ${searchTerm}`,
        sql`LOWER(${users.email}) LIKE ${searchTerm}`,
        sql`LOWER(${users.fullName}) LIKE ${searchTerm}`
      );
      userQuery = userQuery.where(searchCondition);
      countQuery = countQuery.where(searchCondition);
    }
    
    const [usersData, totalData] = await Promise.all([
      userQuery.orderBy(desc(users.createdAt)).limit(limit).offset(offset),
      countQuery
    ]);
    
    const total = totalData[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);
    
    return {
      users: usersData,
      total,
      totalPages
    };
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Delete the user from the database
      const result = await db.delete(users)
        .where(eq(users.id, userId));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Exercise Answer methods
  async getExerciseAnswer(userId: string, moduleId: string, exerciseIndex: number): Promise<ExerciseAnswer | undefined> {
    const [answer] = await db.select().from(exerciseAnswers)
      .where(and(
        eq(exerciseAnswers.userId, userId),
        eq(exerciseAnswers.moduleId, moduleId),
        eq(exerciseAnswers.exerciseIndex, exerciseIndex)
      ));
    return answer;
  }

  async saveExerciseAnswer(insertAnswer: InsertExerciseAnswer): Promise<ExerciseAnswer> {
    // Check if answer already exists
    const existing = await this.getExerciseAnswer(
      insertAnswer.userId!, 
      insertAnswer.moduleId!, 
      insertAnswer.exerciseIndex!
    );

    if (existing) {
      // Update existing answer
      const [updated] = await db.update(exerciseAnswers)
        .set({ 
          ...insertAnswer, 
          updatedAt: new Date() 
        })
        .where(eq(exerciseAnswers.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new answer
      const [answer] = await db.insert(exerciseAnswers).values(insertAnswer).returning();
      return answer;
    }
  }

  async updateExerciseAnswer(id: string, updates: Partial<ExerciseAnswer>): Promise<ExerciseAnswer | undefined> {
    const [answer] = await db.update(exerciseAnswers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(exerciseAnswers.id, id))
      .returning();
    return answer;
  }

  // Live Calling - User Online Status Methods
  async updateUserOnlineStatus(userId: string, isOnline: boolean, socketId?: string): Promise<UserOnlineStatus> {
    try {
      // Check if user already has an online status record
      const [existingStatus] = await db.select().from(userOnlineStatus).where(eq(userOnlineStatus.userId, userId));
      
      if (existingStatus) {
        // Update existing record
        const [updatedStatus] = await db.update(userOnlineStatus)
          .set({ 
            isOnline, 
            lastSeen: new Date(),
            socketId: socketId || null,
            updatedAt: new Date()
          })
          .where(eq(userOnlineStatus.userId, userId))
          .returning();
        return updatedStatus;
      } else {
        // Create new record
        const [newStatus] = await db.insert(userOnlineStatus)
          .values({
            userId,
            isOnline,
            lastSeen: new Date(),
            socketId: socketId || null
          })
          .returning();
        return newStatus;
      }
    } catch (error) {
      console.error('Error updating user online status:', error);
      throw error;
    }
  }

  async getOnlineUsers(): Promise<(User & { isOnline: boolean })[]> {
    const result = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      bio: users.bio,
      avatar: users.avatar,
      country: users.country,
      role: users.role,
      tokenBalance: users.tokenBalance,
      walletAddress: users.walletAddress,
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionPlan: users.subscriptionPlan,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      password: users.password,
      isOnline: userOnlineStatus.isOnline
    })
    .from(users)
    .leftJoin(userOnlineStatus, eq(users.id, userOnlineStatus.userId))
    .where(eq(userOnlineStatus.isOnline, true));
    
    return result as (User & { isOnline: boolean })[];
  }

  async getUserOnlineStatus(userId: string): Promise<UserOnlineStatus | undefined> {
    const [status] = await db.select().from(userOnlineStatus).where(eq(userOnlineStatus.userId, userId));
    return status;
  }

  // Live Calling - Call Request Methods
  async createCallRequest(request: InsertCallRequest): Promise<CallRequest> {
    const [callRequest] = await db.insert(callRequests).values(request).returning();
    return callRequest;
  }

  async getCallRequest(id: string): Promise<CallRequest | undefined> {
    const [request] = await db.select().from(callRequests).where(eq(callRequests.id, id));
    return request;
  }

  async updateCallRequestStatus(id: string, status: string): Promise<CallRequest | undefined> {
    const [request] = await db.update(callRequests)
      .set({ status, respondedAt: new Date() })
      .where(eq(callRequests.id, id))
      .returning();
    return request;
  }

  async getUserCallRequests(userId: string): Promise<CallRequest[]> {
    return await db.select().from(callRequests)
      .where(or(
        eq(callRequests.requesterId, userId),
        eq(callRequests.receiverId, userId)
      ))
      .orderBy(desc(callRequests.requestedAt));
  }

  // Live Calling - Call Session Methods
  async createCallSession(session: InsertCallSession): Promise<CallSession> {
    const [callSession] = await db.insert(callSessions).values(session).returning();
    return callSession;
  }

  async getCallSession(id: string): Promise<CallSession | undefined> {
    const [session] = await db.select().from(callSessions).where(eq(callSessions.id, id));
    return session;
  }

  async endCallSession(id: string): Promise<CallSession | undefined> {
    const [session] = await db.update(callSessions)
      .set({ 
        status: 'completed',
        endedAt: new Date()
      })
      .where(eq(callSessions.id, id))
      .returning();
    return session;
  }

  async getUserActiveSessions(userId: string): Promise<CallSession[]> {
    return await db.select().from(callSessions)
      .where(and(
        or(
          eq(callSessions.participant1Id, userId),
          eq(callSessions.participant2Id, userId)
        ),
        eq(callSessions.status, 'active')
      ));
  }

}

// Legacy MemStorage class for reference
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private courses: Map<string, Course> = new Map();
  private courseModules: Map<string, CourseModule> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private tokenTransactions: Map<string, TokenTransaction> = new Map();
  private communityPosts: Map<string, CommunityPost> = new Map();
  private analytics: Map<string, Analytics> = new Map();

  constructor() {
    // Initialize with some sample data for the dashboard
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const sampleUsers: User[] = [
      {
        id: "user-1",
        username: "alex_rodriguez",
        email: "alex@parcero.eco",
        password: "$2b$10$sample", // hashed password
        fullName: "Alex Rodriguez",
        bio: "Passionate educator and content creator focused on practical skills development.",
        avatar: null,
        country: null,
        role: "instructor",
        tokenBalance: "1247",
        walletAddress: "0x742d35cc6670c0532925a3b8138b4e88d8a6d372",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionStatus: null,
        subscriptionPlan: null,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date()
      },
      {
        id: "user-2",
        username: "maria_santos",
        email: "maria@parcero.eco",
        password: "$2b$10$sample",
        fullName: "Maria Santos",
        bio: "Enthusiastic learner passionate about personal development and financial freedom.",
        avatar: null,
        country: null,
        role: "student",
        tokenBalance: "892",
        walletAddress: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionStatus: null,
        subscriptionPlan: null,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        updatedAt: new Date()
      }
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));

    // Create sample courses
    const sampleCourses: Course[] = [
      {
        id: "course-1",
        title: "Financial Freedom Fundamentals",
        description: "Master personal finance, budgeting, investing, and building wealth. Learn the money management skills they don't teach in school.",
        content: { 
          overview: "Transform your relationship with money and build lasting financial security",
          objectives: ["Create a sustainable budget", "Start investing for the future", "Build an emergency fund", "Understand credit and debt management"],
          prerequisites: "No prior finance experience required"
        },
        instructorId: "user-1",
        category: "Finance",
        difficulty: "beginner",
        duration: 360, // 6 hours
        price: "0",
        tokenReward: "50.00000000",
        completionReward: "200.00000000",
        quizReward: "75.00000000",
        isPublished: true,
        language: "en",
        strapiId: "strapi-course-1",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: "course-2",
        title: "Communication Mastery: Speak with Confidence",
        description: "Develop powerful communication skills for personal and professional success. Learn to speak with confidence, handle difficult conversations, and build meaningful relationships.",
        content: { 
          overview: "Master the art of effective communication in any situation",
          objectives: ["Improve public speaking skills", "Handle difficult conversations", "Build emotional intelligence", "Develop active listening skills"],
          prerequisites: "Open to anyone wanting to improve their communication"
        },
        instructorId: "user-1",
        category: "Communication",
        difficulty: "beginner",
        duration: 300, // 5 hours
        price: "0",
        tokenReward: "40.00000000",
        completionReward: "160.00000000",
        quizReward: "60.00000000",
        isPublished: true,
        language: "en",
        strapiId: "strapi-course-2",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: "course-3",
        title: "Start Your Business: From Idea to Launch",
        description: "Turn your business idea into reality. Learn practical entrepreneurship skills including market research, business planning, funding, and launching your first venture.",
        content: { 
          overview: "Complete guide to starting and growing a successful business",
          objectives: ["Validate your business idea", "Create a business plan", "Understand legal requirements", "Launch your first product"],
          prerequisites: "Have a business idea or entrepreneurial interest"
        },
        instructorId: "user-1",
        category: "Business",
        difficulty: "intermediate",
        duration: 480, // 8 hours
        price: "0",
        tokenReward: "75.00000000",
        completionReward: "300.00000000",
        quizReward: "100.00000000",
        isPublished: true,
        language: "en",
        strapiId: "strapi-course-3",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: "course-4",
        title: "Digital Marketing Essentials",
        description: "Master modern digital marketing strategies. Learn social media marketing, content creation, SEO, email marketing, and how to build an online presence that converts.",
        content: { 
          overview: "Build a powerful digital marketing strategy from scratch",
          objectives: ["Create engaging social media content", "Understand SEO basics", "Build email marketing campaigns", "Measure marketing ROI"],
          prerequisites: "Basic computer and internet skills"
        },
        instructorId: "user-1",
        category: "Marketing",
        difficulty: "beginner",
        duration: 420, // 7 hours
        price: "0",
        tokenReward: "60.00000000",
        completionReward: "240.00000000",
        quizReward: "80.00000000",
        isPublished: true,
        language: "en",
        strapiId: "strapi-course-4",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: "course-5",
        title: "Relationship Intelligence: Build Meaningful Connections",
        description: "Learn the psychology of human relationships. Develop skills for dating, marriage, friendship, and professional networking that create lasting, meaningful connections.",
        content: { 
          overview: "Build stronger relationships in all areas of your life",
          objectives: ["Understand relationship dynamics", "Improve conflict resolution", "Build emotional intelligence", "Create lasting connections"],
          prerequisites: "Open to anyone wanting better relationships"
        },
        instructorId: "user-1",
        category: "Relationships",
        difficulty: "beginner",
        duration: 360, // 6 hours
        price: "0",
        tokenReward: "50.00000000",
        completionReward: "200.00000000",
        quizReward: "70.00000000",
        isPublished: true,
        language: "en",
        strapiId: "strapi-course-5",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: "course-6",
        title: "Holistic Wellness: Mind, Body, Spirit",
        description: "Create a balanced lifestyle with practical wellness strategies. Learn nutrition basics, stress management, fitness fundamentals, and mental health practices for optimal well-being.",
        content: { 
          overview: "Develop sustainable habits for lifelong health and wellness",
          objectives: ["Create healthy nutrition habits", "Manage stress effectively", "Build a fitness routine", "Practice mindfulness and mental health"],
          prerequisites: "Commitment to personal health improvement"
        },
        instructorId: "user-1",
        category: "Wellness",
        difficulty: "beginner",
        duration: 390, // 6.5 hours
        price: "0",
        tokenReward: "55.00000000",
        completionReward: "220.00000000",
        quizReward: "75.00000000",
        isPublished: true,
        language: "en",
        strapiId: "strapi-course-6",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: "course-7",
        title: "Leadership & Team Building Mastery",
        description: "Develop leadership skills that inspire and motivate others. Learn team management, conflict resolution, decision-making, and how to build high-performing teams.",
        content: { 
          overview: "Transform your leadership abilities and team dynamics",
          objectives: ["Develop leadership presence", "Master team communication", "Handle team conflicts", "Build team culture"],
          prerequisites: "Some team or management experience helpful but not required"
        },
        instructorId: "user-1",
        category: "Leadership",
        difficulty: "intermediate",
        duration: 450, // 7.5 hours
        price: "0",
        tokenReward: "70.00000000",
        completionReward: "280.00000000",
        quizReward: "90.00000000",
        isPublished: true,
        language: "en",
        strapiId: "strapi-course-7",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: "course-8",
        title: "Time Management & Productivity Hacks",
        description: "Master your time and energy to achieve more with less stress. Learn proven productivity systems, time blocking, goal setting, and habit formation techniques.",
        content: { 
          overview: "Take control of your time and dramatically increase your productivity",
          objectives: ["Master time blocking techniques", "Build productive habits", "Eliminate time wasters", "Set and achieve meaningful goals"],
          prerequisites: "Anyone feeling overwhelmed or wanting better time management"
        },
        instructorId: "user-1",
        category: "Productivity",
        difficulty: "beginner",
        duration: 300, // 5 hours
        price: "0",
        tokenReward: "45.00000000",
        completionReward: "180.00000000",
        quizReward: "65.00000000",
        isPublished: true,
        language: "en",
        strapiId: "strapi-course-8",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    sampleCourses.forEach(course => this.courses.set(course.id, course));

    // Create sample analytics
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Daily users
      this.analytics.set(`daily_users_${i}`, {
        id: `analytics-users-${i}`,
        date,
        metric: "daily_users",
        value: String(Math.floor(Math.random() * 1000) + 2500),
        metadata: { source: "dashboard" },
        createdAt: date
      });

      // Course completions
      this.analytics.set(`completions_${i}`, {
        id: `analytics-completions-${i}`,
        date,
        metric: "course_completions",
        value: String(Math.floor(Math.random() * 50) + 20),
        metadata: { source: "courses" },
        createdAt: date
      });

      // Tokens distributed
      this.analytics.set(`tokens_${i}`, {
        id: `analytics-tokens-${i}`,
        date,
        metric: "tokens_distributed",
        value: String(Math.floor(Math.random() * 500) + 1000),
        metadata: { contract: "0x3bd570B91c77788c8d3AB3201184feB93CB0Cf7f" },
        createdAt: date
      });
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      email: insertUser.email,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName || null,
      bio: insertUser.bio || null,
      avatar: insertUser.avatar || null,
      country: insertUser.country || null,
      role: insertUser.role || 'student',
      id,
      tokenBalance: insertUser.tokenBalance || "0",
      walletAddress: insertUser.walletAddress || null,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      subscriptionStatus: insertUser.subscriptionStatus || null,
      subscriptionPlan: insertUser.subscriptionPlan || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Course methods
  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.instructorId === instructorId);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getPublishedCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.isPublished);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = {
      title: insertCourse.title,
      description: insertCourse.description || null,
      content: insertCourse.content || null,
      instructorId: insertCourse.instructorId || null,
      category: insertCourse.category,
      difficulty: insertCourse.difficulty,
      duration: insertCourse.duration || null,
      price: insertCourse.price || "0",
      tokenReward: insertCourse.tokenReward || null,
      completionReward: insertCourse.completionReward || null,
      quizReward: insertCourse.quizReward || null,
      isPublished: insertCourse.isPublished || null,
      language: insertCourse.language || "en",
      strapiId: insertCourse.strapiId || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...updates, updatedAt: new Date() };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  // Course Module methods
  async getModulesByCourse(courseId: string): Promise<CourseModule[]> {
    return Array.from(this.courseModules.values()).filter(module => module.courseId === courseId);
  }

  async createModule(insertModule: InsertCourseModule): Promise<CourseModule> {
    const id = randomUUID();
    const module: CourseModule = {
      title: insertModule.title,
      content: insertModule.content || null,
      exercise: insertModule.exercise || null,
      exercises: insertModule.exercises || null,
      orderIndex: insertModule.orderIndex,
      duration: insertModule.duration || null,
      tokenReward: insertModule.tokenReward || null,
      courseId: insertModule.courseId || null,
      strapiId: insertModule.strapiId || null,
      id,
      createdAt: new Date()
    };
    this.courseModules.set(id, module);
    return module;
  }

  async updateModule(id: string, updates: Partial<CourseModule>): Promise<CourseModule | undefined> {
    const module = this.courseModules.get(id);
    if (!module) return undefined;
    
    const updatedModule = { ...module, ...updates };
    this.courseModules.set(id, updatedModule);
    return updatedModule;
  }

  // User Progress methods
  async getUserProgress(userId: string, courseId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      progress => progress.userId === userId && progress.courseId === courseId
    );
  }

  async getUserProgressByModule(userId: string, moduleId: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      progress => progress.userId === userId && progress.moduleId === moduleId
    );
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = randomUUID();
    const progress: UserProgress = {
      userId: insertProgress.userId || null,
      courseId: insertProgress.courseId || null,
      moduleId: insertProgress.moduleId || null,
      completed: insertProgress.completed || null,
      progress: insertProgress.progress || null,
      timeSpent: insertProgress.timeSpent || null,
      completedAt: insertProgress.completedAt || null,
      id,
      createdAt: new Date()
    };
    this.userProgress.set(id, progress);
    return progress;
  }

  async updateUserProgress(id: string, updates: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const progress = this.userProgress.get(id);
    if (!progress) return undefined;
    
    const updatedProgress = { ...progress, ...updates };
    this.userProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  // Token Transaction methods
  async getTokenTransactionsByUser(userId: string): Promise<TokenTransaction[]> {
    return Array.from(this.tokenTransactions.values()).filter(
      transaction => transaction.userId === userId
    );
  }

  async createTokenTransaction(insertTransaction: InsertTokenTransaction): Promise<TokenTransaction> {
    const id = randomUUID();
    const transaction: TokenTransaction = {
      userId: insertTransaction.userId || null,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      reason: insertTransaction.reason,
      courseId: insertTransaction.courseId || null,
      moduleId: insertTransaction.moduleId || null,
      transactionHash: insertTransaction.transactionHash || null,
      blockchainStatus: insertTransaction.blockchainStatus || null,
      id,
      createdAt: new Date()
    };
    this.tokenTransactions.set(id, transaction);
    return transaction;
  }

  async updateTokenTransaction(id: string, updates: Partial<TokenTransaction>): Promise<TokenTransaction | undefined> {
    const transaction = this.tokenTransactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...updates };
    this.tokenTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Community Post methods
  async getCommunityPosts(courseId?: string): Promise<CommunityPost[]> {
    const posts = Array.from(this.communityPosts.values());
    if (courseId) {
      return posts.filter(post => post.courseId === courseId);
    }
    return posts;
  }

  async searchCommunityPosts(query: string): Promise<CommunityPost[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.communityPosts.values())
      .filter(post => 
        post.title.toLowerCase().includes(searchTerm) || 
        post.content.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10);
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = randomUUID();
    const post: CommunityPost = {
      authorId: insertPost.authorId || null,
      courseId: insertPost.courseId || null,
      moduleId: insertPost.moduleId || null,
      title: insertPost.title,
      content: insertPost.content,
      type: insertPost.type,
      parentId: insertPost.parentId || null,
      id,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async updateCommunityPost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.communityPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteCommunityPost(id: string): Promise<boolean> {
    return this.communityPosts.delete(id);
  }

  // Analytics methods
  async getAnalytics(metric: string, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      analytics => 
        analytics.metric === metric &&
        analytics.date >= startDate &&
        analytics.date <= endDate
    );
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      date: insertAnalytics.date,
      metric: insertAnalytics.metric,
      value: insertAnalytics.value,
      metadata: insertAnalytics.metadata || null,
      id,
      createdAt: new Date()
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeLearners: number;
    totalCourses: number;
    tokensDistributed: string;
    revenue: string;
  }> {
    const totalUsers = this.users.size;
    const activeLearners = Math.floor(totalUsers * 0.7); // 70% active rate
    const totalCourses = this.courses.size;
    
    // Calculate tokens distributed from recent analytics
    const recentTokens = Array.from(this.analytics.values())
      .filter(a => a.metric === "tokens_distributed")
      .slice(-7) // Last 7 days
      .reduce((sum, a) => sum + parseFloat(a.value), 0);
    
    const tokensDistributed = recentTokens.toFixed(2);
    
    // Mock revenue calculation based on course completions
    const revenue = "89247.50";

    return {
      totalUsers,
      activeLearners,
      totalCourses,
      tokensDistributed,
      revenue
    };
  }

  // Peer Evaluation methods
  async createPeerEvaluation(evaluation: InsertPeerEvaluation): Promise<PeerEvaluation> {
    const [peerEvaluation] = await db.insert(peerEvaluations).values(evaluation).returning();
    return peerEvaluation;
  }

  async getUserPeerEvaluations(userId: string, moduleId: string): Promise<PeerEvaluation[]> {
    const evaluations = await db
      .select({
        id: peerEvaluations.id,
        sessionId: peerEvaluations.sessionId,
        evaluatorId: peerEvaluations.evaluatorId,
        evaluatedUserId: peerEvaluations.evaluatedUserId,
        moduleId: peerEvaluations.moduleId,
        exerciseIndex: peerEvaluations.exerciseIndex,
        grammarRating: peerEvaluations.grammarRating,
        vocabularyRating: peerEvaluations.vocabularyRating,
        pronunciationRating: peerEvaluations.pronunciationRating,
        approved: peerEvaluations.approved,
        feedback: peerEvaluations.feedback,
        createdAt: peerEvaluations.createdAt,
        evaluatorUsername: users.username,
        evaluatorAvatar: users.avatar
      })
      .from(peerEvaluations)
      .leftJoin(users, eq(peerEvaluations.evaluatorId, users.id))
      .where(and(
        eq(peerEvaluations.evaluatedUserId, userId),
        eq(peerEvaluations.moduleId, moduleId)
      ))
      .orderBy(desc(peerEvaluations.createdAt));
    
    return evaluations as PeerEvaluation[];
  }

  // Magic Token methods
  async createMagicToken(token: string, email: string, expiresAt: Date): Promise<void> {
    await db.insert(magicTokens).values({
      token,
      email,
      expiresAt
    });
  }

  async getMagicToken(token: string): Promise<{ email: string; expiresAt: Date } | null> {
    const [tokenData] = await db
      .select({
        email: magicTokens.email,
        expiresAt: magicTokens.expiresAt
      })
      .from(magicTokens)
      .where(and(
        eq(magicTokens.token, token),
        sql`${magicTokens.usedAt} IS NULL` // Only get unused tokens
      ));
    
    return tokenData || null;
  }

  async deleteMagicToken(token: string): Promise<void> {
    await db
      .update(magicTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicTokens.token, token));
  }

  async cleanupExpiredTokens(): Promise<void> {
    await db.delete(magicTokens).where(
      lte(magicTokens.expiresAt, new Date())
    );
  }

  // User ID Migration
  async migrateUserIdsToSequential(): Promise<void> {
    try {
      console.log('🔄 Migrating user IDs to sequential pattern...');
      
      // Get all users with non-sequential IDs (UUIDs)
      const uuidUsers = await db.select().from(users)
        .where(sql`${users.id} !~ '^user-[0-9]+$'`);
      
      if (uuidUsers.length === 0) {
        console.log('✅ All user IDs already follow sequential pattern');
        return;
      }
      
      console.log(`📝 Found ${uuidUsers.length} users with UUID-style IDs to migrate`);
      
      // Get the highest existing sequential user ID
      const sequentialUsers = await db.select({ id: users.id }).from(users)
        .where(sql`${users.id} ~ '^user-[0-9]+$'`)
        .orderBy(sql`CAST(SUBSTRING(${users.id} FROM 6) AS INTEGER) DESC`);
      
      let nextNumber = 1;
      if (sequentialUsers.length > 0) {
        const lastUserId = sequentialUsers[0].id;
        nextNumber = parseInt(lastUserId.replace('user-', '')) + 1;
      }
      
      // Update each UUID user to sequential ID
      for (const user of uuidUsers) {
        const newUserId = `user-${nextNumber}`;
        console.log(`🔀 Migrating ${user.email}: ${user.id} → ${newUserId}`);
        
        await db.update(users)
          .set({ id: newUserId })
          .where(eq(users.id, user.id));
          
        nextNumber++;
      }
      
      console.log('✅ User ID migration completed successfully');
    } catch (error) {
      console.error('❌ User ID migration failed:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
