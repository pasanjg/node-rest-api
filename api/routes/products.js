const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

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

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc.id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    console.log('storage: ' + this.storage);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "Created product successfully",
            createdProduct: {
                name: result.name,
                price: result.price,
                id: result.id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/procducts/' + result._id
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });


});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log('From database', doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    response: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + doc.id
                    }
                });
            } else {
                res.status(404).json({ message: "Product not found" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .select('name price _id')
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product updated',
                product: result,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result.id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    data: {
                        name: 'String',
                        price: 'number'
                    }
                }
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});

module.exports = router;