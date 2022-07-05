import express from 'express';
import { titleController } from '../controllers/titleController.js';
const { Router } = express;

// Instantiate our router
export const base = Router();

// Configure route
base.use(express.json());
base.use(express.urlencoded({ extended: true }));

// Define route with the scraper
base.post('/title', titleController);
