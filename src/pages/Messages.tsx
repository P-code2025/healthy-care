import { useState } from 'react';
import styles from './Messages.module.css';
import { 
  recognizeFoodFromImage, 
  formatNutritionInfo, 
  saveFoodLog,
  type FoodRecognitionResult 
} from '../services/aiService';

interface Message {
  id: string;
  sender: string;
  role: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  avatar?: string;
  isLoading?: boolean;
  nutritionData?: FoodRecognitionResult;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  online: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Alex Foster',
    role: 'Personal Trainer',
    content: 'Hey Adam, great job on completing your 5th strength training session today! You\'re making awesome progress with the 80kg squats 💪',
    timestamp: '9:40 AM',
    isUser: false,
    avatar: '💪',
  },
  {
    id: '2',
    sender: 'Adam',
    role: '',
    content: 'Thanks, Alex! It\'s definitely challenging, but I\'m feeling stronger each time.',
    timestamp: '9:47 AM',
    isUser: true,
  },
];

export default function Messages() {
  const [selectedContact, setSelectedContact] = useState<string>('alex-foster');
  const [messageInput, setMessageInput] = useState('');
  const [showProfile, setShowProfile] = useState(true);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const contacts: Contact[] = [
    {
      id: 'mia-johnson',
      name: 'Mia Johnson',
      role: 'Yoga Inst...',
      lastMessage: 'It was great to see you at the...',
      timestamp: '11:40 AM',
      avatar: '🧘‍♀️',
      online: true,
    },
    {
      id: 'dr-emily',
      name: 'Dr. Emily Lawson',
      role: 'Doctor',
      lastMessage: 'I\'ll review your blood test results...',
      timestamp: '11:16 AM',
      avatar: '👩‍⚕️',
      online: true,
    },
    {
      id: 'alex-foster',
      name: 'Alex Foster',
      role: 'Personal Tr...',
      lastMessage: 'You\'ve got this! See you at our next s...',
      timestamp: '9:50 AM',
      avatar: '💪',
      online: true,
    },
  ];

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: 'Adam',
        role: '',
        content: messageInput,
        timestamp: getCurrentTime(),
        isUser: true,
      };
      
      setMessages([...messages, newMessage]);
      setMessageInput('');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const loadingMessage: Message = {
        id: `loading-${Date.now()}`,
        sender: 'AI Nutritionist',
        role: 'AI Assistant',
        content: '🔄 Đang phân tích ảnh món ăn của bạn...',
        timestamp: getCurrentTime(),
        isUser: false,
        avatar: '🤖',
        isLoading: true,
      };
      
      setMessages(prev => [...prev, loadingMessage]);

      const result = await recognizeFoodFromImage(file);

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== loadingMessage.id);
        
        const resultMessage: Message = {
          id: `ai-${Date.now()}`,
          sender: 'AI Nutritionist',
          role: 'AI Assistant',
          content: formatNutritionInfo(result),
          timestamp: getCurrentTime(),
          isUser: false,
          avatar: '🤖',
          nutritionData: result,
        };
        
        return [...filtered, resultMessage];
      });

      await saveFoodLog(result);

      event.target.value = '';
      
      setTimeout(() => {
        const successMsg: Message = {
          id: `success-${Date.now()}`,
          sender: 'System',
          role: 'System',
          content: '✅ Đã lưu vào nhật ký thực phẩm!',
          timestamp: getCurrentTime(),
          isUser: false,
          avatar: '✅',
        };
        setMessages(prev => [...prev, successMsg]);
      }, 1000);

    } catch (error: any) {
      setMessages(prev => prev.filter(m => !m.isLoading));

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'AI Nutritionist',
        role: 'AI Assistant',
        content: `❌ Lỗi: ${error.message}\n\nVui lòng thử lại hoặc nhập thông tin thủ công.`,
        timestamp: getCurrentTime(),
        isUser: false,
        avatar: '🤖',
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      event.target.value = '';
    }
  };

  return (
    <div className={styles.container}>
      {/* Sidebar - Contact List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.pageTitle}>Messages</h2>
        </div>

        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search name, chat, etc"
            className={styles.searchInput}
          />
          <button className={styles.filterBtn}>☰</button>
        </div>

        <div className={styles.contactList}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`${styles.contactItem} ${
                selectedContact === contact.id ? styles.active : ''
              }`}
              onClick={() => setSelectedContact(contact.id)}
            >
              <div className={styles.contactAvatar}>
                <span>{contact.avatar}</span>
                {contact.online && <span className={styles.onlineDot}></span>}
              </div>
              <div className={styles.contactInfo}>
                <div className={styles.contactHeader}>
                  <span className={styles.contactName}>{contact.name}</span>
                  <span className={styles.contactTime}>{contact.timestamp}</span>
                </div>
                <div className={styles.contactPreview}>
                  <span className={styles.contactRole}>{contact.role}</span>
                  <span className={styles.lastMessage}>{contact.lastMessage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ad Banner */}
        <div className={styles.adBanner}>
          <div className={styles.adContent}>
            <div className={styles.adImage}>🥬🥕</div>
            <h3>AI nhận diện món ăn thông minh - Chụp ảnh là biết calo!</h3>
            <button className={styles.adButton}>Thử ngay!</button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderInfo}>
            <div className={styles.chatAvatar}>💪</div>
            <div>
              <h3 className={styles.chatName}>Alex Foster</h3>
              <p className={styles.chatStatus}>Active recently</p>
            </div>
          </div>
          <div className={styles.chatActions}>
            <button className={styles.iconBtn}>📞</button>
            <button className={styles.iconBtn}>📹</button>
            <button className={styles.iconBtn}>📋</button>
          </div>
        </div>

        <div className={styles.messagesContainer}>
          <div className={styles.dateLabel}>Today, Sept 8</div>
          
          <div className={styles.aiTip}>
            <span>💡</span>
            <p><strong>Mẹo:</strong> Click nút 📎 và chụp ảnh món ăn để AI tự động phân tích dinh dưỡng!</p>
          </div>
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.isUser ? styles.messageUser : styles.messageOther
              }`}
            >
              {!message.isUser && (
                <div className={styles.messageAvatar}>{message.avatar}</div>
              )}
              <div className={styles.messageContent}>
                <div className={`${styles.messageBubble} ${message.isLoading ? styles.loading : ''}`}>
                  {message.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < message.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                <div className={styles.messageTime}>
                  {message.timestamp}
                  {message.isUser && <span className={styles.readCheck}>✓✓</span>}
                </div>
                
                {message.nutritionData && (
                  <div className={styles.messageActions}>
                    <button className={styles.actionBtn}>✏️ Chỉnh sửa</button>
                    <button className={styles.actionBtn}>💾 Lưu lại</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.inputArea}>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button
            className={styles.attachBtn}
            onClick={() => document.getElementById('imageUpload')?.click()}
            title="📸 Chụp ảnh món ăn để AI phân tích dinh dưỡng"
          >
            📎
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className={styles.messageInput}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className={styles.sendBtn} onClick={handleSendMessage}>
            Send ➤
          </button>
        </div>
      </div>

      {/* Profile Sidebar */}
      {showProfile && (
        <div className={styles.profileSidebar}>
          <div className={styles.profileHeader}>
            <h3>Profile</h3>
            <button onClick={() => setShowProfile(false)}>✕</button>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>💪</div>
            <h3>Alex Foster</h3>
            <span className={styles.profileBadge}>Personal Trainer</span>
            <button className={styles.profileBtn}>📋 About</button>
          </div>

          <div className={styles.profileInfo}>
            <p>
              A certified personal trainer with 8 years of experience, specializing in strength training
              and personalized fitness plans to help you reach your goals.
            </p>
          </div>

          <div className={styles.mediaSection}>
            <div className={styles.sectionHeader}>
              <span>📷 Media (2)</span>
              <button>Show All</button>
            </div>
            <div className={styles.mediaGrid}>
              <div className={styles.mediaItem}>🏋️</div>
              <div className={styles.mediaItem}>💪</div>
            </div>
          </div>

          <div className={styles.linksSection}>
            <div className={styles.sectionHeader}>
              <span>🔗 AI Features</span>
            </div>
            <div className={styles.linkList}>
              <div className={styles.aiFeature}>
                <span className={styles.aiIcon}>🤖</span>
                <div>
                  <div className={styles.featureName}>AI Food Recognition</div>
                  <div className={styles.featureDesc}>Chụp ảnh → Nhận diện món ăn → Tính calo tự động</div>
                </div>
              </div>
              <div className={styles.aiFeature}>
                <span className={styles.aiIcon}>📊</span>
                <div>
                  <div className={styles.featureName}>Smart Nutrition</div>
                  <div className={styles.featureDesc}>Phân tích protein, carbs, fats chi tiết</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
