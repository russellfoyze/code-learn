// import express from 'express'
// import {listProduct, addProduct ,removeProduct, singleProduct} from '../controllers/productController.js'
// import upload from '../middleware/multer.js';

// const productRouter = express.Router();

// productRouter.post('/add',upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]), addProduct);
// productRouter.post('/remove', removeProduct);
// productRouter.post('/single', listProduct);
// productRouter.get("/list" ,listProduct)

// export default productRouter
import express from 'express';
import {
    listProduct,
    addProduct,
    removeProduct,
    singleProduct
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';




const productRouter = express.Router();

// Middleware to handle file uploads - files are completely optional
const uploadFiles = (req, res, next) => {
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
    ])(req, res, (err) => {
        // Ignore multer errors if no files are provided - files are optional
        if (err) {
            // Multer errors can be safely ignored if files are optional
            // Just ensure req.files exists
            if (!req.files) {
                req.files = {};
            }
            // Continue to next middleware even if there's an error
            return next();
        }
        // Ensure req.files exists even if no files were uploaded
        if (!req.files) {
            req.files = {};
        }
        next();
    });
};

productRouter.post(
    '/add', 
    adminAuth,
    uploadFiles,
    addProduct
);
productRouter.post('/remove', adminAuth,removeProduct);
// productRouter.post('/single',adminAuth, singleProduct); // Use GET with a parameter to fetch a single product
productRouter.get('/single/:id', adminAuth, singleProduct);
productRouter.get("/list", listProduct);


export default productRouter;
 