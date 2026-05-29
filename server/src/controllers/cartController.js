import { quoteCartItems } from '../services/cartPricing.js';

export async function quoteCart(req, res, next) {
  try {
    const quote = await quoteCartItems(req.body?.items || []);
    res.json({ success: true, cart: quote });
  } catch (error) {
    next(error);
  }
}
