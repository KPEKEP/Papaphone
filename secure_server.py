#!/usr/bin/env python3
"""
Secure HTTPS Server for Serverless WebRTC Application
Provides HTTPS hosting with proper security headers and SSL certificates
"""

import http.server
import socketserver
import ssl
import os
import sys
import argparse
import subprocess
import tempfile
import socket
from pathlib import Path
import threading
import time

class SecureWebRTCHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler with security headers and proper MIME types"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        """Add security headers for WebRTC and general security"""
        # CORS headers (restrictive for security)
        self.send_header('Access-Control-Allow-Origin', '*')  # Only for development
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()')
        
        # Content Security Policy for WebRTC
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "connect-src 'self' wss: ws:; "
            "media-src 'self' blob:; "
            "img-src 'self' data: blob:; "
            "font-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'"
        )
        self.send_header('Content-Security-Policy', csp)
        
        # HTTPS enforcement (when served over HTTPS)
        if hasattr(self.server, 'is_https') and self.server.is_https:
            self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        
        super().end_headers()
    
    def guess_type(self, path):
        """Override to add WebRTC-specific MIME types"""
        result = super().guess_type(path)
        
        # Handle different return formats from different Python versions
        if isinstance(result, tuple) and len(result) >= 2:
            mimetype, encoding = result[0], result[1]
        else:
            mimetype, encoding = result, None
        
        # Custom MIME types for WebRTC application
        if path.endswith('.html') or path.endswith('.htm'):
            return 'text/html; charset=utf-8', encoding
        elif path.endswith('.css'):
            return 'text/css; charset=utf-8', encoding
        elif path.endswith('.js'):
            return 'application/javascript; charset=utf-8', encoding
        elif path.endswith('.mjs'):
            return 'application/javascript; charset=utf-8', encoding
        elif path.endswith('.json'):
            return 'application/json; charset=utf-8', encoding
        elif path.endswith('.wasm'):
            return 'application/wasm', encoding
        elif path.endswith('.ico'):
            return 'image/x-icon', encoding
        elif path.endswith('.png'):
            return 'image/png', encoding
        elif path.endswith('.jpg') or path.endswith('.jpeg'):
            return 'image/jpeg', encoding
        elif path.endswith('.svg'):
            return 'image/svg+xml', encoding
        elif path.endswith('.webp'):
            return 'image/webp', encoding
        elif path.endswith('.mp4'):
            return 'video/mp4', encoding
        elif path.endswith('.webm'):
            return 'video/webm', encoding
        
        return mimetype, encoding
    
    def send_head(self):
        """Override send_head to ensure proper content types and handle root path"""
        # Handle root path - serve index.html
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        
        path = self.translate_path(self.path)
        
        if not os.path.exists(path):
            self.send_error(404, "File not found")
            return None
        
        if os.path.isdir(path):
            # Try to serve index.html from directory
            index_path = os.path.join(path, "index.html")
            if os.path.exists(index_path):
                path = index_path
            else:
                self.send_error(403, "Directory listing not allowed")
                return None
        
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None
        
        # Get file stats
        fs = os.fstat(f.fileno())
        
        # Determine content type
        ctype = self.guess_type(path)
        if isinstance(ctype, tuple):
            ctype = ctype[0]
        
        # Send response
        self.send_response(200)
        self.send_header("Content-type", ctype)
        self.send_header("Content-Length", str(fs.st_size))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        
        # Cache control for static assets
        if path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.ico', '.svg', '.woff', '.woff2')):
            self.send_header("Cache-Control", "public, max-age=3600")
        else:
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        
        self.end_headers()
        
        return f
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Override to add more detailed logging"""
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] [{self.address_string()}] {format % args}")

class SecureWebRTCServer:
    """Main server class for hosting the WebRTC application securely"""
    
    def __init__(self, port=8443, host='localhost', cert_file=None, key_file=None):
        self.port = port
        self.host = host
        self.cert_file = cert_file
        self.key_file = key_file
        self.server = None
        self.temp_cert_dir = None
    
    def generate_self_signed_cert(self):
        """Generate self-signed certificate for HTTPS"""
        try:
            from cryptography import x509
            from cryptography.x509.oid import NameOID
            from cryptography.hazmat.primitives import hashes, serialization
            from cryptography.hazmat.primitives.asymmetric import rsa
            import datetime
            import ipaddress
            
            print("🔐 Generating self-signed SSL certificate...")
            
            # Generate private key
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
            )
            
            # Create certificate
            subject = issuer = x509.Name([
                x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
                x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Local"),
                x509.NameAttribute(NameOID.LOCALITY_NAME, "Local"),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, "WebRTC Dev Server"),
                x509.NameAttribute(NameOID.COMMON_NAME, self.host),
            ])
            
            # Add Subject Alternative Names for common local addresses
            san_list = [
                x509.DNSName(self.host),
                x509.DNSName("localhost"),
                x509.DNSName("127.0.0.1"),
            ]
            
            # Add local IP if different from host
            try:
                local_ip = self.get_local_ip()
                if local_ip and local_ip != self.host:
                    san_list.append(x509.IPAddress(ipaddress.ip_address(local_ip)))
            except:
                pass
            
            cert = x509.CertificateBuilder().subject_name(
                subject
            ).issuer_name(
                issuer
            ).public_key(
                private_key.public_key()
            ).serial_number(
                x509.random_serial_number()
            ).not_valid_before(
                datetime.datetime.utcnow()
            ).not_valid_after(
                datetime.datetime.utcnow() + datetime.timedelta(days=365)
            ).add_extension(
                x509.SubjectAlternativeName(san_list),
                critical=False,
            ).add_extension(
                x509.KeyUsage(
                    key_encipherment=True,
                    digital_signature=True,
                    key_agreement=False,
                    key_cert_sign=False,
                    crl_sign=False,
                    content_commitment=False,
                    data_encipherment=False,
                    encipher_only=False,
                    decipher_only=False
                ),
                critical=True,
            ).add_extension(
                x509.ExtendedKeyUsage([
                    x509.oid.ExtendedKeyUsageOID.SERVER_AUTH,
                ]),
                critical=True,
            ).sign(private_key, hashes.SHA256())
            
            # Write certificate and key to temporary files
            self.temp_cert_dir = tempfile.mkdtemp()
            self.cert_file = os.path.join(self.temp_cert_dir, 'cert.pem')
            self.key_file = os.path.join(self.temp_cert_dir, 'key.pem')
            
            with open(self.cert_file, 'wb') as f:
                f.write(cert.public_bytes(serialization.Encoding.PEM))
            
            with open(self.key_file, 'wb') as f:
                f.write(private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            
            print(f"✅ Generated self-signed certificate for {self.host}")
            return True
            
        except ImportError:
            print("❌ cryptography library not found. Install with: pip install cryptography")
            return self.generate_cert_with_openssl()
        except Exception as e:
            print(f"❌ Failed to generate certificate: {e}")
            return self.generate_cert_with_openssl()
    
    def generate_cert_with_openssl(self):
        """Fallback: Generate certificate using OpenSSL command"""
        try:
            print("🔐 Generating certificate using OpenSSL...")
            
            self.temp_cert_dir = tempfile.mkdtemp()
            self.cert_file = os.path.join(self.temp_cert_dir, 'cert.pem')
            self.key_file = os.path.join(self.temp_cert_dir, 'key.pem')
            
            # Generate private key
            subprocess.run([
                'openssl', 'genrsa', '-out', self.key_file, '2048'
            ], check=True, capture_output=True)
            
            # Generate certificate
            subprocess.run([
                'openssl', 'req', '-new', '-x509', '-key', self.key_file,
                '-out', self.cert_file, '-days', '365', '-subj',
                f'/C=US/ST=Local/L=Local/O=WebRTC Dev Server/CN={self.host}'
            ], check=True, capture_output=True)
            
            print(f"✅ Generated certificate using OpenSSL for {self.host}")
            return True
            
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ OpenSSL not found or failed to generate certificate")
            return False
    
    def get_local_ip(self):
        """Get local IP address for network access"""
        try:
            # Connect to a remote address to get local IP
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))
                return s.getsockname()[0]
        except Exception:
            return "localhost"
    
    def start(self):
        """Start the HTTPS server"""
        try:
            # Check if required files exist
            required_files = ['index.html', 'webrtc.js', 'styles.css']
            missing_files = [f for f in required_files if not os.path.exists(f)]
            
            if missing_files:
                print(f"❌ Missing required files: {', '.join(missing_files)}")
                print("   Make sure you're running the server from the correct directory.")
                return
            
            # Generate certificate if not provided
            if not self.cert_file or not self.key_file:
                if not self.generate_self_signed_cert():
                    print("⚠️  Could not generate HTTPS certificate. Exiting.")
                    return
            
            # Create server
            self.server = socketserver.TCPServer((self.host, self.port), SecureWebRTCHandler)
            self.server.is_https = True
            
            # Wrap with SSL
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.minimum_version = ssl.TLSVersion.TLSv1_2
            context.load_cert_chain(self.cert_file, self.key_file)
            
            # Security settings
            context.set_ciphers('ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS')
            context.options |= ssl.OP_NO_SSLv2
            context.options |= ssl.OP_NO_SSLv3
            context.options |= ssl.OP_NO_TLSv1
            context.options |= ssl.OP_NO_TLSv1_1
            
            self.server.socket = context.wrap_socket(self.server.socket, server_side=True)
            
            local_ip = self.get_local_ip()
            
            # Determine access URLs
            if self.host == '0.0.0.0':
                local_access = f"https://localhost:{self.port}"
                network_access = f"https://{local_ip}:{self.port}"
                access_info = f"""   Local URL:    {local_access}
   Network URL:  {network_access}

🌐 Network access ENABLED - accessible from other devices"""
            else:
                local_access = f"https://{self.host}:{self.port}"
                network_access = f"https://{local_ip}:{self.port}"
                access_info = f"""   Local URL:    {local_access}
   Network URL:  {network_access} (not accessible - use --network flag)

🏠 Local access only - use --network or --host 0.0.0.0 for network access"""

            print(f"""
🚀 Secure WebRTC Server Started!

{access_info}

🔒 HTTPS enabled with self-signed certificate
📱 For mobile testing, use the Network URL
⚠️  Browser will show security warning for self-signed cert - click "Advanced" → "Proceed"

🎯 WebRTC Features Available:
   ✅ Camera/Microphone access (requires HTTPS)
   ✅ P2P video calling with compression
   ✅ Real-time chat and file transfer
   ✅ Secure headers and CSP protection

Press Ctrl+C to stop the server
            """)
            
            # Serve forever
            self.server.serve_forever()
            
        except KeyboardInterrupt:
            print("\n👋 Server stopped by user")
        except OSError as e:
            if e.errno == 48 or "Address already in use" in str(e):
                print(f"❌ Port {self.port} is already in use. Try a different port with --port")
            else:
                print(f"❌ Server error: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up server resources"""
        if self.server:
            self.server.shutdown()
            self.server.server_close()
        
        # Cleanup temporary certificate files
        if self.temp_cert_dir and os.path.exists(self.temp_cert_dir):
            try:
                if self.cert_file and os.path.exists(self.cert_file):
                    os.unlink(self.cert_file)
                if self.key_file and os.path.exists(self.key_file):
                    os.unlink(self.key_file)
                os.rmdir(self.temp_cert_dir)
            except Exception as e:
                print(f"Warning: Could not cleanup temporary files: {e}")

def install_dependencies():
    """Install Python dependencies if needed"""
    try:
        import cryptography
        print("✅ cryptography library available")
    except ImportError:
        print("📦 Installing cryptography library...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'cryptography'])
            print("✅ cryptography library installed")
        except subprocess.CalledProcessError:
            print("⚠️  Could not install cryptography. Will use OpenSSL fallback.")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Secure HTTPS Server for WebRTC Application')
    parser.add_argument('--port', '-p', type=int, default=8443, 
                       help='Port to serve on (default: 8443)')
    parser.add_argument('--host', default='localhost',
                       help='Host to bind to (default: localhost, use 0.0.0.0 for network access)')
    parser.add_argument('--network', action='store_true',
                       help='Bind to all network interfaces (equivalent to --host 0.0.0.0)')
    parser.add_argument('--cert', 
                       help='Path to SSL certificate file')
    parser.add_argument('--key',
                       help='Path to SSL private key file')
    parser.add_argument('--install-deps', action='store_true',
                       help='Install Python dependencies')
    
    args = parser.parse_args()
    
    # Handle --network flag
    if args.network:
        args.host = '0.0.0.0'
    
    if args.install_deps:
        install_dependencies()
        return
    
    # Validate certificate files if provided
    if args.cert and args.key:
        if not os.path.exists(args.cert):
            print(f"❌ Certificate file not found: {args.cert}")
            return
        if not os.path.exists(args.key):
            print(f"❌ Private key file not found: {args.key}")
            return
    elif args.cert or args.key:
        print("❌ Both --cert and --key must be provided together")
        return
    
    # Create and start server
    server = SecureWebRTCServer(
        port=args.port, 
        host=args.host, 
        cert_file=args.cert,
        key_file=args.key
    )
    
    server.start()

if __name__ == '__main__':
    main()
