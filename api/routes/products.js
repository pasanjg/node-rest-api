const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const ProductsController = require('../controlers/products');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    // filter files extensions
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
    } else {
        callback(null, false);
        console.log('Invalid file extension');
    }

};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});



router.get('/', ProductsController.get_products_all);
router.post('/', checkAuth, upload.single('productImage'), ProductsController.create_product);
router.get('/:productId', ProductsController.get_product);
router.patch('/:productId', checkAuth, ProductsController.update_product);
router.delete('/:productId', checkAuth, ProductsController.delete_product);

module.exports = router;