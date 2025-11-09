import { Request, Response } from 'express';
import * as Model from '../models/detailSertifManagement';

// GET all
export const listDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await Model.getAllDetails();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

// GET by field name
export const getDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const field = req.params.field;
    const row = await Model.getDetailByField(field);
    if (!row) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

// CREATE
export const createDetail = async (req: Request, res: Response): Promise<void> => {
  const { field_name, content } = req.body;
  if (!field_name || content == null) {
    res.status(400).json({ message: 'Missing fields' });
    return;
  }

  try {
    await Model.insertDetail({ field_name, content });
    res.status(201).json({ message: 'Created' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateDetail = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { content } = req.body;
  try {
    await Model.updateDetail(id, { content });
    res.json({ message: 'Updated' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteDetail = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  try {
    await Model.deleteDetail(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};
