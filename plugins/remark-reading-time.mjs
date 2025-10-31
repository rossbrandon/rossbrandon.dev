import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export const remarkReadingTime = () => {
  return (tree, { data }) => {
    const text = toString(tree);
    const readingTime = getReadingTime(text);

    // Format as "One minute" or "X minutes"
    const minutes = Math.ceil(readingTime.minutes);
    const formattedTime = minutes === 1 ? 'One minute' : `${minutes} minutes`;

    data.astro = data.astro || {};
    data.astro.frontmatter = data.astro.frontmatter || {};
    data.astro.frontmatter.minutesRead = formattedTime;
    data.astro.frontmatter.wordCount = readingTime.words;
  };
};
