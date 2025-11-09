import { Router } from 'express';
import * as Ctrl from '../controllers/detailSertifController';

const detailSertifManagements = Router();

detailSertifManagements.get('/', Ctrl.listDetails);
detailSertifManagements.get('/field/:field', Ctrl.getDetail);
detailSertifManagements.post('/', Ctrl.createDetail);
detailSertifManagements.put('/:id', Ctrl.updateDetail);
detailSertifManagements.delete('/:id', Ctrl.deleteDetail);

export default detailSertifManagements;
