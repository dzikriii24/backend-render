// src/controllers/certificateController.ts
import { Request, Response } from 'express';
import {
  getCertificates,
  getCertificateByKode,
  insertCertificate,
  updateCertificate,
  deleteCertificate,
} from '../models/Sertifikat';

export const getAllCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getCertificates();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getByKode = async (req: Request, res: Response): Promise<void> => {
  try {
    const kode = req.params.kode;
    const data = await getCertificateByKode(kode);
    if (!data) {
      res.status(404).json({ message: 'Sertifikat tidak ditemukan' });
      return;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    await insertCertificate(req.body);
    res.status(201).json({ message: 'Sertifikat berhasil ditambahkan' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCert = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await updateCertificate(id, req.body);
    res.json({ message: 'Sertifikat berhasil diperbarui' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCert = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await deleteCertificate(id);
    res.json({ message: 'Sertifikat berhasil dihapus' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
