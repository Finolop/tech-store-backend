import { Router } from 'express';
import {
  getCategories,
  getBanners,
  getProducts,
  getProductBySlug,
} from './product.controller';

const router = Router();

router.get('/categories', getCategories);
router.get('/banners', getBanners);
router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);

export default router;