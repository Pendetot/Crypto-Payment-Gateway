# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2025-06-14

### Added
- File .env.example untuk memudahkan konfigurasi environment
- Contoh kode PHP lengkap di folder example/ untuk integrasi payment gateway
- Dokumentasi yang lebih komprehensif untuk setup dan konfigurasi

### Changed
- Perbaikan link dokumentasi di README.md
- Peningkatan struktur dokumentasi untuk kemudahan penggunaan
- README.md disederhanakan dan dibuat full bahasa Indonesia

### Fixed
- Perbaikan link yang rusak dalam dokumentasi
- Sinkronisasi antara dokumentasi dengan struktur project aktual
- Perbaikan format dan konsistensi dokumentasi

### Documentation
- Penambahan contoh integrasi PHP yang lengkap
- Perbaikan dokumentasi setup environment
- Peningkatan clarity dalam panduan instalasi

## [1.2.0] - 2025-06-14

### Added
- Comprehensive project structure documentation in README.md
- Detailed file and directory descriptions for better code navigation
- Enhanced documentation for all service files and their purposes

### Changed
- **BREAKING**: Updated project structure section in README.md to reflect actual repository structure
- Moved app.js documentation from src/ to root level (matches actual file location)
- Enhanced descriptions for middleware, routes, services, and validators
- Improved clarity of file organization and architecture

### Fixed
- Corrected inaccurate file paths in project structure documentation
- Fixed missing files in documentation (LICENSE, package-lock.json)
- Aligned documentation with actual codebase structure

### Documentation
- Added missing route files documentation (email.js, sandbox.js)
- Enhanced service file descriptions (emailService.js, paymentServiceFactory.js, sandboxPaymentService.js)
- Improved middleware and validator documentation
- Updated example directory structure documentation

## [1.1.0] - Previous Release

### Added
- Email notification system with comprehensive documentation
- Sandbox mode for testing and development
- API key management system
- Webhook handling for payment notifications
- Rate limiting and security features
- Clean architecture implementation

### Features
- ✅ USDT payments on BSC-20 network
- ✅ QR Code generation for Trust Wallet integration
- ✅ Automatic transaction verification
- ✅ Webhook notifications for payment events
- ✅ API rate limiting and security
- ✅ API Key management system
- ✅ Clean architecture and error handling

### Documentation
- Complete setup and installation guide
- Environment configuration documentation
- API endpoint documentation
- PHP integration examples
- Troubleshooting guide

## [1.0.0] - Initial Release

### Added
- Core crypto payment gateway functionality
- BSC USDT payment processing
- Trust Wallet integration
- Basic API endpoints
- Payment verification system
- Initial documentation

---

## Types of Changes
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes
- **Documentation** for documentation changes

## Migration Guide

### From v1.2.0 to v1.3.0
No breaking changes in functionality. Updates include:
- New .env.example file for easier setup
- Enhanced PHP integration examples
- Simplified Indonesian documentation

### From v1.1.0 to v1.2.0
No breaking changes in functionality. Only documentation updates:
- Review updated project structure in README.md
- File locations remain the same, only documentation was corrected

### Future Releases
- Database integration (MongoDB/Redis)
- Enhanced security features
- Multi-currency support
- Advanced webhook features
