/**
 * Papaphone - Family Video Calling Application
 * Features: P2P video/audio calling, chat, file transfer
 * Connection: Manual SDP exchange with compression
 * Author: Pavel Nakaznenko
 */

class ServerlessWebRTC {
    constructor() {
        // WebRTC Configuration
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        };

        // Core components
        this.pc = null;
        this.localStream = null;
        this.remoteStream = null;
        this.chatChannel = null;
        this.fileChannel = null;

        // State management
        this.isHost = false;
        this.isConnected = false;
        this.isReconnecting = false;
        this.wasConnectedBeforeHide = false;
        this.roomId = null;
        this.pendingOffer = null;
        this.pendingAnswer = null;

        // Media settings
        this.mediaSettings = {
            video: true,
            audio: true,
            chat: true
        };

        // File transfer
        this.fileTransfer = {
            sending: false,
            receiving: false,
            sendProgress: 0,
            receiveProgress: 0,
            receiveBuffer: [],
            receivedSize: 0,
            fileInfo: null
        };

        // DOM elements
        this.elements = {};
        
        // Localization
        this.i18n = null;
        
        this.init();
    }

    init() {
        this.initLocalization();
        this.bindElements();
        this.bindEvents();
        this.checkUrlParams();
        this.updateStatus(this.i18n.t('status.ready'));
    }

    initLocalization() {
        // Initialize localization system
        this.i18n = new Localization();
        
        // Set up language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.i18n.getCurrentLanguage();
            languageSelect.addEventListener('change', (e) => {
                this.i18n.setLanguage(e.target.value);
            });
        }
        
        // Update DOM with initial translations
        this.i18n.updateDOM();
    }

    bindElements() {
        const ids = [
            'connectionStatus', 'statusIndicator', 'statusText',
            'callSetup', 'createCallBtn',
            'callCreated', 'callOffer', 'copyOfferBtn', 'offerStatus',
            'answerInput', 'connectWithAnswerBtn',
            'offerInput', 'joinCallBtn',
            'callActive', 'callAnswer', 'copyAnswerBtn', 'answerStatus',
            'videoChat', 'localVideo', 'remoteVideo', 'toggleVideoBtn', 'toggleAudioBtn',
            'chatContainer', 'chatMessages', 'messageInput', 'sendMessageBtn', 'toggleChatBtn',
            'fileTransfer', 'fileInput', 'sendFileBtn', 'sendProgress', 'sendProgressText',
            'receiveProgress', 'receiveProgressText', 'receivedFiles',
            'connectionInfo', 'connectionState', 'iceState', 'dataChannels'
        ];

        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    bindEvents() {
        // Call management
        this.elements.createCallBtn.addEventListener('click', () => this.createCall());
        this.elements.joinCallBtn.addEventListener('click', () => this.joinCall());
        this.elements.copyOfferBtn.addEventListener('click', () => this.copyOffer());
        this.elements.copyAnswerBtn.addEventListener('click', () => this.copyAnswer());
        this.elements.connectWithAnswerBtn.addEventListener('click', () => this.connectWithAnswer());
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.connectWithAnswer();
        });


        // Video controls
        this.elements.toggleVideoBtn.addEventListener('click', () => this.toggleVideo());
        this.elements.toggleAudioBtn.addEventListener('click', () => this.toggleAudio());

        // Chat
        this.elements.sendMessageBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.elements.toggleChatBtn.addEventListener('click', () => this.toggleChat());

        // File transfer
        this.elements.sendFileBtn.addEventListener('click', () => this.sendFile());
        this.elements.fileInput.addEventListener('change', () => this.handleFileSelection());

        // Window events
        window.addEventListener('beforeunload', () => this.cleanup());
        window.addEventListener('popstate', () => this.checkUrlParams());
        
        // Mobile app switching detection
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        window.addEventListener('pagehide', () => this.handlePageHide());
        window.addEventListener('pageshow', () => this.handlePageShow());
    }

    checkUrlParams() {
        // No URL parameter handling needed for manual copy-paste mode
    }

    // Compression utilities for offers/answers
    async compressAndEncode(data) {
        try {
            const jsonString = JSON.stringify(data);
            const textEncoder = new TextEncoder();
            const uint8Array = textEncoder.encode(jsonString);
            
            // Use CompressionStream if available (modern browsers)
            if ('CompressionStream' in window) {
                const compressionStream = new CompressionStream('gzip');
                const writer = compressionStream.writable.getWriter();
                const reader = compressionStream.readable.getReader();
                
                writer.write(uint8Array);
                writer.close();
                
                const chunks = [];
                let done = false;
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) {
                        chunks.push(value);
                    }
                }
                
                // Combine chunks
                const compressedLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const compressedArray = new Uint8Array(compressedLength);
                let offset = 0;
                for (const chunk of chunks) {
                    compressedArray.set(chunk, offset);
                    offset += chunk.length;
                }
                
                // Convert to base64
                return btoa(String.fromCharCode(...compressedArray));
            } else {
                // Fallback: just use base64 without compression
                console.warn('CompressionStream not available, using base64 only');
                return btoa(jsonString);
            }
        } catch (error) {
            console.error('Compression failed:', error);
            // Fallback to plain JSON
            return JSON.stringify(data);
        }
    }

    async decompressAndDecode(encodedData) {
        try {
            // Check if it's likely compressed (base64) or plain JSON
            if (encodedData.trim().startsWith('{')) {
                // Plain JSON, parse directly
                return JSON.parse(encodedData);
            }
            
            // Try to decode from base64
            const binaryString = atob(encodedData);
            const uint8Array = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
            }
            
            // Use DecompressionStream if available
            if ('DecompressionStream' in window) {
                const decompressionStream = new DecompressionStream('gzip');
                const writer = decompressionStream.writable.getWriter();
                const reader = decompressionStream.readable.getReader();
                
                writer.write(uint8Array);
                writer.close();
                
                const chunks = [];
                let done = false;
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) {
                        chunks.push(value);
                    }
                }
                
                // Combine chunks
                const decompressedLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const decompressedArray = new Uint8Array(decompressedLength);
                let offset = 0;
                for (const chunk of chunks) {
                    decompressedArray.set(chunk, offset);
                    offset += chunk.length;
                }
                
                const textDecoder = new TextDecoder();
                const jsonString = textDecoder.decode(decompressedArray);
                return JSON.parse(jsonString);
            } else {
                // Fallback: assume it's just base64 encoded JSON
                const jsonString = binaryString;
                return JSON.parse(jsonString);
            }
        } catch (error) {
            console.error('Decompression failed:', error);
            // Try parsing as plain JSON as final fallback
            try {
                return JSON.parse(encodedData);
            } catch (parseError) {
                throw new Error('Unable to parse offer/answer data');
            }
        }
    }

    generateRoomId() {
        return Math.random().toString(36).substr(2, 9);
    }

    async createCall() {
        try {
            this.isHost = true;
            this.callId = this.generateRoomId();
            
            // Initialize WebRTC AND setup media for the host
            await this.initializeWebRTC();
            await this.setupMedia(); // Host needs media too!
            
            this.showElement('callCreated');
            this.hideElement('callSetup');
            
            // Show video interface for host immediately
            this.showElement('videoChat');
            this.showElement('chatContainer');
            this.showElement('fileTransfer');
            this.showElement('connectionInfo');
            
            this.updateStatus(this.i18n.t('status.creating'), 'connecting');
            
            // Create offer
            const offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);
            
            // Wait for ICE gathering
            await this.waitForIceGathering();
            
            // Compress and encode the offer for manual sharing
            const compressedOffer = await this.compressAndEncode(this.pc.localDescription);
            this.elements.callOffer.value = compressedOffer;
            this.elements.offerStatus.textContent = this.i18n.t('created.offerReady');
            
            console.log('Call created with compressed offer:', compressedOffer.length, 'characters');
            
            this.updateStatus(this.i18n.t('status.callReady'), 'connecting');
            
        } catch (error) {
            console.error('Error creating call:', error);
            this.showToast(this.i18n.t('toast.failedCreateCall', {error: error.message}), 'error');
            this.updateStatus(this.i18n.t('status.error'), 'error');
        }
    }

    // Removed showJoinCall - join is now integrated in main setup

    async joinCall() {
        try {
            this.updateStatus(this.i18n.t('status.joining'), 'connecting');
            
            const offerText = this.elements.offerInput.value.trim();
            if (!offerText) {
                this.showToast(this.i18n.t('toast.pasteOfferFirst'), 'error');
                return;
            }

            // Initialize WebRTC and setup media
            await this.initializeWebRTC();
            await this.setupMedia();
            
            // Decompress and parse the offer
            const offer = new RTCSessionDescription(await this.decompressAndDecode(offerText));
            await this.pc.setRemoteDescription(offer);
            
            // Create answer
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);
            
            // Wait for ICE gathering
            await this.waitForIceGathering();
            
            // Compress and encode the answer for manual sharing
            const compressedAnswer = await this.compressAndEncode(this.pc.localDescription);
            this.elements.callAnswer.value = compressedAnswer;
            this.elements.answerStatus.textContent = this.i18n.t('active.answerReady');
            
            // Show User 2 is now in the call with video/audio active
            this.hideElement('callSetup');
            this.showElement('callActive');
            this.showElement('videoChat');
            this.showElement('chatContainer');
            this.showElement('fileTransfer');
            this.showElement('connectionInfo');
            
            this.updateStatus(this.i18n.t('status.answerGenerated'), 'connecting');
            
        } catch (error) {
            console.error('Error joining call:', error);
            this.showToast(this.i18n.t('toast.failedJoinCall', {error: error.message}), 'error');
            this.updateStatus(this.i18n.t('status.error'), 'error');
        }
    }

    // Removed extractOfferFromInput - no longer needed for manual copy-paste

    async initializeWebRTC() {
        this.pc = new RTCPeerConnection(this.config);
        
        // Event handlers
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('ICE candidate:', event.candidate);
            }
        };

        this.pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.pc.iceConnectionState);
            this.elements.iceState.textContent = this.pc.iceConnectionState;
            
            if (this.pc.iceConnectionState === 'connected' || this.pc.iceConnectionState === 'completed') {
                // Check if we actually have media streams before declaring success
                this.checkMediaConnection();
            } else if (this.pc.iceConnectionState === 'failed') {
                this.isConnected = false;
                this.updateStatus(this.i18n.t('status.connectionFailed'), 'error');
                this.showToast(this.i18n.t('toast.connectionFailedRetrying'), 'error');
                this.attemptReconnection();
            } else if (this.pc.iceConnectionState === 'disconnected') {
                this.isConnected = false;
                this.updateStatus(this.i18n.t('status.connectionLost'), 'error');
                this.showToast(this.i18n.t('toast.connectionLostRetrying'), 'warning');
                // Wait a bit before attempting reconnection in case it's temporary
                setTimeout(() => {
                    if (this.pc.iceConnectionState === 'disconnected') {
                        this.attemptReconnection();
                    }
                }, 3000);
            }
        };

        this.pc.onconnectionstatechange = () => {
            console.log('Connection state:', this.pc.connectionState);
            this.elements.connectionState.textContent = this.pc.connectionState;
        };

        this.pc.ontrack = (event) => {
            console.log('Remote track received:', event);
            console.log('Track kind:', event.track.kind);
            console.log('Streams:', event.streams);
            
            if (event.streams && event.streams.length > 0) {
                this.remoteStream = event.streams[0];
                this.elements.remoteVideo.srcObject = this.remoteStream;
                
                // Check media connection status when we get tracks
                setTimeout(() => this.checkMediaConnection(), 500);
                
                console.log('Remote stream set:', {
                    videoTracks: this.remoteStream.getVideoTracks().length,
                    audioTracks: this.remoteStream.getAudioTracks().length
                });
            }
        };

        this.pc.ondatachannel = (event) => {
            const channel = event.channel;
            console.log('Data channel received:', channel.label);
            
            if (channel.label === 'chat') {
                this.chatChannel = channel;
                this.setupChatChannel();
            } else if (channel.label === 'file') {
                this.fileChannel = channel;
                this.setupFileChannel();
            }
            
            this.updateDataChannelStatus();
        };

        // Create data channels if host
        if (this.isHost) {
            this.chatChannel = this.pc.createDataChannel('chat');
            this.fileChannel = this.pc.createDataChannel('file');
            this.setupChatChannel();
            this.setupFileChannel();
            this.updateDataChannelStatus();
        }
    }

    async setupMedia() {
        try {
            const constraints = {
                video: this.mediaSettings.video,
                audio: this.mediaSettings.audio
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.elements.localVideo.srcObject = this.localStream;

            // Add tracks to peer connection
            this.localStream.getTracks().forEach(track => {
                this.pc.addTrack(track, this.localStream);
            });

        } catch (error) {
            console.error('Error accessing media:', error);
            this.showToast(this.i18n.t('toast.failedAccessMedia'), 'error');
            
            // Try audio only
            try {
                this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.elements.localVideo.srcObject = this.localStream;
                this.localStream.getTracks().forEach(track => {
                    this.pc.addTrack(track, this.localStream);
                });
                this.showToast(this.i18n.t('toast.audioOnlyMode'), 'warning');
            } catch (audioError) {
                console.error('Error accessing audio:', audioError);
                this.showToast(this.i18n.t('toast.noMediaAccess'), 'error');
            }
        }
    }

    waitForIceGathering() {
        return new Promise((resolve) => {
            if (this.pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                const timeout = setTimeout(() => {
                    resolve(); // Resolve anyway after timeout
                }, 3000);
                
                this.pc.addEventListener('icegatheringstatechange', () => {
                    if (this.pc.iceGatheringState === 'complete') {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
            }
        });
    }

    // Removed URL generation functions - no longer needed for manual copy-paste

    // Removed generateCallShortLink - no longer needed

    // Removed generateResponseShortCode - no longer needed

    // Removed generateShortLink - no longer needed

    // Removed copyShortLink - no longer needed

    // Removed openShortLink - no longer needed

    // Removed processAnswerLink - no longer needed

    // Removed showAnswerInstructions - no longer needed

    async connectWithAnswer() {
        const answerText = this.elements.answerInput.value.trim();
        if (!answerText) {
            this.showToast(this.i18n.t('toast.pasteAnswer'), 'warning');
            return;
        }

        try {
            this.elements.connectWithAnswerBtn.disabled = true;
            this.updateStatus(this.i18n.t('status.processing'), 'connecting');

            // Decompress and parse the answer
            const answer = new RTCSessionDescription(await this.decompressAndDecode(answerText));
            await this.pc.setRemoteDescription(answer);
            
            // Clear the input and hide the call created section
            this.elements.answerInput.value = '';
            this.hideElement('callCreated');
            
            this.showToast(this.i18n.t('toast.connectedSuccessfully'), 'success');
            this.updateStatus(this.i18n.t('status.connectedEstablishing'), 'connected');

        } catch (error) {
            console.error('Error connecting with answer:', error);
            this.showToast(this.i18n.t('toast.failedProcessAnswer', {error: error.message}), 'error');
            this.updateStatus(this.i18n.t('status.error'), 'error');
        } finally {
            this.elements.connectWithAnswerBtn.disabled = false;
        }
    }

    // Removed handleCallData - no longer needed for manual copy-paste

    // Removed initializeFromCallData - no longer needed

    setupChatChannel() {
        if (!this.chatChannel) return;

        this.chatChannel.onopen = () => {
            console.log('Chat channel opened');
        };

        this.chatChannel.onmessage = (event) => {
            this.displayMessage(event.data, false);
        };

        this.chatChannel.onclose = () => {
            console.log('Chat channel closed');
        };

        this.chatChannel.onerror = (error) => {
            console.error('Chat channel error:', error);
        };
    }

    setupFileChannel() {
        if (!this.fileChannel) return;

        this.fileChannel.onopen = () => {
            console.log('File channel opened');
        };

        this.fileChannel.onmessage = (event) => {
            this.handleFileMessage(event.data);
        };

        this.fileChannel.onclose = () => {
            console.log('File channel closed');
        };

        this.fileChannel.onerror = (error) => {
            console.error('File channel error:', error);
        };
    }

    sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || !this.chatChannel || this.chatChannel.readyState !== 'open') return;

        try {
            this.chatChannel.send(message);
            this.displayMessage(message, true);
            this.elements.messageInput.value = '';
        } catch (error) {
            console.error('Error sending message:', error);
            this.showToast(this.i18n.t('toast.failedSendMessage'), 'error');
        }
    }

    displayMessage(message, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
        
        const messageText = document.createElement('div');
        messageText.textContent = message;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(messageText);
        messageDiv.appendChild(messageTime);
        
        this.elements.chatMessages.appendChild(messageDiv);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    handleFileSelection() {
        const file = this.elements.fileInput.files[0];
        if (!file) return;

        this.elements.sendFileBtn.disabled = false;
        this.showToast(this.i18n.t('toast.fileSelected', {fileName: file.name, fileSize: this.formatFileSize(file.size)}), 'info');
    }

    async sendFile() {
        const file = this.elements.fileInput.files[0];
        if (!file || !this.fileChannel || this.fileChannel.readyState !== 'open') return;

        try {
            this.fileTransfer.sending = true;
            this.elements.sendFileBtn.disabled = true;

            // Send file metadata
            const fileInfo = {
                name: file.name,
                size: file.size,
                type: file.type,
                action: 'start'
            };

            this.fileChannel.send(JSON.stringify(fileInfo));

            // Send file in chunks
            const chunkSize = 16384; // 16KB chunks
            let offset = 0;

            while (offset < file.size) {
                const chunk = file.slice(offset, offset + chunkSize);
                const arrayBuffer = await chunk.arrayBuffer();
                
                this.fileChannel.send(arrayBuffer);
                
                offset += chunkSize;
                const progress = Math.min((offset / file.size) * 100, 100);
                this.updateSendProgress(progress);
                
                // Small delay to prevent overwhelming the channel
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            // Send completion signal
            this.fileChannel.send(JSON.stringify({ action: 'complete' }));
            
            this.fileTransfer.sending = false;
            this.elements.sendFileBtn.disabled = false;
            this.showToast(this.i18n.t('toast.fileSent'), 'success');

        } catch (error) {
            console.error('Error sending file:', error);
            this.showToast(this.i18n.t('toast.failedSendFile', {error: error.message}), 'error');
            this.fileTransfer.sending = false;
            this.elements.sendFileBtn.disabled = false;
        }
    }

    handleFileMessage(data) {
        if (typeof data === 'string') {
            // Handle file metadata or control messages
            try {
                const message = JSON.parse(data);
                
                if (message.action === 'start') {
                    this.fileTransfer.receiving = true;
                    this.fileTransfer.fileInfo = message;
                    this.fileTransfer.receiveBuffer = [];
                    this.fileTransfer.receivedSize = 0;
                    this.elements.receiveProgress.max = message.size;
                    this.showToast(this.i18n.t('toast.receivingFile', {fileName: message.name}), 'info');
                    
                } else if (message.action === 'complete') {
                    this.completeFileReceive();
                }
                
            } catch (error) {
                console.error('Error parsing file message:', error);
            }
            
        } else if (data instanceof ArrayBuffer) {
            // Handle file data chunks
            if (this.fileTransfer.receiving) {
                this.fileTransfer.receiveBuffer.push(data);
                this.fileTransfer.receivedSize += data.byteLength;
                
                const progress = (this.fileTransfer.receivedSize / this.fileTransfer.fileInfo.size) * 100;
                this.updateReceiveProgress(progress);
            }
        }
    }

    completeFileReceive() {
        try {
            const blob = new Blob(this.fileTransfer.receiveBuffer, { 
                type: this.fileTransfer.fileInfo.type 
            });
            
            const url = URL.createObjectURL(blob);
            this.addReceivedFile(this.fileTransfer.fileInfo.name, url, this.fileTransfer.fileInfo.size);
            
            this.fileTransfer.receiving = false;
            this.fileTransfer.receiveBuffer = [];
            this.fileTransfer.receivedSize = 0;
            
            this.showToast(this.i18n.t('toast.fileReceived'), 'success');
            
        } catch (error) {
            console.error('Error completing file receive:', error);
            this.showToast(this.i18n.t('toast.failedReceiveFile', {error: error.message}), 'error');
        }
    }

    addReceivedFile(name, url, size) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        
        fileDiv.innerHTML = `
            <div class="file-info">
                <div class="file-name">${name}</div>
                <div class="file-size">${this.formatFileSize(size)}</div>
            </div>
            <a href="${url}" download="${name}" class="btn btn-small">📥 Download</a>
        `;
        
        this.elements.receivedFiles.appendChild(fileDiv);
    }

    updateSendProgress(progress) {
        this.elements.sendProgress.value = progress;
        this.elements.sendProgressText.textContent = `${Math.round(progress)}%`;
    }

    updateReceiveProgress(progress) {
        this.elements.receiveProgress.value = progress;
        this.elements.receiveProgressText.textContent = `${Math.round(progress)}%`;
    }

    toggleVideo() {
        if (!this.localStream) return;

        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            this.elements.toggleVideoBtn.classList.toggle('disabled', !videoTrack.enabled);
            this.elements.toggleVideoBtn.textContent = videoTrack.enabled ? '📹' : '📹';
        }
    }

    toggleAudio() {
        if (!this.localStream) return;

        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            this.elements.toggleAudioBtn.classList.toggle('disabled', !audioTrack.enabled);
            this.elements.toggleAudioBtn.textContent = audioTrack.enabled ? '🎤' : '🎤';
        }
    }

    toggleChat() {
        const messages = this.elements.chatMessages;
        const inputContainer = document.querySelector('.chat-input');
        const isHidden = messages.style.display === 'none';
        
        messages.style.display = isHidden ? 'block' : 'none';
        if (inputContainer) {
            inputContainer.style.display = isHidden ? 'flex' : 'none';
        }
        this.elements.toggleChatBtn.textContent = isHidden ? '−' : '+';
    }

    updateMediaSettings() {
        // This would be called when media settings change
        // Could restart media stream with new constraints
    }

    updateDataChannelStatus() {
        const chatStatus = this.chatChannel ? this.chatChannel.readyState : 'none';
        const fileStatus = this.fileChannel ? this.fileChannel.readyState : 'none';
        this.elements.dataChannels.textContent = `Chat: ${chatStatus}, File: ${fileStatus}`;
    }

    copyOffer() {
        const offer = this.elements.callOffer.value;
        if (!offer) {
            this.showToast(this.i18n.t('toast.noOfferToCopy'), 'warning');
            return;
        }
        
        navigator.clipboard.writeText(offer).then(() => {
            this.elements.copyOfferBtn.innerHTML = '✓ Copied!';
            setTimeout(() => {
                this.elements.copyOfferBtn.innerHTML = '📋 <span data-i18n="created.copyOffer">' + this.i18n.t('created.copyOffer') + '</span>';
            }, 2000);
            this.showToast(this.i18n.t('toast.offerCopied'), 'success');
        }).catch(() => {
            this.showToast(this.i18n.t('toast.failedCopyOffer'), 'error');
        });
    }

    copyAnswer() {
        const answer = this.elements.callAnswer.value;
        if (!answer) {
            this.showToast(this.i18n.t('toast.noAnswerToCopy'), 'warning');
            return;
        }
        
        navigator.clipboard.writeText(answer).then(() => {
            this.elements.copyAnswerBtn.innerHTML = '✓ Copied!';
            setTimeout(() => {
                this.elements.copyAnswerBtn.innerHTML = '📋 <span data-i18n="active.copyAnswer">' + this.i18n.t('active.copyAnswer') + '</span>';
            }, 2000);
            this.showToast(this.i18n.t('toast.answerCopied'), 'success');
        }).catch(() => {
            this.showToast(this.i18n.t('toast.failedCopyAnswer'), 'error');
        });
    }

    updateStatus(message, type = 'info') {
        this.elements.statusText.textContent = message;
        this.elements.statusIndicator.className = `status-indicator ${type}`;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    showElement(id) {
        this.elements[id]?.classList.remove('hidden');
    }

    hideElement(id) {
        this.elements[id]?.classList.add('hidden');
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    handleVisibilityChange() {
        if (document.hidden) {
            console.log('App went to background');
            // Don't immediately disconnect, just log
        } else {
            console.log('App came to foreground');
            // Check connection state and attempt recovery if needed
            if (this.pc && this.isConnected) {
                setTimeout(() => this.checkConnectionHealth(), 1000);
            }
        }
    }
    
    handlePageHide() {
        console.log('Page hidden (app switch)');
        // Store connection state for recovery
        this.wasConnectedBeforeHide = this.isConnected;
    }
    
    handlePageShow() {
        console.log('Page shown (app return)');
        // Attempt to recover connection if we were connected before
        if (this.wasConnectedBeforeHide && this.pc) {
            setTimeout(() => this.checkConnectionHealth(), 2000);
        }
    }
    
    checkConnectionHealth() {
        if (!this.pc) return;
        
        console.log('Checking connection health...');
        console.log('ICE state:', this.pc.iceConnectionState);
        console.log('Connection state:', this.pc.connectionState);
        
        if (this.pc.iceConnectionState === 'disconnected' || 
            this.pc.iceConnectionState === 'failed' ||
            this.pc.connectionState === 'disconnected' ||
            this.pc.connectionState === 'failed') {
            
            console.log('Connection needs recovery');
            this.attemptReconnection();
        }
    }
    
    async attemptReconnection() {
        if (!this.pc || this.isReconnecting) return;
        
        this.isReconnecting = true;
        console.log('Attempting reconnection...');
        this.showToast(this.i18n.t('toast.reconnecting'), 'info');
        
        try {
            // Try ICE restart
            const offer = await this.pc.createOffer({ iceRestart: true });
            await this.pc.setLocalDescription(offer);
            
            // Wait for new ICE candidates
            await this.waitForIceGathering();
            
            console.log('ICE restart completed');
            this.showToast(this.i18n.t('toast.reconnectionAttempted'), 'info');
            
        } catch (error) {
            console.error('Reconnection failed:', error);
            this.showToast(this.i18n.t('toast.reconnectionFailed'), 'error');
        } finally {
            this.isReconnecting = false;
        }
    }
    
    checkMediaConnection() {
        const hasLocalVideo = this.localStream && this.localStream.getVideoTracks().length > 0;
        const hasLocalAudio = this.localStream && this.localStream.getAudioTracks().length > 0;
        const hasRemoteVideo = this.remoteStream && this.remoteStream.getVideoTracks().length > 0;
        const hasRemoteAudio = this.remoteStream && this.remoteStream.getAudioTracks().length > 0;
        
        console.log('Media check:', {
            hasLocalVideo,
            hasLocalAudio,
            hasRemoteVideo,
            hasRemoteAudio
        });
        
        if (hasLocalVideo || hasLocalAudio) {
            this.isConnected = true;
            if (hasRemoteVideo || hasRemoteAudio) {
                this.updateStatus(this.i18n.t('status.connectedWithMedia'), 'connected');
                this.showToast(this.i18n.t('toast.connectedWithVideoAudio'), 'success');
            } else {
                this.updateStatus(this.i18n.t('status.waitingRemoteMedia'), 'connecting');
                this.showToast(this.i18n.t('toast.connectedWaitingRemote'), 'info');
            }
        } else {
            this.updateStatus(this.i18n.t('status.noMediaStreams'), 'warning');
            this.showToast(this.i18n.t('toast.connectedNoMedia'), 'warning');
        }
    }

    cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.pc) {
            this.pc.close();
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ServerlessWebRTC();
});

