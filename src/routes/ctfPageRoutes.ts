// routes/ctfPageRoutes.ts
import { Router } from 'express';
import {
  getCtfPageContent,
  updateCtfPageContent,
  getCtfPageContentBySection
} from '../controllers/ctfPageController';

const router = Router();

// ⚠️ FIX: Pastikan path ini relative ke base path '/api/ctf-page-management'
router.get('/', getCtfPageContent);
router.put('/:id', updateCtfPageContent);
router.get('/section/:section', getCtfPageContentBySection);

// ⚠️ FIX: Tambahkan route debug
router.get('/debug', (req, res) => {
  console.log('Debug route accessed');
  res.json({ 
    message: 'CTF Page Management router is working!',
    timestamp: new Date().toISOString()
  });
});

export default router;