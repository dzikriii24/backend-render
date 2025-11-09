import { Request, Response } from 'express';
import * as PageModel from '../models/sertifPageManagement';

export const listPages = async (req: Request, res: Response): Promise<void> => {
  try {
    const pages = await PageModel.getAllPages();
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const listPagesBySection = async (req: Request, res: Response): Promise<void> => {
  try {
    const section = req.params.section;
    const pages = await PageModel.getPagesBySection(section);
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const getPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const page = await PageModel.getPageById(id);
    if (!page) {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const createPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section, field_name, content } = req.body;
    if (!section || !field_name || !content) {
      res.status(400).json({ message: 'Missing fields' });
      return;
    }
    await PageModel.insertPage({ section, field_name, content });
    res.status(201).json({ message: 'Created' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updatePage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { field_name, content } = req.body;
    await PageModel.updatePage(id, { field_name, content });
    res.json({ message: 'Updated' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const removePage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await PageModel.deletePage(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};
