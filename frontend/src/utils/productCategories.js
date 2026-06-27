export const PRODUCT_CATEGORIES = [
  {
    name: "Mobiles",
    value: "Mobiles",
    tone: "mobile",
    text: "Latest 5G phones, fast charging, and sharp displays.",
    aliases: ["mobile", "mobiles", "phone", "phones", "smartphone", "smartphones"],
  },
  {
    name: "Laptops",
    value: "Laptops",
    tone: "laptop",
    text: "Work, study, and gaming laptops for every setup.",
    aliases: ["laptop", "laptops", "notebook", "notebooks", "computer", "computers"],
  },
  {
    name: "Headphones",
    value: "Headphones",
    tone: "headphone",
    text: "Wireless audio, noise cancellation, and studio sound.",
    aliases: ["headphone", "headphones", "headset", "headsets", "earphone", "earphones", "earbuds"],
  },
  {
    name: "Smart TVs",
    value: "Smart TVs",
    tone: "tv",
    text: "Big screen entertainment with crisp smart features.",
    aliases: ["smart tv", "smart tvs", "tv", "tvs", "television", "televisions"],
  },
  {
    name: "Refrigerators",
    value: "Refrigerators",
    tone: "refrigerator",
    text: "Energy-efficient cooling for modern homes.",
    aliases: ["refrigerator", "refrigerators", "fridge", "fridges", "freezer", "freezers"],
  },
];

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeProductCategory = (category) => {
  const normalizedCategory = normalizeText(category);

  if (!normalizedCategory) {
    return "";
  }

  const matchedCategory = PRODUCT_CATEGORIES.find((productCategory) => {
    const normalizedValue = normalizeText(productCategory.value);
    const normalizedName = normalizeText(productCategory.name);
    const normalizedAliases = productCategory.aliases.map(normalizeText);

    return [normalizedValue, normalizedName, ...normalizedAliases].includes(normalizedCategory);
  });

  return matchedCategory?.value || String(category || "").trim();
};

export const applyProductFilters = (products, filters = {}) => {
  const normalizedCategory = normalizeProductCategory(filters.category);
  const search = normalizeText(filters.search);
  const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
  const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);

  return products.filter((product) => {
    const productCategory = normalizeProductCategory(product.category);
    const price = Number(product.price);
    const stock = Number(product.stock);
    const searchableText = normalizeText(`${product.name || ""} ${product.description || ""} ${product.category || ""}`);

    if (normalizedCategory && productCategory !== normalizedCategory) {
      return false;
    }

    if (search && !searchableText.includes(search)) {
      return false;
    }

    if (!Number.isNaN(minPrice) && minPrice !== null && price < minPrice) {
      return false;
    }

    if (!Number.isNaN(maxPrice) && maxPrice !== null && price > maxPrice) {
      return false;
    }

    if (filters.inStock && stock <= 0) {
      return false;
    }

    return true;
  });
};

export const getProductApiFilters = (filters = {}) => {
  const { category, ...apiFilters } = filters;

  return apiFilters;
};
