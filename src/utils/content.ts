import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

/**
 * Gets all posts sorted by date
 */
const getSortedPosts = async (): Promise<CollectionEntry<'posts'>[]> =>
  (await getCollection('posts'))
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    )
    .filter((post) => !post.data.hidden);

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
 * Gets all reading data sorted by id
 */
const getReadingData = async (): Promise<CollectionEntry<'reading'>[]> =>
  (await getCollection('reading')).sort((a, b) => a.data.order - b.data.order);

export {
  getAllCategories,
  getAllTags,
  getReadingData,
  getSortedPosts,
  getSortedYears,
  groupPostsByYear,
  separatePosts,
};
