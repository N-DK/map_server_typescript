import { Router } from 'express';
import api from '../app/controllers/APIController';
import { cache } from '../middleware/cache';
const router = Router();

router.get('/interpreter', cache, api.getInterpreter);
router.post('/interpreter/create', cache, api.createInterpreter);
router.put('/interpreter/update', cache, api.updateInterpreter);
router.get('/', api.index);

export default router;
