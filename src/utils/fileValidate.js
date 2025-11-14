const path = require("path");

function fileValidate(file, allowedExtensions = [], maxSizeMB = 2) {

    // 1️⃣ Validate extension
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
        return {
            valid: false,
            message: `Only ${allowedExtensions.join(", ")} files are allowed`
        };
    }

    // 2️⃣ Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            message: `File size must be less than ${maxSizeMB}MB`
        };
    }

    // 3️⃣ Valid file
    return {
        valid: true,
        message: "File is valid"
    };
}

module.exports = fileValidate;
