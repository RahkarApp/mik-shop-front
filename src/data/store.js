// داده‌های Mock فروشگاه «وان استایل».
// در نسخه واقعی، این اطلاعات از Micro Server دریافت می‌شوند.

export const banners = [
  { id: "1", image: "/images/products/blouse.png", link: "/0003" },
  { id: "2", image: "/images/products/jeans.png", link: "/0002" },
  { id: "3", image: "/images/products/baby-scarf-blue.png", link: "/0007" },
];

export const categories = [
  {
    id: "0902001",
    code: "0902001",
    name: "تیشرت",
    image: "/images/products/tshirt.png",
    subcategories: [],
  },
  {
    id: "0902002",
    code: "0902002",
    name: "لباس خواب و راحتی زنانه",
    image: null,
    subcategories: [],
  },
  {
    id: "0902003",
    code: "0902003",
    name: "لباس زیر زنانه",
    image: null,
    subcategories: [],
  },
  {
    id: "0902004",
    code: "0902004",
    name: "پوشش اسلامی",
    image: "/images/products/baby-scarf-blue.png",
    subcategories: [],
  },
  {
    id: "0902005",
    code: "0902005",
    name: "بلوز و شومیز",
    image: "/images/products/blouse.png",
    subcategories: [],
  },
  {
    id: "0902006",
    code: "0902006",
    name: "جوراب و ساق",
    image: null,
    subcategories: [],
  },
  {
    id: "0902007",
    code: "0902007",
    name: "شلوار",
    image: null,
    subcategories: [],
  },
  {
    id: "0902008",
    code: "0902008",
    name: "شلوارجین",
    image: "/images/products/jeans.png",
    subcategories: [],
  },
  {
    id: "0902009",
    code: "0902009",
    name: "تاپ و نیم تنه",
    image: "/images/products/top.png",
    subcategories: [],
  },
  {
    id: "0902010",
    code: "0902010",
    name: "ژاکت و پلیور",
    image: null,
    subcategories: [],
  },
  {
    id: "0902011",
    code: "0902011",
    name: "پالتو بارانی و کاپشن",
    image: null,
    subcategories: [],
  },
  {
    id: "0902012",
    code: "0902012",
    name: "پیراهن و لباس مجلسی زنانه",
    image: null,
    subcategories: [],
  },
  {
    id: "0902013",
    code: "0902013",
    name: "دامن زنانه",
    image: "/images/products/skirt.jpg",
    subcategories: [],
  },
  {
    id: "0902014",
    code: "0902014",
    name: "تونیک زنانه",
    image: null,
    subcategories: [],
  },
  {
    id: "0902015",
    code: "0902015",
    name: "کت،جلیقه وست رسمی",
    image: "/images/products/coat.png",
    subcategories: [],
  },
  {
    id: "0902016",
    code: "0902016",
    name: "لباس بارداری",
    image: null,
    subcategories: [],
  },
  {
    id: "0902017",
    code: "0902017",
    name: "شلوارک",
    image: null,
    subcategories: [],
  },
  {
    id: "0902018",
    code: "0902018",
    name: "پولوشرت",
    image: null,
    subcategories: [],
  },
  {
    id: "0902019",
    code: "0902019",
    name: "ست لباس روزمره",
    image: null,
    subcategories: [],
  },
  {
    id: "0902020",
    code: "0902020",
    name: "سرهمی",
    image: null,
    subcategories: [],
  },
  {
    id: "0902021",
    code: "0902021",
    name: "هودی",
    image: null,
    subcategories: [],
  },
  {
    id: "0902022",
    code: "0902022",
    name: "سویشرت",
    image: null,
    subcategories: [],
  },
  {
    id: "0902023",
    code: "0902023",
    name: "کفش زنانه",
    image: "/images/products/shoes.png",
    subcategories: [],
  },
  {
    id: "0902024",
    code: "0902024",
    name: "اکسسوری زنانه",
    image: "/images/products/bangle.jpg",
    subcategories: [],
  },
  {
    id: "0902025",
    code: "0902025",
    name: "ورزشی زنانه",
    image: null,
    subcategories: [],
  },
];

export const products = [
  {
    id: "0001",
    code: "0001",
    name: "تیشرت",
    category: "0902001",
    image: "/images/products/tshirt.png",
    images: ["/images/products/tshirt.png"],
    price: 350000,
    description: "تیشرت",
    stock: 8,
    features: [],
  },
  {
    id: "0002",
    code: "0002",
    name: "شلوار",
    category: "0902008",
    image: "/images/products/jeans.png",
    images: ["/images/products/jeans.png"],
    price: 890000,
    description: "شلوار جین",
    stock: 1,
    features: [],
  },
  {
    id: "0003",
    code: "0003",
    name: "شومیز",
    category: "0902005",
    image: "/images/products/blouse.png",
    images: ["/images/products/blouse.png"],
    price: 1300000,
    description: "شومیز",
    stock: 8,
    features: [],
  },
  {
    id: "0004",
    code: "0004",
    name: "دامن",
    category: "0902013",
    image: "/images/products/skirt.jpg",
    images: ["/images/products/skirt.jpg"],
    price: 2400000,
    description: "دامن زنانه",
    stock: 2,
    features: [],
  },
  {
    id: "0005",
    code: "0005",
    name: "صندل",
    category: "0902023",
    image: "/images/products/sandals.png",
    images: ["/images/products/sandals.png"],
    price: 1500000,
    description: "صندل",
    stock: 8,
    features: [],
  },
  {
    id: "0006",
    code: "0006",
    name: "کفش",
    category: "0902023",
    image: "/images/products/shoes.png",
    images: ["/images/products/shoes.png"],
    price: 2500000,
    description: "کفش پاشنه‌دار",
    stock: 3,
    features: [],
  },
  {
    id: "0007",
    code: "0007",
    name: "بیبی اسکارف",
    category: "0902004",
    image: "/images/products/baby-scarf-blue.png",
    images: [
      "/images/products/baby-scarf-blue.png",
      "/images/products/baby-scarf-burgundy.jpg",
    ],
    price: 450000,
    description: "شال و روسری زنانه",
    stock: 9,
    features: [],
  },
  {
    id: "0008",
    code: "0008",
    name: "بنگل",
    category: "0902024",
    image: "/images/products/bangle.jpg",
    images: ["/images/products/bangle.jpg"],
    price: 800000,
    description: "زیورآلات زنانه",
    stock: 7,
    features: [],
  },
  {
    id: "0009",
    code: "0009",
    name: "تاپ",
    category: "0902009",
    image: "/images/products/top.png",
    images: ["/images/products/top.png"],
    price: 399000,
    description: "تاپ و نیم‌تنه",
    stock: 17,
    features: [],
  },
  {
    id: "0010",
    code: "0010",
    name: "کت",
    category: "0902015",
    image: "/images/products/coat.png",
    images: ["/images/products/coat.png"],
    price: 5000000,
    description: "کت، جلیقه و وست رسمی",
    stock: 6,
    features: [],
  },
];

// سفارش قبلی صرفاً برای تست صفحات سفارش نگه داشته شده است.
export const orders = [
  {
    id: "12345",
    date: "1403/05/01",
    status: "تحویل داده شده",
    customer: {
      name: "مرتضی کریمی",
      phone: "09123456789",
      address: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، کوچه ساعی یکم، پلاک ۱۰، واحد ۵",
      postalCode: "1234567890",
    },
    items: [
      { ...products[0], quantity: 1 },
      { ...products[3], quantity: 1 },
    ],
    summary: {
      subtotal: 2750000,
      shipping: 50000,
      discount: 0,
      total: 2800000,
    },
    paymentMethod: "پرداخت آنلاین",
    shippingMethod: "پست پیشتاز",
  },
];

export const cart = [];

export function addToCart(productId, quantity = 1, selectedFeatures = {}) {
  const item = cart.find(
    (cartItem) =>
      cartItem.productId === productId &&
      JSON.stringify(cartItem.selectedFeatures) === JSON.stringify(selectedFeatures)
  );

  if (item) {
    item.quantity += quantity;
    return;
  }

  cart.push({ productId, quantity, selectedFeatures });
}

export function removeFromCart(productId, selectedFeatures) {
  const index = cart.findIndex(
    (item) =>
      item.productId === productId &&
      (!selectedFeatures ||
        JSON.stringify(item.selectedFeatures) === JSON.stringify(selectedFeatures))
  );

  if (index > -1) cart.splice(index, 1);
}

export function searchProducts(query) {
  if (!query) return [];

  const normalizedQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.code.includes(normalizedQuery)
  );
}

export function filterProductsByCategory(categoryId) {
  if (!categoryId) return products;

  const mainCategory = categories.find((category) => category.id === categoryId);
  if (mainCategory) {
    const subcategoryIds = mainCategory.subcategories.map((subcategory) => subcategory.id);
    return products.filter(
      (product) =>
        subcategoryIds.includes(product.category) || product.category === categoryId
    );
  }

  return products.filter((product) => product.category === categoryId);
}

export function getProductById(id) {
  return products.find((product) => product.id === id);
}

export function getCategoryById(id) {
  for (const category of categories) {
    if (category.id === id) return category;

    const subcategory = category.subcategories.find((item) => item.id === id);
    if (subcategory) return subcategory;
  }

  return null;
}

export function getCartItems() {
  return cart
    .map((item) => {
      const product = getProductById(item.productId);
      return product ? { ...item, ...product } : null;
    })
    .filter(Boolean);
}

export function getOrders() {
  return orders;
}
