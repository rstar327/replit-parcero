interface StrapiConfig {
  baseUrl: string;
  apiKey?: string;
}

interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiCourse {
  id: number;
  attributes: {
    title: string;
    description: string;
    content: any;
    category: string;
    difficulty: string;
    duration: number;
    tokenReward: number;
    completionReward: number;
    quizReward: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
}

interface StrapiModule {
  id: number;
  attributes: {
    title: string;
    content: any;
    orderIndex: number;
    duration: number;
    tokenReward: number;
    course: {
      data: StrapiCourse;
    };
    createdAt: string;
  };
}

interface StrapiMediaFile {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: any;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
  };
}

class StrapiService {
  private config: StrapiConfig;

  constructor(config: StrapiConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<StrapiResponse<T>> {
    const url = `${this.config.baseUrl}/api/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Strapi request failed:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth(): Promise<{ status: string; version?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/_health`);
      if (response.ok) {
        return { status: 'connected' };
      }
      throw new Error('Health check failed');
    } catch (error) {
      return { status: 'disconnected' };
    }
  }

  // Course management
  async getCourses(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
    populate?: string[];
  }): Promise<StrapiResponse<StrapiCourse[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('pagination[page]', params.page.toString());
    if (params?.pageSize) searchParams.set('pagination[pageSize]', params.pageSize.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.populate) {
      params.populate.forEach(field => {
        searchParams.append('populate', field);
      });
    }
    
    // Add filters
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (typeof value === 'string') {
          searchParams.set(`filters[${key}][$containsi]`, value);
        } else if (typeof value === 'boolean') {
          searchParams.set(`filters[${key}][$eq]`, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `courses${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<StrapiCourse[]>(endpoint);
  }

  async getCourse(id: number, populate?: string[]): Promise<StrapiResponse<StrapiCourse>> {
    const searchParams = new URLSearchParams();
    if (populate) {
      populate.forEach(field => {
        searchParams.append('populate', field);
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `courses/${id}${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<StrapiCourse>(endpoint);
  }

  async createCourse(courseData: {
    title: string;
    description: string;
    content?: any;
    category: string;
    difficulty: string;
    duration?: number;
    tokenReward?: number;
    completionReward?: number;
    quizReward?: number;
    isPublished?: boolean;
  }): Promise<StrapiResponse<StrapiCourse>> {
    return this.makeRequest<StrapiCourse>('courses', {
      method: 'POST',
      body: JSON.stringify({ data: courseData }),
    });
  }

  async updateCourse(
    id: number, 
    courseData: Partial<StrapiCourse['attributes']>
  ): Promise<StrapiResponse<StrapiCourse>> {
    return this.makeRequest<StrapiCourse>(`courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: courseData }),
    });
  }

  async deleteCourse(id: number): Promise<StrapiResponse<StrapiCourse>> {
    return this.makeRequest<StrapiCourse>(`courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Module management
  async getCourseModules(courseId: number): Promise<StrapiResponse<StrapiModule[]>> {
    return this.makeRequest<StrapiModule[]>(
      `course-modules?filters[course][id][$eq]=${courseId}&sort=orderIndex`
    );
  }

  async createModule(moduleData: {
    title: string;
    content: any;
    orderIndex: number;
    duration?: number;
    tokenReward?: number;
    course: number;
  }): Promise<StrapiResponse<StrapiModule>> {
    return this.makeRequest<StrapiModule>('course-modules', {
      method: 'POST',
      body: JSON.stringify({ data: moduleData }),
    });
  }

  async updateModule(
    id: number, 
    moduleData: Partial<StrapiModule['attributes']>
  ): Promise<StrapiResponse<StrapiModule>> {
    return this.makeRequest<StrapiModule>(`course-modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: moduleData }),
    });
  }

  // Media management
  async getMediaFiles(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
  }): Promise<StrapiResponse<StrapiMediaFile[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('pagination[page]', params.page.toString());
    if (params?.pageSize) searchParams.set('pagination[pageSize]', params.pageSize.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        searchParams.set(`filters[${key}][$containsi]`, value.toString());
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `upload/files${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<StrapiMediaFile[]>(endpoint);
  }

  async uploadFile(file: File, refId?: number, ref?: string, field?: string): Promise<StrapiResponse<StrapiMediaFile[]>> {
    const formData = new FormData();
    formData.append('files', file);
    
    if (refId) formData.append('refId', refId.toString());
    if (ref) formData.append('ref', ref);
    if (field) formData.append('field', field);

    const headers: HeadersInit = {};
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(`${this.config.baseUrl}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async deleteFile(id: number): Promise<StrapiResponse<StrapiMediaFile>> {
    return this.makeRequest<StrapiMediaFile>(`upload/files/${id}`, {
      method: 'DELETE',
    });
  }

  // Content synchronization
  async syncWithDatabase(localCourses: any[]): Promise<{ 
    synced: number; 
    created: number; 
    updated: number; 
    errors: string[] 
  }> {
    const results = {
      synced: 0,
      created: 0,
      updated: 0,
      errors: [] as string[]
    };

    for (const localCourse of localCourses) {
      try {
        if (localCourse.strapiId) {
          // Update existing course
          await this.updateCourse(parseInt(localCourse.strapiId), {
            title: localCourse.title,
            description: localCourse.description,
            content: localCourse.content,
            category: localCourse.category,
            difficulty: localCourse.difficulty,
            duration: localCourse.duration,
            tokenReward: parseFloat(localCourse.tokenReward),
            completionReward: parseFloat(localCourse.completionReward),
            quizReward: parseFloat(localCourse.quizReward),
            isPublished: localCourse.isPublished,
          });
          results.updated++;
        } else {
          // Create new course
          const response = await this.createCourse({
            title: localCourse.title,
            description: localCourse.description,
            content: localCourse.content,
            category: localCourse.category,
            difficulty: localCourse.difficulty,
            duration: localCourse.duration,
            tokenReward: parseFloat(localCourse.tokenReward),
            completionReward: parseFloat(localCourse.completionReward),
            quizReward: parseFloat(localCourse.quizReward),
            isPublished: localCourse.isPublished,
          });
          results.created++;
          
          // TODO: Update local database with Strapi ID
          // This would require a callback to update the local course record
        }
        results.synced++;
      } catch (error) {
        results.errors.push(`Failed to sync course "${localCourse.title}": ${error}`);
      }
    }

    return results;
  }
}

// Create and export service instance
const strapiConfig: StrapiConfig = {
  baseUrl: import.meta.env.VITE_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337',
  apiKey: import.meta.env.VITE_STRAPI_API_KEY || process.env.STRAPI_API_KEY,
};

export const strapiService = new StrapiService(strapiConfig);

// Export types for use in components
export type {
  StrapiCourse,
  StrapiModule,
  StrapiMediaFile,
  StrapiResponse,
};

// Export utility functions
export const formatStrapiDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStrapiImageUrl = (url: string): string => {
  if (url.startsWith('http')) {
    return url;
  }
  return `${strapiConfig.baseUrl}${url}`;
};

export default strapiService;
