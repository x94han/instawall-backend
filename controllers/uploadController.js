const path = require("path");
const multer = require("multer");
const sizeOf = require("image-size");
const { ImgurClient } = require("imgur");
const AppError = require("../utility/appError");
const httpStatusCodes = require("../utility/httpStatusCodes");
const catchAsync = require("../utility/catchAsync");

const multerOptions = {
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
  fileFilter: (req, file, cb) => {
    const fileTypes = "jpg|png";
    const extname = path.extname(file.originalname).toLowerCase();
    if (new RegExp(fileTypes).test(extname)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          `只接受 ${fileTypes.split("|").join("、")} 格式`,
          httpStatusCodes.BAD_REQUEST
        )
      );
    }
  },
};

exports.checkAvatar = (req, res, next) => {
  const upload = multer(multerOptions).single("image");
  upload(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return next(new AppError(`請上傳檔案`, httpStatusCodes.BAD_REQUEST));
    }

    const dimensions = sizeOf(req.file.buffer);
    if (dimensions.width < 300 || dimensions.width !== dimensions.height) {
      return next(
        new AppError(
          `圖片必須是正方形且解析度大於 300`,
          httpStatusCodes.BAD_REQUEST
        )
      );
    }

    next();
  });
};

exports.checkImage = (req, res, next) => {
  const upload = multer(multerOptions).single("image");
  upload(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return next(new AppError(`請上傳檔案`, httpStatusCodes.BAD_REQUEST));
    }

    next();
  });
};

exports.getImgurUrl = catchAsync(async (req, res, next) => {
  const client = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN,
  });

  const response = await client.upload({
    image: req.file.buffer.toString("base64"),
    type: "base64",
    album: process.env.IMGUR_ALBUM_ID,
  });

  if (!response.success) {
    return next(new AppError(response.data, response.status));
  }

  res.status(httpStatusCodes.OK).send({
    status: "success",
    data: {
      link: response.data.link,
    },
  });
});
