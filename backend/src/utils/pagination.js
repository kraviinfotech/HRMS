export function getPagination(query) {
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit || "10", 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function paginate(modelQuery, countQuery, { page, limit }) {
  const [items, total] = await Promise.all([modelQuery, countQuery]);
  return {
    items,
    meta: {
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1),
    },
  };
}
