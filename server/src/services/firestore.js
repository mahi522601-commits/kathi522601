import { randomUUID } from 'crypto';
import { adminDb } from '../config/firebase.js';
import { env } from '../config/environment.js';
import { seedData } from '../data/seedData.js';

const collections = new Map(
  Object.entries(seedData).map(([key, value]) => [
    key,
    Array.isArray(value) ? structuredClone(value) : structuredClone([value]),
  ]),
);

function serializeValue(value) {
  if (value?.toDate) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, serializeValue(nested)]));
  }

  return value;
}

function getCollectionName(name) {
  return name;
}

function normalizeDocument(name, id, data) {
  return {
    id,
    ...data,
    updatedAt: new Date().toISOString(),
    ...(data.createdAt ? {} : { createdAt: new Date().toISOString() }),
    ...(name === 'coupons' ? { code: data.code || id } : {}),
  };
}

async function listFromFirestore(name) {
  const snapshot = await adminDb.collection(name).get();
  return snapshot.docs.map((doc) => serializeValue({ id: doc.id, ...doc.data() }));
}

function listFromMemory(name) {
  return structuredClone(collections.get(name) || []);
}

export async function listDocuments(name) {
  const collectionName = getCollectionName(name);
  if (adminDb && !env.useMockStore) {
    return listFromFirestore(collectionName);
  }
  return listFromMemory(collectionName);
}

export async function getDocument(name, id) {
  const items = await listDocuments(name);
  return items.find((item) => item.id === id || item.slug === id || item.code === id) || null;
}

export async function createDocument(name, data, customId) {
  const collectionName = getCollectionName(name);
  const id = customId || data.id || randomUUID();
  const document = normalizeDocument(collectionName, id, data);

  if (adminDb && !env.useMockStore) {
    await adminDb.collection(collectionName).doc(id).set(document, { merge: true });
    return document;
  }

  const current = listFromMemory(collectionName);
  current.unshift(document);
  collections.set(collectionName, current);
  return document;
}

export async function updateDocument(name, id, patch) {
  const collectionName = getCollectionName(name);
  const existing = await getDocument(collectionName, id);
  if (!existing) {
    return null;
  }

  const updated = normalizeDocument(collectionName, id, {
    ...existing,
    ...patch,
    id,
  });

  if (adminDb && !env.useMockStore) {
    await adminDb.collection(collectionName).doc(id).set(updated, { merge: true });
    return updated;
  }

  const next = listFromMemory(collectionName).map((item) => (item.id === id ? updated : item));
  collections.set(collectionName, next);
  return updated;
}

export async function deleteDocument(name, id) {
  const collectionName = getCollectionName(name);

  if (adminDb && !env.useMockStore) {
    await adminDb.collection(collectionName).doc(id).delete();
    return true;
  }

  const next = listFromMemory(collectionName).filter((item) => item.id !== id && item.code !== id);
  collections.set(collectionName, next);
  return true;
}

export async function findOne(name, predicate) {
  const items = await listDocuments(name);
  return items.find(predicate) || null;
}

export async function filterDocuments(name, predicate) {
  const items = await listDocuments(name);
  return items.filter(predicate);
}
