import multer from "multer";
import path from "path";
import fs from "fs";

const createUploadMiddleware = (folder: string, prefix: string) => {
    const uploadDir = path.join(__dirname, `../../uploads/${folder}`);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            const userId = (req as any).user ? ((req as any).user.id || (req as any).user._id) : "guest";
            cb(null, `${prefix}-${userId}-${uniqueSuffix}${ext}`);
        },
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed."));
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
        },
    });
};

export const profileUpload = createUploadMiddleware("profiles", "avatar");
export const bannerUpload  = createUploadMiddleware("banners", "banner");
export const teamUpload    = createUploadMiddleware("teams", "logo");

export default profileUpload;
