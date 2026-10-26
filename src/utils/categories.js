export function buildCategoryTree(items) {
  const nodes = new Map();
  function collect(entries, inheritedParent = null) {
    for (const item of entries) {
      const id = item.id ?? item.categoryId ?? item.uid;
      if (id == null || String(id) === '' || typeof item.name !== 'string') {
        throw Object.assign(new Error('دریافت دسته‌بندی‌ها کامل نشد. دوباره تلاش کنید.'), {code:'INVALID_BACKEND_RESPONSE'});
      }
      const parent = Object.hasOwn(item,'parentId') ? item.parentId : Object.hasOwn(item,'parent') ? item.parent : inheritedParent;
      const node = {...item, id:String(id), parentId:parent == null || parent === '' ? null : String(parent),
        image:item.image || item.imageUrl || '', subcategories:[]};
      if (!nodes.has(node.id)) nodes.set(node.id, node);
      if (Array.isArray(item.subcategories)) collect(item.subcategories, node.id);
    }
  }
  collect(items);
  const roots = [];
  for (const node of nodes.values()) {
    let parent = nodes.get(node.parentId);
    const seen = new Set([node.id]);
    let ancestor = parent;
    while (ancestor) {
      if (seen.has(ancestor.id)) {parent = null;break;}
      seen.add(ancestor.id);ancestor = nodes.get(ancestor.parentId);
    }
    // Missing parents and corrupt cycles must never hide a category or recurse forever.
    if (parent) parent.subcategories.push(node);
    else roots.push(node);
  }
  const sort = entries => {
    entries.sort((a,b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name,'fa'));
    entries.forEach(node => sort(node.subcategories));
  };
  sort(roots);
  return roots;
}

export function findCategoryPath(categories, id) {
  for (const category of categories) {
    if (category.id === String(id)) return [category];
    const children = findCategoryPath(category.subcategories || [], id);
    if (children.length) return [category, ...children];
  }
  return [];
}

export function normalizeCategorySearch(value) {
  return String(value || '').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u064b-\u065f]/g,'')
    .replace(/[\u200c\s]+/g,' ').trim().toLocaleLowerCase('fa');
}

export function searchCategoryTree(categories, query) {
  const term = normalizeCategorySearch(query);
  if (!term) return categories;
  return categories.flatMap(category => {
    if (normalizeCategorySearch(category.name).includes(term)) return [category];
    const children = searchCategoryTree(category.subcategories || [], term);
    return children.length ? [{...category, subcategories:children}] : [];
  });
}
