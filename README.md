# Proxmox VM Dashboard

Proxmox VE sunucularınızdaki sanal makineleri yönetmek ve izlemek için modern bir web arayüzü.

🌐 **Demo:** [https://proxmox-vm-dashboard.netlify.app/](https://proxmox-vm-dashboard.netlify.app/)

## Özellikler

- 🖥️ Tüm sanal makinelerin tek bir panelden yönetimi
- 📊 Gerçek zamanlı CPU, RAM ve disk kullanım istatistikleri
- 🔒 Gelişmiş güvenlik ayarları yönetimi
  - SSH Anahtar Kimlik Doğrulaması
  - Güvenlik Duvarı Durumu
  - TPM (Trusted Platform Module) Durumu
  - SPICE Şifreleme
  - VNC Şifreleme
- 💾 Detaylı depolama cihazları yönetimi
- 🌙 Koyu mod desteği
- 🔄 Otomatik yenileme (30 saniye)
- 📱 Mobil uyumlu tasarım

## Teknolojiler

- ⚡ Next.js 14 (App Router)
- 🎨 Tailwind CSS
- 🔷 TypeScript
- 🔧 ESLint & Prettier
- 🐳 Docker desteği
- 🚀 Netlify deployment

## Başlangıç

1. Repoyu klonlayın:
```bash
git clone https://github.com/yourusername/proxmox-vm-dashboard.git
cd proxmox-vm-dashboard
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env.local` dosyasını oluşturun:
```env
PROXMOX_API_URL=https://your-proxmox-server:8006/api2/json
PROXMOX_USERNAME=your-username@pam
PROXMOX_PASSWORD=your-password
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Docker ile Çalıştırma

```bash
# Build
docker build -t proxmox-vm-dashboard .

# Çalıştırma
docker run -p 3000:3000 \
  -e PROXMOX_API_URL=https://your-proxmox-server:8006/api2/json \
  -e PROXMOX_USERNAME=your-username@pam \
  -e PROXMOX_PASSWORD=your-password \
  proxmox-vm-dashboard
```

---

# Proxmox VM Dashboard

A modern web interface for managing and monitoring virtual machines on your Proxmox VE servers.

🌐 **Demo:** [https://proxmox-vm-dashboard.netlify.app/](https://proxmox-vm-dashboard.netlify.app/)

## Features

- 🖥️ Manage all virtual machines from a single dashboard
- 📊 Real-time CPU, RAM, and disk usage statistics
- 🔒 Advanced security settings management
  - SSH Key Authentication
  - Firewall Status
  - TPM (Trusted Platform Module) Status
  - SPICE Encryption
  - VNC Encryption
- 💾 Detailed storage devices management
- 🌙 Dark mode support
- 🔄 Auto-refresh (30 seconds)
- 📱 Mobile-responsive design

## Technologies

- ⚡ Next.js 14 (App Router)
- 🎨 Tailwind CSS
- 🔷 TypeScript
- 🔧 ESLint & Prettier
- 🐳 Docker support
- 🚀 Netlify deployment

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/proxmox-vm-dashboard.git
cd proxmox-vm-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
PROXMOX_API_URL=https://your-proxmox-server:8006/api2/json
PROXMOX_USERNAME=your-username@pam
PROXMOX_PASSWORD=your-password
```

4. Start the development server:
```bash
npm run dev
```

## Running with Docker

```bash
# Build
docker build -t proxmox-vm-dashboard .

# Run
docker run -p 3000:3000 \
  -e PROXMOX_API_URL=https://your-proxmox-server:8006/api2/json \
  -e PROXMOX_USERNAME=your-username@pam \
  -e PROXMOX_PASSWORD=your-password \
  proxmox-vm-dashboard
```
