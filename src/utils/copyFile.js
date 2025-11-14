const fs = require("fs");
const path = require("path");

async function copyFile(file, folderName) {
    const uploadsPath = path.join(__dirname, "..", "uploads", folderName);

    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const sourcePath = file.path;
    const destPath = path.join(uploadsPath, file.filename);

    await fs.promises.copyFile(sourcePath, destPath);

    return destPath;
}

module.exports = copyFile;
