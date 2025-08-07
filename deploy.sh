#!/bin/bash

# 🚀 Deploy Script untuk SMA Negeri 1 Jakarta Website
# Pastikan menjalankan dari folder frontend

echo "🏫 SMA Negeri 1 Jakarta - Deploy Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Jalankan script ini dari folder frontend"
    exit 1
fi

install = pip install migrate
echo "📦 Installing dependencies..."
npm install


echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build berhasil!"
    echo "📁 File build tersedia di folder 'dist'"
    echo ""
    echo "🌐 Langkah selanjutnya:"
    echo "1. Upload folder 'dist' ke hosting"
    echo "2. Atau push ke GitHub untuk auto-deploy Netlify"
    echo ""
    echo "🔗 URLs yang akan tersedia:"
    echo "   - Home: /"
    echo "   - About: /about"
    echo "   - News: /news"
    echo "   - Gallery: /gallery"
    echo "   - Contact: /contact"
    echo "   - Admin: /admin/login"
    echo ""
    echo "🔑 Login Admin:"
    echo "   Email: admin@sman1jakarta.sch.id"
    echo "   Password: admin123"
else
    echo "❌ Build gagal! Periksa error di atas."
    exit 1
fi
