export interface ProductVariant {
  size: string; // e.g. "5ml", "50ml", "100ml"
  price: number;
  originalPrice?: number;
  sku?: string;
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: "tech" | "perfume";
  subcategory: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  badge?: "New" | "Sale" | "Bestseller";
  emoji: string;
  image: string;
  bgColor: string;
  inStock: boolean;
  sku: string;
  description: string;
  specs: Record<string, string>;
  tags: string[];
  variants?: ProductVariant[];
}


const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

export const products: Product[] = [
  {
    id: "wireless-earbuds-pro-max",
    name: "Wireless Earbuds Pro Max",
    category: "tech",
    subcategory: "Audio",
    price: 2499,
    originalPrice: 3200,
    rating: 5,
    reviews: 124,
    badge: "New",
    emoji: "🎧",
    image: img("1590658268037-6bf12165a8df"),
    bgColor: "#EEF3FF",
    inStock: true,
    sku: "TECH-001",
    description:
      "Premium wireless earbuds with 30hr battery, ANC technology, and crystal clear call quality. Android 966 tested & recommended.",
    specs: {
      Brand: "TechPro Series",
      Connectivity: "Bluetooth 5.3",
      "Battery Life": "30 hours (ANC off)",
      "Noise Cancellation": "Active (ANC)",
      "Water Resistance": "IPX5",
      Warranty: "6 months",
    },
    tags: ["Wireless", "ANC", "Bluetooth 5.3", "Android 966 Pick"],
  },
  {
    id: "20000mah-power-bank-fast-charge",
    name: "20000mAh Power Bank Fast Charge",
    category: "tech",
    subcategory: "Power",
    price: 3199,
    originalPrice: 3999,
    rating: 4,
    reviews: 89,
    badge: "New",
    emoji: "🔋",
    image: img("1609091839311-d5365f9ff1c5"),
    bgColor: "#EEF3FF",
    inStock: true,
    sku: "TECH-002",
    description:
      "Badi battery wala power bank jo aapke phone ko multiple times full charge kar sake. 22.5W fast charging support.",
    specs: {
      Brand: "PowerMax",
      Capacity: "20000mAh",
      Output: "22.5W Fast Charge",
      Ports: "2 USB-A + 1 USB-C",
      Weight: "380g",
      Warranty: "12 months",
    },
    tags: ["Power Bank", "Fast Charge", "20000mAh", "Travel Essential"],
  },
  {
    id: "ring-light-10-tripod",
    name: 'Ring Light 10" with Tripod',
    category: "tech",
    subcategory: "Accessories",
    price: 1899,
    originalPrice: 2499,
    rating: 5,
    reviews: 210,
    badge: "Sale",
    emoji: "💡",
    image: img("1621607512214-68297480165e"),
    bgColor: "#EEF3FF",
    inStock: true,
    sku: "TECH-003",
    description:
      "Perfect lighting setup for creators, vloggers, and video calls. Adjustable brightness and color temperature.",
    specs: {
      Brand: "CreatorGlow",
      Size: "10 inches",
      "Color Temp": "3000K-6500K",
      Mount: "Phone holder included",
      Height: "Up to 6 feet",
      Warranty: "6 months",
    },
    tags: ["Ring Light", "Creator", "Tripod", "Lighting"],
  },
  {
    id: "smart-watch-series-7",
    name: "Smart Watch Series 7",
    category: "tech",
    subcategory: "Wearables",
    price: 4499,
    originalPrice: 5999,
    rating: 4,
    reviews: 156,
    badge: "New",
    emoji: "⌚",
    image: img("1523275335684-37898b6baf30"),
    bgColor: "#EEF3FF",
    inStock: true,
    sku: "TECH-004",
    description:
      "Feature-packed smartwatch with health tracking, notifications, and 7-day battery life. Aapki fitness journey ka best partner.",
    specs: {
      Brand: "FitTrack",
      Display: '1.75" AMOLED',
      "Battery Life": "7 days",
      Sensors: "Heart rate, SpO2, Sleep",
      "Water Resistance": "IP68",
      Warranty: "12 months",
    },
    tags: ["Smartwatch", "Fitness", "Health", "Wearable"],
  },
  {
    id: "bluetooth-car-speaker",
    name: "Bluetooth Car Speaker",
    category: "tech",
    subcategory: "Audio",
    price: 1299,
    originalPrice: 1699,
    rating: 3,
    reviews: 67,
    emoji: "🔊",
    image: img("1608043152269-423dbba4e7e1"),
    bgColor: "#EEF3FF",
    inStock: true,
    sku: "TECH-005",
    description:
      "Compact Bluetooth speaker with crisp sound and long battery. Gari mein, picnic pe, har jagah perfect companion.",
    specs: {
      Brand: "SonicBoom",
      Connectivity: "Bluetooth 5.0",
      Output: "10W",
      "Battery Life": "8 hours",
      "Water Resistance": "IPX4",
      Warranty: "6 months",
    },
    tags: ["Bluetooth", "Speaker", "Portable", "Outdoor"],
  },
  {
    id: "usb-c-hub-7-in-1",
    name: "USB-C Hub 7-in-1",
    category: "tech",
    subcategory: "Accessories",
    price: 2899,
    originalPrice: 3499,
    rating: 5,
    reviews: 94,
    emoji: "🔌",
    image: img("1625948515291-69613efd103f"),
    bgColor: "#EEF3FF",
    inStock: true,
    sku: "TECH-006",
    description:
      "Sab ports ek jagah. HDMI, USB-A, USB-C PD, SD card, aur Ethernet — apke laptop ka productivity booster.",
    specs: {
      Brand: "PortMaster",
      Ports: "HDMI + 3 USB-A + USB-C PD + SD + microSD",
      "Video Output": "4K@30Hz",
      "Power Delivery": "100W",
      Material: "Aluminum alloy",
      Warranty: "12 months",
    },
    tags: ["USB-C", "Hub", "Laptop", "Productivity"],
  },
  {
    id: "oud-noir-intense-edp-100ml",
    name: "Oud Noir Intense EDP 100ml",
    category: "perfume",
    subcategory: "Oud",
    price: 1799,
    originalPrice: 2499,
    rating: 5,
    reviews: 312,
    badge: "Bestseller",
    emoji: "🌿",
    image: img("1541643600914-78b084683601"),
    bgColor: "#FFF3EE",
    inStock: true,
    sku: "PERF-001",
    description:
      "Royal oud fragrance with long-lasting sillage. Dark, woody, and perfect for special occasions. Sabse zyada pasand kiya jaane wala scent.",
    specs: {
      Brand: "OudEssence",
      Volume: "100ml EDP",
      Notes: "Oud, Amber, Musk, Saffron",
      Longevity: "8-10 hours",
      Gender: "Unisex",
      Warranty: "7 days return",
    },
    tags: ["Oud", "Long Lasting", "Unisex", "Bestseller"],
  },
  {
    id: "arabian-nights-edp-75ml",
    name: "Arabian Nights EDP 75ml",
    category: "perfume",
    subcategory: "Oriental",
    price: 2199,
    originalPrice: 2799,
    rating: 4,
    reviews: 178,
    emoji: "🌙",
    image: img("1592945403244-b3fbafd7f539"),
    bgColor: "#FFF3EE",
    inStock: true,
    sku: "PERF-002",
    description:
      "Mysterious oriental blend for evening wear. Deep, spicy, and unforgettable — Arabian Nights banaye aapki raat khaas.",
    specs: {
      Brand: "NightScent",
      Volume: "75ml EDP",
      Notes: "Rose, Oud, Patchouli, Vanilla",
      Longevity: "6-8 hours",
      Gender: "Unisex",
      Warranty: "7 days return",
    },
    tags: ["Oriental", "Evening", "Rose", "Oud"],
  },
  {
    id: "rose-saffron-attar-12ml",
    name: "Rose Saffron Attar 12ml",
    category: "perfume",
    subcategory: "Attar",
    price: 899,
    originalPrice: 1199,
    rating: 5,
    reviews: 245,
    emoji: "🌹",
    image: img("1615634260167-c8cdede054de"),
    bgColor: "#FFF3EE",
    inStock: true,
    sku: "PERF-003",
    description:
      "Pure non-alcoholic attar with natural rose and saffron notes. Pocket-friendly size for daily use.",
    specs: {
      Brand: "AttarKala",
      Volume: "12ml roll-on",
      Notes: "Rose, Saffron, Sandalwood",
      Longevity: "4-6 hours",
      Alcohol: "0%",
      Warranty: "7 days return",
    },
    tags: ["Attar", "Roll-on", "Natural", "Daily"],
  },
  {
    id: "musk-al-tahara-50ml",
    name: "Musk Al Tahara 50ml",
    category: "perfume",
    subcategory: "Musk",
    price: 1499,
    originalPrice: 1999,
    rating: 4,
    reviews: 134,
    emoji: "🤍",
    image: img("1587017539504-67cfbddac569"),
    bgColor: "#FFF3EE",
    inStock: true,
    sku: "PERF-004",
    description:
      "Soft white musk fragrance with a clean, powdery finish. Ideal for daily wear and layering.",
    specs: {
      Brand: "TaharaScents",
      Volume: "50ml",
      Notes: "White Musk, Jasmine, Vanilla",
      Longevity: "5-7 hours",
      Gender: "Unisex",
      Warranty: "7 days return",
    },
    tags: ["Musk", "White Musk", "Daily", "Soft"],
  },
  {
    id: "amber-oud-edp-100ml",
    name: "Amber Oud EDP 100ml",
    category: "perfume",
    subcategory: "Oud",
    price: 2799,
    originalPrice: 3499,
    rating: 5,
    reviews: 88,
    badge: "New",
    emoji: "🧡",
    image: img("1594035910387-fea47794261f"),
    bgColor: "#FFF3EE",
    inStock: true,
    sku: "PERF-005",
    description:
      "Warm amber blended with rich oud. Premium 100ml EDP at a price jo market se kaafi kam hai.",
    specs: {
      Brand: "AmberOud",
      Volume: "100ml EDP",
      Notes: "Amber, Oud, Bergamot, Cedar",
      Longevity: "7-9 hours",
      Gender: "Unisex",
      Warranty: "7 days return",
    },
    tags: ["Amber", "Oud", "Premium", "New"],
  },
  {
    id: "white-oud-spray-75ml",
    name: "White Oud Spray 75ml",
    category: "perfume",
    subcategory: "Oud",
    price: 1999,
    originalPrice: 2499,
    rating: 3,
    reviews: 72,
    emoji: "🤍",
    image: img("1523293182086-7651a899d37f"),
    bgColor: "#FFF3EE",
    inStock: true,
    sku: "PERF-006",
    description:
      "Light, airy oud variant for everyday use. Refreshing fragrance jo office aur college dono mein suit kare.",
    specs: {
      Brand: "WhiteOud",
      Volume: "75ml spray",
      Notes: "White Oud, Citrus, Floral",
      Longevity: "5-6 hours",
      Gender: "Unisex",
      Warranty: "7 days return",
    },
    tags: ["White Oud", "Fresh", "Daily", "Affordable"],
  },
];

export const getProductById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);

export const getRelatedProducts = (product: Product, limit = 3): Product[] =>
  products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit);

export const getProductsByCategory = (category?: string): Product[] =>
  category && category !== "all" ? products.filter((p) => p.category === category) : products;

export const getFeaturedProducts = (limit = 4): Product[] =>
  products.filter((p) => p.badge).slice(0, limit);

export const categoryLabel = (category: string) =>
  category === "tech" ? "Tech Products" : category === "perfume" ? "Perfumes" : "All Products";
