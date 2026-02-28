const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../target/idl/capstone_1.json');
const destPath = path.join(__dirname, '../app/idl/capstone_1.json');

try {
  // Ensure destination directory exists
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error('Error: Source IDL file not found at', sourcePath);
    console.error('Please run "anchor build" first to generate the IDL file');
    process.exit(1);
  }

  // Copy the file
  fs.copyFileSync(sourcePath, destPath);
  console.log('✓ IDL file copied successfully from target/idl to app/idl');
} catch (error) {
  console.error('Error copying IDL file:', error.message);
  process.exit(1);
}
