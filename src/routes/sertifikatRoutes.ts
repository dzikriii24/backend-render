// src/routes/certificateRoutes.ts
import express from 'express';
import {
    getAllCertificates,
    getByKode,
    createCertificate,
    updateCert,
    deleteCert,
} from '../routes/sertifikatYmp';

const SertifikatRouter = express.Router();

SertifikatRouter.get('/', getAllCertificates);
SertifikatRouter.get('/:kode', getByKode);
SertifikatRouter.post('/', createCertificate);
SertifikatRouter.put('/:id', updateCert);
SertifikatRouter.delete('/:id', deleteCert);

export default SertifikatRouter;
