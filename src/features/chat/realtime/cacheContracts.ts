export type CollectionCache<T> = {
  items: T[];
};

type MaybeCollectionCache<T> = CollectionCache<T> | T[] | undefined;

export const readCollectionItems = <T>(current: MaybeCollectionCache<T>): T[] => {
  if (!current) {
    return [];
  }

  if (Array.isArray(current)) {
    return current;
  }

  return current.items ?? [];
};

export const writeCollectionItems = <T>(current: MaybeCollectionCache<T>, items: T[]): CollectionCache<T> => {
  if (Array.isArray(current)) {
    return { items };
  }

  return {
    ...(current ?? {}),
    items
  };
};
