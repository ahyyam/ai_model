const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Firebase deployment process...');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('pnpm install', { stdio: 'inherit' });

  // Step 2: Build the Next.js app
  console.log('🔨 Building Next.js app...');
  execSync('pnpm build', { stdio: 'inherit' });

  // Step 3: Copy the entire app to functions directory
  console.log('📁 Copying app to Firebase Functions...');
  
  // Create functions directory if it doesn't exist
  if (!fs.existsSync('functions')) {
    fs.mkdirSync('functions');
  }

  // Copy all necessary files to functions directory
  const filesToCopy = [
    'app',
    'components',
    'lib',
    'hooks',
    'styles',
    'public',
    'next.config.mjs',
    'tailwind.config.ts',
    'postcss.config.mjs',
    'tsconfig.json',
    '.env',
    '.env.local'
  ];

  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        // Copy directory recursively
        copyDir(file, `functions/${file}`);
      } else {
        // Copy file
        fs.copyFileSync(file, `functions/${file}`);
      }
      console.log(`✅ Copied ${file}`);
    }
  });

  // Step 4: Install dependencies in functions directory
  console.log('📦 Installing dependencies in functions directory...');
  execSync('cd functions && pnpm install', { stdio: 'inherit' });

  // Step 5: Deploy to Firebase
  console.log('🔥 Deploying to Firebase...');
  execSync('firebase deploy', { stdio: 'inherit' });

  console.log('✅ Firebase deployment completed successfully!');
  console.log('🌐 Your complete Next.js app is now running on Firebase with all API routes!');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
} 