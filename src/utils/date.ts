const formatDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const getDayFromDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const getYearFromDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
  });
};

export { formatDate, getDayFromDate, getYearFromDate };
