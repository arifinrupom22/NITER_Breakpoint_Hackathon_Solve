// ============================================================================
// AI endpoints — /api/ai/...
// All predictions are computed from real system data.
// ============================================================================

import { Router } from 'express';
import { authRequired, requireRole } from '../auth.js';
import { ok, err } from '../validate.js';
import {
  predictCrowd, predictEta, bestDepartureTime, additionalBusRecommendation,
  chatbotReply, predictMaintenance,
} from '../ai/index.js';

export const router = Router();

// Public-ish: used by the public website and the chatbot widget.
router.post('/ai/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    const result = await chatbotReply(message);
    ok(res, result);
  } catch (e) {
    err(res, 500, 'Assistant temporarily unavailable');
  }
});

router.get('/ai/crowd', (req, res) => {
  const busId = String(req.query.busId || 'SB1');
  ok(res, predictCrowd(busId));
});

router.get('/ai/eta', (req, res) => {
  const busId = String(req.query.busId || 'SB1');
  ok(res, predictEta(busId));
});

router.get('/ai/departure', (req, res) => {
  ok(res, bestDepartureTime({
    routeId: String(req.query.routeId || 'r1'),
    busType: String(req.query.busType || 'Student'),
  }));
});

router.get('/ai/additional-bus', (_req, res) => ok(res, additionalBusRecommendation()));

router.use(authRequired, requireRole('admin'));
router.get('/ai/maintenance', (req, res) => {
  const busId = String(req.query.busId || 'SB1');
  ok(res, predictMaintenance(busId));
});
