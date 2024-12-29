/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['your-proxmox-domain.com'], // Proxmox sunucunuzun domain'ini ekleyin
  },
  env: {
    PROXMOX_API_URL: process.env.PROXMOX_API_URL,
    PROXMOX_USERNAME: process.env.PROXMOX_USERNAME,
    PROXMOX_PASSWORD: process.env.PROXMOX_PASSWORD,
  }
}

module.exports = nextConfig 