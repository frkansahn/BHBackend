var express = require('express');
var router = express.Router();
const path = require('path');
var multer = require('multer');
const passport = require('passport');
const fs = require('fs');
const sharp = require('sharp');
const Jimp = require('jimp');

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
var IMAGE_PATH = process.env.IMAGE_PATH;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, IMAGE_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname.replace(' ', ''));
    }
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb("Please upload only images.", false);
    }
};

var storageProduct = multer.memoryStorage();

var upload = multer({ storage: storage });
var uploadProductImages = multer(
    {
        storage: storageProduct,
        fileFilter: multerFilter
    }
);

router.post('/uploadProductImage', passport.authenticate('admin-rule', { session: false }), uploadProductImages.array('files', 100), async function (req, res, next) {
    try {
        let imagesList = [];
        fs.mkdir(IMAGE_PATH + '/product', (err) => { });
        await Promise.all(
            req.files.map(async file => {
                const filename = file.originalname.replace(/\ ..+$/, "");
                const newFilenameBig = `product-image-${filename}-${Date.now()}-B.jpeg`;
                const newFilenameMedium = `product-image-${filename}-${Date.now()}-M.jpeg`;
                const newFilenameSmall = `product-image-${filename}-${Date.now()}-S.jpeg`;

                await sharp(file.buffer)
                    .resize(1200)
                    .toFormat("jpeg")
                    .jpeg({ quality: 90 })
                    .toFile(`${IMAGE_PATH}/product/${newFilenameBig}`);

                await sharp(file.buffer)
                    .resize(600)
                    .toFormat("jpeg")
                    .jpeg({ quality: 90 })
                    .toFile(`${IMAGE_PATH}/product/${newFilenameMedium}`);

                await sharp(file.buffer)
                    .resize(400)
                    .toFormat("jpeg")
                    .jpeg({ quality: 90 })
                    .toFile(`${IMAGE_PATH}/product/${newFilenameSmall}`);

                imagesList.push({
                    B: `${process.env.IMAGE_RETURN_PATH}product/${newFilenameBig}`,
                    M: `${process.env.IMAGE_RETURN_PATH}product/${newFilenameMedium}`,
                    S: `${process.env.IMAGE_RETURN_PATH}product/${newFilenameSmall}`
                });
            })
        );
        res.send({ images: imagesList });
    }
    catch (error) {
        res.send(400);
    }
});

router.post('/uploadMultiple',  passport.authenticate('admin-rule', { session: false }) , upload.array('profiles', 4), function (req, res, next) {
    try {
        res.send({ location: req.files[0].filename });
    }
    catch (error) {
        res.send(400);
    }
});

router.post('/upload', passport.authenticate('admin-rule', { session: false }), uploadProductImages.array('file', 100), async function (req, res, next) {
    try {
        let filename, quality = req.query.quality || 90;
        fs.mkdir(IMAGE_PATH + '/image/big', (err) => { });
        fs.mkdir(IMAGE_PATH + '/image/medium', (err) => { });
        fs.mkdir(IMAGE_PATH + '/image/small', (err) => { });
        await Promise.all(
            req.files.map(async file => {
                filename = file.originalname.replace(/\ ..+$/, "") + `-${Date.now()}`;

                await sharp(file.buffer)
                    .resize(1920)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/extra_big/${filename}.jpeg`);


                await sharp(file.buffer)
                    .resize(1920)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/extra_big/${filename}.webp`);

                await sharp(file.buffer)
                    .resize(1600)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/big/${filename}.jpeg`);

                await sharp(file.buffer)
                    .resize(1600)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/big/${filename}.webp`);

                await sharp(file.buffer)
                    .resize(900)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/medium/${filename}.jpeg`);

                await sharp(file.buffer)
                    .resize(900)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/medium/${filename}.webp`);

                await sharp(file.buffer)
                    .resize(400)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/small/${filename}.jpeg`);

                await sharp(file.buffer)
                    .resize(400)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/small/${filename}.webp`);

                await sharp(file.buffer)
                    .resize(100)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/extra_small/${filename}.jpeg`);

                await sharp(file.buffer)
                    .resize(100)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/extra_small/${filename}.webp`);
                    

                // await Jimp.read(file.buffer)
                // .then(async image => {
                //     await image.resize(1600,Jimp.AUTO)
                //     .quality(90)
                //     .write(`${IMAGE_PATH}/image/big/${filename}.jpeg`);

                //     await image.resize(900,Jimp.AUTO)
                //     .quality(90)
                //     .write(`${IMAGE_PATH}/image/medium/${filename}.jpeg`);

                //     await image.resize(400,Jimp.AUTO)
                //     .quality(90)
                //     .write(`${IMAGE_PATH}/image/small/${filename}.jpeg`);
                // })
                // .catch(err => {
                //     console.log(err);
                // });
            })
        );
        res.send({ location: filename });
    }
    catch (error) {
        res.send({status:400 , err:error , req:req.files});
    }
});

router.post('/uploads',  passport.authenticate('admin-rule', { session: false }) ,uploadProductImages.array('files', 100), async function (req, res, next) {
    try {
        let filenames = [], quality = req.query.quality || 90;
        await Promise.all(
            req.files.map(async file => {
                let filename = file.originalname.replace(/\ ..+$/, "").trim() + `-${Date.now()}`;
                filenames.push(filename);

                await sharp(file.buffer)
                    .resize(1920)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/extra_big/${filename}.jpeg`);   

                await sharp(file.buffer)
                    .resize(1600)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/big/${filename}.jpeg`);                

                await sharp(file.buffer)
                    .resize(900)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/medium/${filename}.jpeg`);

                await sharp(file.buffer)
                    .resize(400)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/small/${filename}.jpeg`);

                await sharp(file.buffer)
                    .resize(100)
                    .toFormat("jpeg")
                    .jpeg({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/extra_small/${filename}.jpeg`);

                await sharp(file.buffer)
                    .resize(1920)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/extra_big/${filename}.webp`);

                await sharp(file.buffer)
                    .resize(1600)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/big/${filename}.webp`);

                await sharp(file.buffer)
                    .resize(900)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/medium/${filename}.webp`);

                await sharp(file.buffer)
                    .resize(400)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/small/${filename}.webp`);  
                    
                    
                await sharp(file.buffer)
                    .resize(100)
                    .toFormat("webp")
                    .webp({ quality: quality })
                    .toFile(`${IMAGE_PATH}/image/extra_small/${filename}.webp`);  


                await snooze(3000);
            })
        );
        res.send({ images: filenames });
    }
    catch (error) {
        res.send({status:400 , err:error , req:req.files});
    }
});

router.post('/removeFile', passport.authenticate('admin-rule', { session: false }), function (req, res, next) {
    var fileName = req.body.filename;
    (async () => {
        try {
            await fs.unlinkSync(IMAGE_PATH + "/image/big/" + fileName + '.jpeg');
            await fs.unlinkSync(IMAGE_PATH + "/image/medium/" + fileName + '.jpeg');
            await fs.unlinkSync(IMAGE_PATH + "/image/small/" + fileName + '.jpeg');
            await fs.unlinkSync(IMAGE_PATH + "/image/extra_small/" + fileName + '.jpeg');
            await fs.unlinkSync(IMAGE_PATH + "/image/big/" + fileName + '.webp');
            await fs.unlinkSync(IMAGE_PATH + "/image/medium/" + fileName + '.webp');
            await fs.unlinkSync(IMAGE_PATH + "/image/small/" + fileName + '.webp');
            await fs.unlinkSync(IMAGE_PATH + "/image/extra_small/" + fileName + '.webp');
            res.send(true);
        } catch (e) {
            res.send(false);
        }
    })();

});

router.post('/uploadEditor' , upload.array('file') ,function(req, res, next){
    try {
        res.send({location : process.env.API_SITE_URL + '/Data/' + req.files[0].filename});
  } 
  catch(error) {
    res.send(400);
  }
});

router.post('/uploadCustomer', passport.authenticate('admin-rule', { session: false }) , upload.array('file'), function (req, res, next) {
    try {
        res.send({ location: process.env.IMAGE_RETURN_PATH + req.files[0].filename });
    }
    catch (error) {
        res.send(400);
    }
});

router.post('/removeFileCustomer', passport.authenticate('admin-rule', { session: false }) , function (req, res, next) {
    var fileName = req.body.filename;
    var filePath = IMAGE_PATH + fileName;
    (async () => {
        try {
            var response = await fs.unlinkSync(filePath);
            res.send(true);
        } catch (e) {
            res.send(false);
            console.log(e);
        }
    })();

});



module.exports = router;