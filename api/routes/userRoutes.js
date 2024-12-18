const userController = require("../controller/userController");
const middleware = require("../config/middleware")
const express = require("express");
const router = express.Router();

router.route('/signup').post(userController.signup);
router.route('/list').get(userController.getUsers);
router.route('/update').put(userController.updateUser);
router.route('/getuserbyid').get(middleware, userController.getUserById);
router.route('/login').post(userController.login);
router.route('/login-auth').post(userController.loginAuth);
router.route('/delete').delete(userController.delete);
router.route('/changepass').patch(middleware, userController.changePassword);
router.route('/search').get(userController.search);






module.exports = router;