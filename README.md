# 📞 Papaphone (Папафон)

*A heartfelt video calling app to connect with kids and parents effortlessly*

Created by **Pavel Nakaznenko** to bridge the distance between family members with simple, secure peer-to-peer video calls.

## [Demo](https://kpekep.github.io/Papaphone/)
## 💝 Why Papaphone?

Sometimes the simplest connections matter the most. Papaphone was born from a father's desire to stay close to his children and parents without the complexity of traditional video calling apps. No accounts, no servers storing your data, no complicated setup - just pure, direct family connections.

Perfect for:
- 👶 **Calling your kids** when you're away
- 👴 **Staying connected with parents** who want something simple
- 🌍 **Family across distances** who value privacy
- 💕 **Anyone who believes** family connections should be effortless

## ✨ Features

- **📱 One-Click Calls**: Just share a link and connect instantly
- **🔒 Private & Secure**: Direct peer-to-peer connections, no data stored anywhere
- **💬 Family Chat**: Send messages during calls
- **📁 Share Memories**: Send photos and files directly
- **🌐 Works Everywhere**: Any modern browser, any device
- **🌍 Multilingual**: English and Russian support with auto-detection
- **❤️ Made with Love**: Designed for families, by a family man

## 🚀 Quick Start

### For Families (Simple Setup)

1. **Download or visit** Papaphone
2. **Click "Create Call"** 
3. **Copy the link** and send it to your loved one (WhatsApp, SMS, email)
4. **Wait for them to join** and send you back their response
5. **Paste their response** and enjoy your family time!

### For Tech-Savvy Users

#### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Camera and microphone for video calls
- HTTPS server (for full functionality)

#### Setup with Secure Server

```bash
# Clone the repository
git clone https://github.com/KPEKEP/Papaphone
cd papaphone

# Install dependencies
pip install -r requirements-server.txt

# Start secure HTTPS server
python secure_server.py

# For network access (other devices)
python secure_server.py --network

# Custom port
python secure_server.py --port 9443
```

#### Access the App
- **Local**: `https://localhost:8443`
- **Network**: `https://your-ip:8443`
- ⚠️ Accept the security warning for the self-signed certificate

## 👨‍👩‍👧‍👦 How to Connect Your Family

### Creating a Call (Host)
1. Open Papaphone in your browser
2. Click **"📞 Create Call"**
3. Allow camera/microphone access
4. Copy the generated offer
5. Send it to your family member via WhatsApp, SMS, or email
6. Wait for their response and paste it to connect

### Joining a Call (Guest)
1. Receive the offer from your family member
2. Open Papaphone and paste the offer
3. Click **"🎥 Join Call"**
4. Allow camera/microphone access
5. Copy your response and send it back
6. You're connected!

## 🌍 Language Support

Papaphone automatically detects your browser language and supports:
- **English** - Full interface
- **Русский (Russian)** - Полный интерфейс

Switch languages anytime using the selector in the top-right corner.

## 🔧 Technical Details

### Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Papa/Mama     │    │   Kids/Parents  │
│   Browser       │    │   Browser       │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          │   WebRTC P2P         │
          │   Direct Connection  │
          └──────────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │  STUN       │
              │  Servers    │
              │  (Public)   │
              └─────────────┘
```

### Security & Privacy
- **🔐 End-to-End Encrypted**: All communication is encrypted
- **🚫 No Data Storage**: Nothing is saved on servers
- **👥 Direct Connection**: Only you and your family
- **🔒 HTTPS Secure**: Protected signaling
- **🏠 Family-First**: Built with family privacy in mind

### Browser Compatibility
- ✅ Chrome/Chromium 80+
- ✅ Firefox 75+  
- ✅ Safari 14+
- ✅ Edge 80+
- ✅ Mobile browsers (perfect for grandparents' phones!)

## 🚀 Deployment Options

### Simple Hosting
Deploy to any static hosting service:
- **GitHub Pages**: Free and easy
- **Netlify**: Simple drag-and-drop
- **Vercel**: One-click deployment
- **Your own server**: Apache, nginx with HTTPS

### Family Network Setup
```bash
# Run on your home network for family access
python secure_server.py --network --port 8443

# Share with family: https://your-home-ip:8443
```

## 🆘 Help for Families

### Common Questions

**"It's not working!"**
- Make sure you're using HTTPS (the lock icon in your browser)
- Try refreshing the page
- Check if camera/microphone permissions are allowed

**"I can't see/hear them"**
- Both people need to allow camera and microphone
- Try a different browser
- Check your internet connection

**"The link is too long!"**
- That's normal! The link contains everything needed for security
- You can use a link shortener if needed

**"Is this safe for my family?"**
- Yes! Papaphone connects you directly - no company can see your calls
- Your conversations are private and encrypted
- No accounts or personal information required

## 💝 A Personal Note from Pavel

As a father and son myself, I understand how precious family connections are. Whether you're a traveling parent missing bedtime stories, grandparents wanting to see their grandchildren grow, or kids wanting to share their day - Papaphone is here to make those moments happen without barriers.

No corporate servers, no data harvesting, no complicated accounts. Just families connecting with families.

## 🤝 Contributing

This is a labor of love, and contributions are welcome:
1. Fork the repository
2. Make improvements for families
3. Test with real family scenarios
4. Submit a pull request

## 📄 License

MIT License - Free for all families to use and modify.

## 🙏 Thank You

To the WebRTC community, open-source contributors, and every parent and child who inspired this project.

---


**Made with ❤️ by Pavel Nakaznenko for families everywhere**
