import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

router.get('/users', userController.getAllUsers);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.post('/users/:id/link', userController.createRelationship);
router.delete('/users/:id/unlink', userController.removeRelationship);
router.get('/graph', userController.getGraphData);

export default router;