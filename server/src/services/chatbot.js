const PRODUCT_INTENTS = {
  saree: ['saree', 'sarees', 'sari'],
  halfSaree: ['half saree', 'langa', 'pavada'],
  dress: ['dress', 'frock', 'gown'],
  silk: ['silk', 'pattu', 'kanchipuram', 'kanchi'],
  cotton: ['cotton', 'mul', 'khadi'],
  georgette: ['georgette', 'chiffon'],
  price: ['price', 'cost', 'how much', 'rate', 'cheap', 'budget'],
  shipping: ['shipping', 'delivery', 'ship', 'dispatch', 'days'],
  return: ['return', 'refund', 'exchange', 'replace'],
  size: ['size', 'measurement', 'fit', 'blouse', 'length'],
  care: ['wash', 'care', 'clean', 'iron', 'dry clean'],
  color: ['color', 'colour', 'shade', 'available'],
  offer: ['offer', 'discount', 'sale', 'coupon', 'off'],
  track: ['track', 'order', 'status', 'where is my'],
  greeting: ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon'],
};

const RESPONSES = {
  greeting: [
    {
      text: "Namaste! Welcome to Khyathi Collections. I'm Khyathi, your personal fashion guide. How can I help you find the perfect saree today?",
      suggestions: ['Browse Sarees', 'New Arrivals', 'Offers', 'Help with Order'],
    },
  ],
  saree: [
    {
      text: 'We have a gorgeous collection of sarees. From lightweight Georgette to luxurious Kanchi Pattu, there is something here for every occasion. What type are you looking for?',
      suggestions: ['Silk Sarees', 'Cotton Sarees', 'Georgette Sarees', 'Under Rs. 1000'],
      products: true,
    },
  ],
  silk: [
    {
      text: 'Our silk sarees are exquisite. We carry Kanchipuram Pattu, Semi-Mysore Silk, Space Silk, and Rangoli Silk varieties. Prices start from Rs. 899.',
      suggestions: ['Kanchi Pattu', 'Space Silk', 'Semi-Mysore', 'View All Silk'],
    },
  ],
  price: [
    {
      text: 'We focus on genuine quality at fair prices.\n\n- Budget range: Rs. 750 to Rs. 1,200\n- Mid range: Rs. 1,200 to Rs. 2,000\n- Premium: Rs. 2,000 to Rs. 5,000\n\nWe always show the original MRP so you know exactly how much you are saving.',
      suggestions: ['Under Rs. 1000', 'Under Rs. 2000', 'Premium Collection'],
    },
  ],
  shipping: [
    {
      text: 'Great news. We offer free shipping on all orders.\n\n- Hyderabad: 1 to 2 days\n- Andhra Pradesh and Telangana: 2 to 3 days\n- Rest of India: 4 to 6 days',
      suggestions: ['Track My Order', 'Return Policy', 'Contact Us'],
    },
  ],
  return: [
    {
      text: 'We have a hassle-free return policy.\n\n- Returns accepted within 7 days of delivery\n- Item must be unworn and unwashed\n- Original packaging required\n- Refunds are processed in 5 to 7 business days',
      suggestions: ['Initiate Return', 'Contact Support', 'Refund Policy'],
    },
  ],
  size: [
    {
      text: 'Saree size guide.\n\nAll our sarees are standard 6.3 meters including blouse piece.\nBlouse sizes available: S (36), M (38), L (40), XL (42), XXL (44).',
      suggestions: ['Blouse Tips', 'Half Saree Sizes', 'Contact Us'],
    },
  ],
  care: [
    {
      text: 'Fabric care guide.\n\nSilk sarees: Dry clean only or gentle hand wash with cold water.\nCotton: Machine wash cold, gentle cycle.\nGeorgette and chiffon: Hand wash only, no wringing.',
      suggestions: ['More Tips', 'Contact Us'],
    },
  ],
  offer: [
    {
      text: 'Exciting updates at Khyathi Collections.\n\n- Free shipping on all orders\n- Curated festive and occasion-ready edits\n- Surprise offers are shared on Instagram first',
      suggestions: ['Browse Featured Styles', 'Follow on Instagram', 'Share on WhatsApp'],
    },
  ],
  track: [
    {
      text: 'To track your order, visit My Account, open My Orders, and select your order number to see status updates in real time.',
      suggestions: ['My Account', 'Contact Support', 'WhatsApp Us'],
    },
  ],
  default: [
    {
      text: 'I would love to help you find the perfect piece. You can ask me about saree types, fabrics, pricing, delivery, returns, care instructions, or order tracking.',
      suggestions: ['Browse Collection', 'New Arrivals', 'Offers', 'Contact Us'],
    },
  ],
};

function detectIntent(message) {
  const lower = message.toLowerCase();

  for (const [intent, keywords] of Object.entries(PRODUCT_INTENTS)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return intent;
    }
  }

  return 'default';
}

export async function getChatbotResponse(message, history = [], context = {}) {
  const intent = detectIntent(message);
  const options = RESPONSES[intent] || RESPONSES.default;
  const response = options[Math.floor(Math.random() * options.length)];

  return {
    text: response.text,
    suggestions: response.suggestions || [],
    fetchProducts: response.products || false,
    intent,
    historyLength: history.length,
    context,
    timestamp: new Date().toISOString(),
  };
}
