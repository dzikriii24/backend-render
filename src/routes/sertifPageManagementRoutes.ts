import { Router } from 'express';
import * as Ctrl from '../controllers/sertifPageManagementController';

const sertifPageManagements = Router();

sertifPageManagements.get('/', Ctrl.listPages);
sertifPageManagements.get('/section/:section', Ctrl.listPagesBySection);
sertifPageManagements.get('/:id', Ctrl.getPage);
sertifPageManagements.post('/', Ctrl.createPage);
sertifPageManagements.put('/:id', Ctrl.updatePage);
sertifPageManagements.delete('/:id', Ctrl.removePage);

export default sertifPageManagements;
