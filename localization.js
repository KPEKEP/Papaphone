/**
 * Localization System for Serverless WebRTC Chat
 * Supports automatic language detection and manual language switching
 */

class Localization {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'ru'];
        this.translations = {
            en: {
                // Header
                'app.title': '📞 Papaphone',
                'app.subtitle': 'Secure peer-to-peer calls for family connections',
                
                // Connection Status
                'status.initializing': 'Initializing...',
                'status.ready': 'Ready to connect',
                'status.connecting': 'Connecting...',
                'status.connected': 'Connected!',
                'status.error': 'Connection error',
                'status.creating': 'Creating call...',
                'status.joining': 'Joining call...',
                'status.processing': 'Processing answer...',
                'status.callReady': 'Call ready! Share the offer to connect.',
                'status.answerGenerated': 'Answer generated! Send it back to complete connection.',
                'status.connectedEstablishing': 'Connected! Establishing media...',
                'status.connectedWithMedia': 'Connected with media!',
                'status.connectionFailed': 'Connection failed',
                'status.connectionLost': 'Connection lost',
                'status.waitingRemoteMedia': 'Connected, waiting for remote media...',
                'status.noMediaStreams': 'Connected but no media streams',
                
                // Call Setup
                'setup.createCall': 'Create Call',
                'setup.createCallDescription': 'Create a secure peer-to-peer video call',
                'setup.or': 'OR',
                'setup.joinCall': 'Join a Call',
                'setup.joinCallDescription': 'Paste the offer you received:',
                'setup.offerPlaceholder': 'Paste the offer here...',
                'setup.joinCallButton': 'Join Call',
                
                // Call Created
                'created.title': 'Call Ready! 📞',
                'created.description': 'Copy this offer and send it to the person you want to call:',
                'created.copyOffer': 'Copy Offer',
                'created.offerStatus': 'Generating secure offer...',
                'created.offerReady': 'Offer ready! Copy and share it.',
                'created.waitingResponse': 'Waiting for Response',
                'created.waitingDescription': 'When the other person joins, they\'ll send you an answer. Paste it below:',
                'created.answerPlaceholder': 'Paste the answer here...',
                'created.startCall': 'Start Call',
                
                // Call Active
                'active.title': 'Connected! 📹',
                'active.description': 'Copy this answer and send it back to complete the connection:',
                'active.copyAnswer': 'Copy Answer',
                'active.answerStatus': 'Generating answer...',
                'active.answerReady': 'Answer ready! Copy and send it back.',
                'active.callActiveTitle': 'Call Active!',
                'active.callActiveDescription': 'Send the answer above to complete the connection.',
                
                // Video Chat
                'video.you': 'You',
                'video.remote': 'Remote',
                
                // Chat
                'chat.title': '💬 Chat',
                'chat.placeholder': 'Type a message...',
                'chat.send': 'Send',
                
                // File Transfer
                'file.title': '📁 File Transfer',
                'file.send': 'Send File',
                'file.received': 'Received Files:',
                'file.download': 'Download',
                'file.sendProgress': 'Sending...',
                'file.receiveProgress': 'Receiving...',
                
                // Connection Info
                'info.title': '🔗 Connection Details',
                'info.connectionState': 'Connection State:',
                'info.iceState': 'ICE State:',
                'info.dataChannels': 'Data Channels:',
                
                // Instructions
                'instructions.title': '📋 How to Use',
                'instructions.step1': '1. Click "Create Call" to start a new video call',
                'instructions.step2': '2. Copy the generated offer and send it to the person you want to call',
                'instructions.step3': '3. Wait for them to join and send you an answer',
                'instructions.step4': '4. Paste their answer to complete the connection',
                'instructions.joinStep1': '1. Get an offer from someone who created a call',
                'instructions.joinStep2': '2. Paste the offer and click "Join Call"',
                'instructions.joinStep3': '3. Copy the generated answer and send it back',
                'instructions.joinStep4': '4. Enjoy your secure peer-to-peer video call!',
                'instructions.security': '🔒 Your connection is completely peer-to-peer and secure',
                'instructions.noServers': '🌐 No data passes through our servers',
                
                // Toast Messages
                'toast.offerCopied': 'Offer copied to clipboard!',
                'toast.answerCopied': 'Answer copied to clipboard!',
                'toast.noOfferToCopy': 'No offer to copy',
                'toast.noAnswerToCopy': 'No answer to copy',
                'toast.pasteOfferFirst': 'Please paste the offer first',
                'toast.pasteAnswer': 'Please paste the answer',
                'toast.connectedSuccessfully': 'Connected successfully!',
                'toast.fileSelected': 'File selected: {fileName} ({fileSize})',
                'toast.fileSent': 'File sent successfully!',
                'toast.fileReceived': 'File received successfully!',
                'toast.receivingFile': 'Receiving file: {fileName}',
                'toast.failedCreateCall': 'Failed to create call: {error}',
                'toast.failedJoinCall': 'Failed to join call: {error}',
                'toast.failedProcessAnswer': 'Failed to process answer: {error}',
                'toast.failedSendMessage': 'Failed to send message',
                'toast.failedSendFile': 'Failed to send file: {error}',
                'toast.failedReceiveFile': 'Failed to receive file: {error}',
                'toast.failedCopyOffer': 'Failed to copy offer',
                'toast.failedCopyAnswer': 'Failed to copy answer',
                'toast.failedAccessMedia': 'Failed to access camera/microphone',
                'toast.audioOnlyMode': 'Video unavailable, using audio only',
                'toast.noMediaAccess': 'No media access available',
                'toast.reconnecting': 'Reconnecting...',
                'toast.reconnectionAttempted': 'Reconnection attempted',
                'toast.reconnectionFailed': 'Reconnection failed',
                'toast.connectionFailedRetrying': 'Connection failed - trying to reconnect...',
                'toast.connectionLostRetrying': 'Connection lost - trying to reconnect...',
                'toast.connectedWithVideoAudio': 'Successfully connected with video/audio!',
                'toast.connectedWaitingRemote': 'Connected! Waiting for remote video/audio...',
                'toast.connectedNoMedia': 'Connected but no video/audio detected',
                
                // Language
                'language.select': 'Language',
                'language.english': 'English',
                'language.russian': 'Русский'
            },
            ru: {
                // Header
                'app.title': '📞 Папафон',
                'app.subtitle': 'Безопасные P2P звонки для семейных связей',
                
                // Connection Status
                'status.initializing': 'Инициализация...',
                'status.ready': 'Готов к подключению',
                'status.connecting': 'Подключение...',
                'status.connected': 'Подключен!',
                'status.error': 'Ошибка подключения',
                'status.creating': 'Создание звонка...',
                'status.joining': 'Подключение к звонку...',
                'status.processing': 'Обработка ответа...',
                'status.callReady': 'Звонок готов! Поделитесь предложением для подключения.',
                'status.answerGenerated': 'Ответ сгенерирован! Отправьте его обратно для завершения подключения.',
                'status.connectedEstablishing': 'Подключен! Установка медиа...',
                'status.connectedWithMedia': 'Подключен с медиа!',
                'status.connectionFailed': 'Подключение не удалось',
                'status.connectionLost': 'Соединение потеряно',
                'status.waitingRemoteMedia': 'Подключен, ожидание удаленного медиа...',
                'status.noMediaStreams': 'Подключен, но нет медиа потоков',
                
                // Call Setup
                'setup.createCall': 'Создать звонок',
                'setup.createCallDescription': 'Создать безопасный P2P видеозвонок',
                'setup.or': 'ИЛИ',
                'setup.joinCall': 'Присоединиться к звонку',
                'setup.joinCallDescription': 'Вставьте полученное предложение:',
                'setup.offerPlaceholder': 'Вставьте предложение сюда...',
                'setup.joinCallButton': 'Присоединиться',
                
                // Call Created
                'created.title': 'Звонок готов! 📞',
                'created.description': 'Скопируйте это предложение и отправьте человеку, которому хотите позвонить:',
                'created.copyOffer': 'Копировать предложение',
                'created.offerStatus': 'Генерация безопасного предложения...',
                'created.offerReady': 'Предложение готово! Скопируйте и поделитесь им.',
                'created.waitingResponse': 'Ожидание ответа',
                'created.waitingDescription': 'Когда другой человек присоединится, он отправит вам ответ. Вставьте его ниже:',
                'created.answerPlaceholder': 'Вставьте ответ сюда...',
                'created.startCall': 'Начать звонок',
                
                // Call Active
                'active.title': 'Подключен! 📹',
                'active.description': 'Скопируйте этот ответ и отправьте его обратно для завершения подключения:',
                'active.copyAnswer': 'Копировать ответ',
                'active.answerStatus': 'Генерация ответа...',
                'active.answerReady': 'Ответ готов! Скопируйте и отправьте его обратно.',
                'active.callActiveTitle': 'Звонок активен!',
                'active.callActiveDescription': 'Отправьте ответ выше для завершения подключения.',
                
                // Video Chat
                'video.you': 'Вы',
                'video.remote': 'Удаленный',
                
                // Chat
                'chat.title': '💬 Чат',
                'chat.placeholder': 'Введите сообщение...',
                'chat.send': 'Отправить',
                
                // File Transfer
                'file.title': '📁 Передача файлов',
                'file.send': 'Отправить файл',
                'file.received': 'Полученные файлы:',
                'file.download': 'Скачать',
                'file.sendProgress': 'Отправка...',
                'file.receiveProgress': 'Получение...',
                
                // Connection Info
                'info.title': '🔗 Детали подключения',
                'info.connectionState': 'Состояние подключения:',
                'info.iceState': 'Состояние ICE:',
                'info.dataChannels': 'Каналы данных:',
                
                // Instructions
                'instructions.title': '📋 Как использовать',
                'instructions.step1': '1. Нажмите "Создать звонок" для начала нового видеозвонка',
                'instructions.step2': '2. Скопируйте сгенерированное предложение и отправьте человеку, которому хотите позвонить',
                'instructions.step3': '3. Дождитесь, пока они присоединятся и отправят вам ответ',
                'instructions.step4': '4. Вставьте их ответ для завершения подключения',
                'instructions.joinStep1': '1. Получите предложение от кого-то, кто создал звонок',
                'instructions.joinStep2': '2. Вставьте предложение и нажмите "Присоединиться"',
                'instructions.joinStep3': '3. Скопируйте сгенерированный ответ и отправьте его обратно',
                'instructions.joinStep4': '4. Наслаждайтесь безопасным P2P видеозвонком!',
                'instructions.security': '🔒 Ваше соединение полностью P2P и безопасно',
                'instructions.noServers': '🌐 Никакие данные не проходят через наши серверы',
                
                // Toast Messages
                'toast.offerCopied': 'Предложение скопировано в буфер обмена!',
                'toast.answerCopied': 'Ответ скопирован в буфер обмена!',
                'toast.noOfferToCopy': 'Нет предложения для копирования',
                'toast.noAnswerToCopy': 'Нет ответа для копирования',
                'toast.pasteOfferFirst': 'Сначала вставьте предложение',
                'toast.pasteAnswer': 'Пожалуйста, вставьте ответ',
                'toast.connectedSuccessfully': 'Успешно подключен!',
                'toast.fileSelected': 'Файл выбран: {fileName} ({fileSize})',
                'toast.fileSent': 'Файл успешно отправлен!',
                'toast.fileReceived': 'Файл успешно получен!',
                'toast.receivingFile': 'Получение файла: {fileName}',
                'toast.failedCreateCall': 'Не удалось создать звонок: {error}',
                'toast.failedJoinCall': 'Не удалось присоединиться к звонку: {error}',
                'toast.failedProcessAnswer': 'Не удалось обработать ответ: {error}',
                'toast.failedSendMessage': 'Не удалось отправить сообщение',
                'toast.failedSendFile': 'Не удалось отправить файл: {error}',
                'toast.failedReceiveFile': 'Не удалось получить файл: {error}',
                'toast.failedCopyOffer': 'Не удалось скопировать предложение',
                'toast.failedCopyAnswer': 'Не удалось скопировать ответ',
                'toast.failedAccessMedia': 'Не удалось получить доступ к камере/микрофону',
                'toast.audioOnlyMode': 'Видео недоступно, используется только аудио',
                'toast.noMediaAccess': 'Нет доступа к медиа',
                'toast.reconnecting': 'Переподключение...',
                'toast.reconnectionAttempted': 'Попытка переподключения выполнена',
                'toast.reconnectionFailed': 'Переподключение не удалось',
                'toast.connectionFailedRetrying': 'Подключение не удалось - попытка переподключения...',
                'toast.connectionLostRetrying': 'Соединение потеряно - попытка переподключения...',
                'toast.connectedWithVideoAudio': 'Успешно подключен с видео/аудио!',
                'toast.connectedWaitingRemote': 'Подключен! Ожидание удаленного видео/аудио...',
                'toast.connectedNoMedia': 'Подключен, но видео/аудио не обнаружено',
                
                // Language
                'language.select': 'Язык',
                'language.english': 'English',
                'language.russian': 'Русский'
            }
        };
        
        this.detectLanguage();
    }
    
    detectLanguage() {
        // Try to detect language from browser settings
        const browserLang = navigator.language || navigator.languages?.[0] || 'en';
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        // Check if detected language is supported
        if (this.supportedLanguages.includes(langCode)) {
            this.currentLanguage = langCode;
        } else {
            this.currentLanguage = 'en'; // Default to English
        }
        
        // Check localStorage for saved preference
        const savedLang = localStorage.getItem('webrtc-language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
        }
        
        console.log('Detected language:', this.currentLanguage);
    }
    
    setLanguage(langCode) {
        if (this.supportedLanguages.includes(langCode)) {
            this.currentLanguage = langCode;
            localStorage.setItem('webrtc-language', langCode);
            this.updateDOM();
        }
    }
    
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations['en'][key] || 
                          key;
        
        // Replace parameters in the translation
        return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] || match;
        });
    }
    
    updateDOM() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'textarea')) {
                element.placeholder = this.t(key);
            } else if (element.tagName === 'TEXTAREA') {
                element.placeholder = this.t(key);
            } else {
                element.textContent = this.t(key);
            }
        });
        
        // Update elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            element.innerHTML = this.t(key);
        });
        
        // Update document language attribute
        document.documentElement.lang = this.currentLanguage;
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

// Export for use in other files
window.Localization = Localization;
