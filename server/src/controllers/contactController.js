import { createDocument, listDocuments } from '../services/firestore.js';

export async function createContactMessage(req, res, next) {
  try {
    const message = await createDocument('contactMessages', {
      ...req.body,
      read: false,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
}

export async function getContactMessages(req, res, next) {
  try {
    const messages = await listDocuments('contactMessages');
    // Sort newest first
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
}

export async function markMessageRead(req, res, next) {
  try {
    const { updateDocument } = await import('../services/firestore.js');
    const message = await updateDocument('contactMessages', req.params.id, { read: true });
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
}