# Proxmox VM Dashboard 🖥️

[English](#english) | [Türkçe](#türkçe)

---

# Türkçe

## 📋 Proje Hakkında

Proxmox VM Dashboard, Proxmox sunucunuzdaki sanal makineleri izlemek ve yönetmek için modern bir web arayüzüdür. Next.js, TypeScript ve Tailwind CSS kullanılarak geliştirilmiştir.

## 📸 Ekran Görüntüleri

### Ana Sayfa - Kart Görünümü (Açık Tema)
![Ana Sayfa Kart Görünümü](/public/screenshots/home-grid-light.png)
*VM'lerin kart görünümü ve hızlı durum bilgileri*

### Ana Sayfa - Liste Görünümü (Koyu Tema)
![Ana Sayfa Liste Görünümü](/public/screenshots/home-list-dark.png)
*VM'lerin detaylı liste görünümü*

### VM Detay Sayfası
![VM Detay Sayfası](/public/screenshots/vm-details.png)
*Sanal makine detaylı bilgileri ve performans metrikleri*

### Responsive Tasarım
![Mobil Görünüm](/public/screenshots/mobile-view.png)
*Mobil cihazlarda uyumlu görünüm*

### 🌟 Özellikler

- 🔄 Gerçek zamanlı VM durumu izleme
- 📊 Detaylı kaynak kullanımı (CPU, RAM, Disk)
- 🎨 Kart ve liste görünümü seçenekleri
- 🌓 Koyu/Açık tema desteği
- 📱 Responsive tasarım
- 🔄 30 saniyelik otomatik yenileme
- 🔒 Güvenli API bağlantısı

### 🚀 Başlangıç

1. Projeyi klonlayın:
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
PROXMOX_API_URL=https://your-proxmox-host:8006/api2/json
PROXMOX_USERNAME=your-username
PROXMOX_PASSWORD=your-password
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

### 🛠️ Teknolojiler

- **Frontend Framework**: Next.js 13 (App Router)
- **Programlama Dili**: TypeScript
- **Stil**: Tailwind CSS
- **State Yönetimi**: Zustand
- **HTTP Client**: Axios
- **Icons**: Heroicons

### 📦 Proje Yapısı

```
src/
├── app/                # Next.js app router sayfaları
├── components/         # Yeniden kullanılabilir bileşenler
├── lib/               # Yardımcı fonksiyonlar ve API istemcisi
├── store/             # Zustand state yönetimi
└── types/             # TypeScript tipleri
```

---

# English

## 📋 About

Proxmox VM Dashboard is a modern web interface for monitoring and managing virtual machines on your Proxmox server. Built with Next.js, TypeScript, and Tailwind CSS.

## 📸 Screenshots

### Home Page - Card View (Light Theme)
![Home Page Card View](/public/screenshots/home-grid-light.png)
*VM card view with quick status information*

### Home Page - List View (Dark Theme)
![Home Page List View](/public/screenshots/home-list-dark.png)
*Detailed list view of VMs*

### VM Detail Page
![VM Detail Page](/public/screenshots/vm-details.png)
*Virtual machine detailed information and performance metrics*

### Responsive Design
![Mobile View](/public/screenshots/mobile-view.png)
*Responsive layout on mobile devices*

### 🌟 Features

- 🔄 Real-time VM status monitoring
- 📊 Detailed resource usage (CPU, RAM, Disk)
- 🎨 Card and list view options
- 🌓 Dark/Light theme support
- 📱 Responsive design
- 🔄 30-second auto-refresh
- 🔒 Secure API connection

### 🚀 Getting Started

1. Clone the project:
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
PROXMOX_API_URL=https://your-proxmox-host:8006/api2/json
PROXMOX_USERNAME=your-username
PROXMOX_PASSWORD=your-password
```

4. Start the development server:
```bash
npm run dev
```

### 🛠️ Technologies

- **Frontend Framework**: Next.js 13 (App Router)
- **Programming Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Heroicons

### 📦 Project Structure

```
src/
├── app/                # Next.js app router pages
├── components/         # Reusable components
├── lib/               # Utility functions and API client
├── store/             # Zustand state management
└── types/             # TypeScript types
```

---

## 📝 License

MIT License
