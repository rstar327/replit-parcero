import { useQuery } from "@tanstack/react-query";

export interface CourseTranslation {
  id: string;
  courseId: string;
  language: string;
  title: string;
  description: string;
  content?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  price: string;
  completionReward: string;
  [key: string]: any;
}

/**
 * Hook to get course content in a specific language
 * Falls back to original course data if translation doesn't exist
 */
export function useCourseWithTranslation(courseId: string | undefined, preferredLanguage: string) {
  // Fetch course translations
  const { data: translations } = useQuery<CourseTranslation[]>({
    queryKey: [`/api/course-translations/${courseId}`],
    enabled: !!courseId && preferredLanguage !== 'en',
  });

  const getLocalizedCourse = (course: Course): Course => {
    if (!course || preferredLanguage === 'en') {
      return course;
    }

    // Find translation for preferred language
    const translation = translations?.find(t => t.language === preferredLanguage);
    
    if (translation) {
      return {
        ...course,
        title: translation.title || course.title,
        description: translation.description || course.description,
      };
    }

    return course;
  };

  return {
    getLocalizedCourse,
    translations,
    isTranslationsLoading: preferredLanguage !== 'en' && !translations,
  };
}

/**
 * Get localized course data for an array of courses
 */
export function getLocalizedCourses(
  courses: Course[] | undefined, 
  translations: Record<string, CourseTranslation[]> | undefined, 
  preferredLanguage: string
): Course[] {
  if (!courses || preferredLanguage === 'en') {
    return courses || [];
  }

  return courses.map(course => {
    const courseTranslations = translations?.[course.id];
    const translation = courseTranslations?.find(t => t.language === preferredLanguage);
    
    if (translation) {
      return {
        ...course,
        title: translation.title || course.title,
        description: translation.description || course.description,
      };
    }

    return course;
  });
}