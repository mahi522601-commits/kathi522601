import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin only once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const STATIC_PAGES = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/shop", priority: "0.9", changefreq: "daily" },
  { url: "/about", priority: "0.7", changefreq: "monthly" },
  { url: "/contact", priority: "0.7", changefreq: "monthly" },
  { url: "/cart", priority: "0.5", changefreq: "never" },
  { url: "/wishlist", priority: "0.5", changefreq: "never" },
  { url: "/search", priority: "0.6", changefreq: "weekly" },
  { url: "/track-order", priority: "0.5", changefreq: "never" },
  { url: "/policies", priority: "0.6", changefreq: "monthly" },
  // SEO pages
  { url: "/sarees-in-hyderabad", priority: "0.8", changefreq: "weekly" },
  { url: "/sarees-in-bangalore", priority: "0.8", changefreq: "weekly" },
  { url: "/sarees-in-andhra-pradesh", priority: "0.8", changefreq: "weekly" },
  { url: "/sarees-in-guntur", priority: "0.8", changefreq: "weekly" },
  { url: "/sarees-in-ongole", priority: "0.8", changefreq: "weekly" },
  { url: "/sarees-in-vijayawada", priority: "0.8", changefreq: "weekly" },
];

export default async function handler(req, res) {
  try {
    const db = getFirestore();

    // Fetch all active products from Firestore
    const productsSnap = await db
      .collection("products")
      .where("isActive", "==", true)
      .get();

    const productUrls = productsSnap.docs.map((doc) => ({
      url: `/product/${doc.id}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: doc.updateTime?.toDate().toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
    }));

    const baseUrl = "https://khyathicollections.com";
    const today = new Date().toISOString().split("T")[0];

    const urls = [
      ...STATIC_PAGES.map(
        (p) => `
  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
      ),
      ...productUrls.map(
        (p) => `
  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
      ),
    ].join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
}