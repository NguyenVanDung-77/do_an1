import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { chatAPI } from '../services/api';

const POLLING_MS = 5000;

const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const bookingIdFromQuery = searchParams.get('bookingId');

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const [conversations, setConversations] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(bookingIdFromQuery || null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  const bottomRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => String(item.bookingId) === String(selectedBookingId)) || null,
    [conversations, selectedBookingId]
  );

  const fetchConversations = useCallback(async () => {
    try {
      const response = await chatAPI.getConversations();
      const list = Array.isArray(response.data) ? response.data : [];
      setConversations(list);

      const hasSelected = selectedBookingId && list.some((item) => String(item.bookingId) === String(selectedBookingId));

      if (!hasSelected && list.length > 0) {
        const fallbackId = bookingIdFromQuery && list.some((item) => String(item.bookingId) === String(bookingIdFromQuery))
          ? bookingIdFromQuery
          : String(list[0].bookingId);

        setSelectedBookingId(fallbackId);
        setSearchParams({ bookingId: fallbackId });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoadingConversations(false);
    }
  }, [bookingIdFromQuery, selectedBookingId, setSearchParams]);

  const fetchMessages = useCallback(async (bookingId) => {
    try {
      setLoadingMessages(true);
      const response = await chatAPI.getMessagesByBooking(bookingId);
      setMessages(response.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (bookingIdFromQuery && String(bookingIdFromQuery) !== String(selectedBookingId)) {
      setSelectedBookingId(bookingIdFromQuery);
    }
  }, [bookingIdFromQuery, selectedBookingId]);

  useEffect(() => {
    fetchConversations();
    const timer = setInterval(fetchConversations, POLLING_MS);
    return () => clearInterval(timer);
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedBookingId) return;

    fetchMessages(selectedBookingId);
    const timer = setInterval(() => fetchMessages(selectedBookingId), POLLING_MS);
    return () => clearInterval(timer);
  }, [selectedBookingId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (bookingId) => {
    const value = String(bookingId);
    setSelectedBookingId(value);
    setSearchParams({ bookingId: value });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !selectedBookingId) return;

    try {
      setSending(true);
      await chatAPI.sendMessage(selectedBookingId, content);
      setDraft('');
      await fetchMessages(selectedBookingId);
      await fetchConversations();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (loadingConversations) {
    return <div style={styles.loading}>Đang tải phòng chat...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💬 Chat giữa người đặt sân và chủ sân</h1>
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.chatLayout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>Cuộc trò chuyện</div>

          {conversations.length === 0 ? (
            <div style={styles.empty}>Chưa có cuộc trò chuyện nào</div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.bookingId}
                onClick={() => handleSelectConversation(conversation.bookingId)}
                style={{
                  ...styles.conversationItem,
                  ...(String(selectedBookingId) === String(conversation.bookingId) ? styles.conversationItemActive : {}),
                }}
              >
                <div style={styles.conversationTop}>
                  <strong>Đơn #{conversation.bookingId}</strong>
                  <span style={styles.bookingStatus}>{conversation.bookingStatus}</span>
                </div>
                <div style={styles.conversationName}>{conversation.counterpartName}</div>
                <div style={styles.conversationPitch}>🏟️ {conversation.pitchName}</div>
                <div style={styles.conversationLast}>{conversation.lastMessage}</div>
                <div style={styles.conversationTime}>{formatDateTime(conversation.lastMessageAt)}</div>
              </button>
            ))
          )}
        </aside>

        <section style={styles.chatPanel}>
          {!selectedConversation ? (
            <div style={styles.emptyPanel}>Chọn một cuộc trò chuyện để bắt đầu</div>
          ) : (
            <>
              <div style={styles.chatHeader}>
                <div>
                  <div style={styles.chatHeaderTitle}>Đơn #{selectedConversation.bookingId} - {selectedConversation.pitchName}</div>
                  <div style={styles.chatHeaderSub}>Đang chat với: {selectedConversation.counterpartName}</div>
                </div>
                <button
                  onClick={() => navigate(`/pitch/${selectedConversation.pitchId}`)}
                  style={styles.linkPitchBtn}
                >
                  Xem sân
                </button>
              </div>

              <div style={styles.messagesWrap}>
                {loadingMessages ? (
                  <div style={styles.loadingMessages}>Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                  <div style={styles.emptyMessages}>Chưa có tin nhắn. Hãy nhắn tin đầu tiên.</div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        ...styles.messageRow,
                        justifyContent: message.isMine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          ...styles.messageBubble,
                          ...(message.isMine ? styles.messageMine : styles.messageOther),
                        }}
                      >
                        <div style={styles.messageSender}>{message.senderName}</div>
                        <div>{message.content}</div>
                        <div style={styles.messageTime}>{formatDateTime(message.createdAt)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} style={styles.inputForm}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  style={styles.input}
                />
                <button type="submit" style={styles.sendBtn} disabled={sending || !draft.trim()}>
                  {sending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1260px',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '2rem 1rem',
    marginTop: '60px',
  },
  title: {
    marginTop: 0,
    marginRight: 0,
    marginBottom: '1rem',
    marginLeft: 0,
    color: '#1a5f2a',
    fontSize: '1.6rem',
  },
  error: {
    marginBottom: '1rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    borderRadius: '10px',
    padding: '0.8rem 1rem',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    marginTop: '120px',
    color: '#1a5f2a',
    fontSize: '1.1rem',
  },
  chatLayout: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '1rem',
  },
  sidebar: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #dbeafe',
    overflow: 'hidden',
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '0.9rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: '700',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  conversationItem: {
    border: 'none',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fff',
    textAlign: 'left',
    padding: '0.8rem 0.85rem',
    cursor: 'pointer',
  },
  conversationItemActive: {
    backgroundColor: '#eff6ff',
  },
  conversationTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
    marginBottom: '0.3rem',
    fontSize: '0.9rem',
  },
  bookingStatus: {
    color: '#0f766e',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  conversationName: {
    color: '#334155',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  conversationPitch: {
    fontSize: '0.82rem',
    color: '#64748b',
    marginTop: '0.2rem',
  },
  conversationLast: {
    fontSize: '0.82rem',
    color: '#475569',
    marginTop: '0.3rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  conversationTime: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
  },
  chatPanel: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #dbeafe',
    display: 'flex',
    flexDirection: 'column',
    height: '70vh',
  },
  chatHeader: {
    padding: '0.9rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  chatHeaderTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  chatHeaderSub: {
    fontSize: '0.86rem',
    color: '#64748b',
    marginTop: '0.2rem',
  },
  linkPitchBtn: {
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 0.8rem',
    backgroundColor: '#e2e8f0',
    color: '#0f172a',
    fontWeight: '600',
    cursor: 'pointer',
  },
  messagesWrap: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.8rem',
    backgroundColor: '#f8fafc',
  },
  loadingMessages: {
    textAlign: 'center',
    color: '#64748b',
    padding: '1rem 0',
  },
  empty: {
    padding: '1rem',
    color: '#64748b',
    textAlign: 'center',
  },
  emptyPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
  },
  emptyMessages: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: '2rem',
  },
  messageRow: {
    display: 'flex',
    marginBottom: '0.55rem',
  },
  messageBubble: {
    maxWidth: '72%',
    padding: '0.55rem 0.75rem',
    borderRadius: '10px',
    fontSize: '0.92rem',
  },
  messageMine: {
    backgroundColor: '#dbeafe',
    color: '#1e3a8a',
    border: '1px solid #bfdbfe',
  },
  messageOther: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
  },
  messageSender: {
    fontSize: '0.78rem',
    fontWeight: '700',
    marginBottom: '0.2rem',
    opacity: 0.85,
  },
  messageTime: {
    fontSize: '0.72rem',
    marginTop: '0.3rem',
    opacity: 0.7,
    textAlign: 'right',
  },
  inputForm: {
    display: 'flex',
    gap: '0.55rem',
    borderTop: '1px solid #e2e8f0',
    padding: '0.7rem',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.65rem 0.75rem',
    fontSize: '0.95rem',
  },
  sendBtn: {
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontWeight: '700',
    padding: '0.65rem 1rem',
    cursor: 'pointer',
  },
};

export default ChatPage;
