const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

function generateUniqueName(originalName) {
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    return `${randomString}${ext}`;
}

const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = path.join(__dirname, "..", "uploads", "tmp");
        ensureDirectoryExists(dirPath);
        cb(null, dirPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = generateUniqueName(file.originalname);
        cb(null, uniqueName);
    }
});

const fileupload = multer({ storage: storage });

module.exports = fileupload;
