import { Router } from 'express';
import api from '../app/controllers/APIController';
import { cache } from '../middleware/cache';
const router = Router();

router.get('/interpreter', cache, api.getInterpreter);
router.post('/interpreter/create', api.createInterpreter);
router.put('/interpreter/update', api.updateInterpreter);
router.get('/', api.index);

export default router;
