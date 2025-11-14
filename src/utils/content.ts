import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

/**
 * Gets all posts sorted by date
 */
const getSortedPosts = async (): Promise<CollectionEntry<'posts'>[]> =>
  (await getCollection('posts'))
    .filter((post) => !post.data.hidden)
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

/**
 * Separates posts into pinned and regular posts
 */
const separatePosts = (
  posts: CollectionEntry<'posts'>[]
): {
  pinnedPosts: CollectionEntry<'posts'>[];
  regularPosts: CollectionEntry<'posts'>[];
} => {
  const pinnedPosts = posts.filter((post) => post.data.pinned);
  const regularPosts = posts.filter((post) => !post.data.pinned);
  return { pinnedPosts, regularPosts };
};

/**
 * Groups posts by year
 */
const groupPostsByYear = (
  posts: CollectionEntry<'posts'>[]
): Record<string, CollectionEntry<'posts'>[]> => {
  return posts.reduce(
    (acc, post) => {
      const year = post.data.date.getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(post);
      return acc;
    },
    {} as Record<string, CollectionEntry<'posts'>[]>
  );
};

/**
 * Sorts years in descending order
 */
const getSortedYears = (
  postsByYear: Record<string, CollectionEntry<'posts'>[]>
): string[] => {
  return Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));
};

/**
 * Gets all unique tags from posts
 */
const getAllTags = (posts: CollectionEntry<'posts'>[]): Set<string> => {
  const allTags = new Set<string>();
  posts.forEach((post) => {
    post.data.tags?.forEach((tag) => allTags.add(tag));
  });
  return allTags;
};

/**
 * Gets all unique categories from posts
 */
const getAllCategories = (posts: CollectionEntry<'posts'>[]): Set<string> => {
  const allCategories = new Set<string>();
  posts.forEach((post) => {
    post.data.categories?.forEach((category) => allCategories.add(category));
  });
  return allCategories;
};

/**
 * Gets all reading data sorted by finishedDate (desc) then title
 */
const getReadingData = async (): Promise<CollectionEntry<'reading'>[]> => {
  const collection = await getCollection('reading');
  return collection
    .filter((item) => !item.data.hidden)
    .sort((a, b) => {
      // Items being read come first
      if (a.data.status === 'Reading') {
        return -1;
      }

      const aFinished = a.data.finishedDate;
      const bFinished = b.data.finishedDate;

      // Both have finishedDate - sort by date descending
      if (aFinished && bFinished) {
        return new Date(bFinished).getTime() - new Date(aFinished).getTime();
      }

      // Only a has finishedDate - a comes first
      if (aFinished && !bFinished) {
        return -1;
      }

      // Only b has finishedDate - b comes first
      if (!aFinished && bFinished) {
        return 1;
      }

      // If nothing else matches, sort by title
      return a.data.title.localeCompare(b.data.title);
    });
  return collection;
};

export {
  getAllCategories,
  getAllTags,
  getReadingData,
  getSortedPosts,
  getSortedYears,
  groupPostsByYear,
  separatePosts,
};
