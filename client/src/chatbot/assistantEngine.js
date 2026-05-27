import knowledgeBase from './knowledgeBase.json';
import { siteConfig } from '../config/site';

function normalize(value = '') {
  return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function detectIntent(message = '') {
  const normalized = normalize(message);
  let bestIntent = 'default';
  let bestScore = 0;

  knowledgeBase.intents.forEach((intent) => {
    const score = intent.keywords.reduce(
      (total, keyword) => total + (normalized.includes(keyword) ? keyword.split(' ').length : 0),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent.name;
    }
  });

  if (!bestScore && normalized.includes('recommend')) {
    if (normalized.includes('jewel')) {
      return 'jewellery';
    }

    return 'sarees';
  }

  return bestIntent;
}

function getIntentConfig(intentName) {
  return knowledgeBase.intents.find((intent) => intent.name === intentName) || null;
}

function selectProducts(products, predicate, limit = 3) {
  return products
    .filter(predicate)
    .sort((left, right) => (right.soldCount || 0) - (left.soldCount || 0))
    .slice(0, limit);
}

function buildWelcomeMessage(context = {}) {
  const pageHint =
    context.page === '/collections/jewellery'
      ? 'I can help you match a jewellery set to your saree.'
      : context.page === '/collections/sarees'
      ? 'I can help you choose a saree by occasion, budget, or fabric.'
      : 'I can help you choose a saree, suggest jewellery, or answer delivery and payment questions.';

  return {
    id: 'init',
    role: 'bot',
    text: `${getTimeGreeting()} and welcome to ${siteConfig.name}.\n\n${pageHint}`,
    suggestions: knowledgeBase.greetingSuggestions,
    timestamp: new Date().toISOString(),
  };
}

function buildSupportReply(baseText) {
  return `${baseText}\n\nCall: ${siteConfig.phoneDisplay}\nLocation: ${siteConfig.location}\nInstagram: ${siteConfig.instagramHandle}`;
}

function buildResponse(intent, products, context = {}) {
  const config = getIntentConfig(intent);
  const baseText = config?.responses?.[0] || knowledgeBase.fallbackSuggestions[0];
  const suggestions = config?.suggestions || knowledgeBase.fallbackSuggestions;
  const isJewelleryPage = context.page === '/collections/jewellery';
  const isSareePage = context.page === '/collections/sarees';

  if (intent === 'greeting') {
    return {
      text: `${baseText}\n\nYou can ask for saree ideas, jewellery recommendations, delivery updates, payment help, or direct support.`,
      suggestions,
      products: [],
    };
  }

  if (intent === 'sarees') {
    const recommended = selectProducts(
      products,
      (product) => product.category === 'Sarees' || product.category === 'Half Sarees',
    );

    return {
      text: `${baseText}\n\nI recommend looking at graceful drapes with strong reviews, festive colors, and balanced pricing first.`,
      suggestions,
      products: recommended,
    };
  }

  if (intent === 'jewellery') {
    const recommended = selectProducts(
      products,
      (product) => product.category === 'Jewellery',
    );

    return {
      text: `${baseText}\n\nIf you are styling for a wedding or festive event, temple and kundan-inspired pieces are especially versatile.`,
      suggestions,
      products: recommended,
    };
  }

  if (intent === 'bridal') {
    const sarees = selectProducts(products, (product) => product.category === 'Sarees', 2);
    const jewellery = selectProducts(products, (product) => product.category === 'Jewellery', 1);

    return {
      text: `${baseText}\n\nA polished bridal look usually starts with one hero saree, then jewellery that frames the neckline without crowding the drape.`,
      suggestions,
      products: [...sarees, ...jewellery],
    };
  }

  if (intent === 'delivery') {
    return {
      text: `${baseText}\n\nStandard guidance:\n- Processing usually starts quickly after confirmation.\n- Delivery windows are typically shorter within Andhra Pradesh and Telangana.\n- For urgent requirements, contact our team directly before placing the order.`,
      suggestions,
      products: [],
    };
  }

  if (intent === 'payment') {
    return {
      text: `${baseText}\n\nAvailable help:\n- Razorpay supports secure online checkout.\n- You can pay with UPI, cards, netbanking, or supported wallets.\n- If a payment fails, you can retry safely from checkout.`,
      suggestions,
      products: [],
    };
  }

  if (intent === 'returns') {
    return {
      text: `${baseText}\n\nIf you already placed an order, keep your order number ready and our team can guide you faster.`,
      suggestions,
      products: [],
    };
  }

  if (intent === 'care') {
    return {
      text: `${baseText}\n\nQuick tips:\n- Premium sarees are best stored in a breathable cover.\n- Jewellery should be kept dry and away from perfume.\n- Heavier festive pieces benefit from careful folding after each wear.`,
      suggestions,
      products: [],
    };
  }

  if (intent === 'offers') {
    const recommended = selectProducts(
      products,
      (product) =>
        product.isFeatured ||
        (isJewelleryPage && product.category === 'Jewellery') ||
        (isSareePage && (product.category === 'Sarees' || product.category === 'Half Sarees')),
    );

    return {
      text: `${baseText}\n\nFor the latest surprise offers, Instagram is the fastest place to watch curated drops and festive highlights.`,
      suggestions,
      products: recommended,
    };
  }

  if (intent === 'support') {
    return {
      text: buildSupportReply(baseText),
      suggestions,
      products: [],
    };
  }

  const pageProducts = isJewelleryPage
    ? selectProducts(products, (product) => product.category === 'Jewellery')
    : isSareePage
    ? selectProducts(products, (product) => product.category === 'Sarees' || product.category === 'Half Sarees')
    : selectProducts(products, (product) => product.isFeatured);

  return {
    text: `I can help with saree recommendations, jewellery suggestions, delivery questions, payments, and direct support.\n\nIf you want the fastest help, tell me the occasion, budget, or collection you are interested in.`,
    suggestions: knowledgeBase.fallbackSuggestions,
    products: pageProducts,
  };
}

export function createWelcomeMessage(context = {}) {
  return buildWelcomeMessage(context);
}

export function generateAssistantReply({ message, history = [], products = [], context = {} }) {
  const intent = detectIntent(message);
  const reply = buildResponse(intent, products, context);

  return {
    ...reply,
    intent,
    timestamp: new Date().toISOString(),
    historyLength: history.length,
  };
}
