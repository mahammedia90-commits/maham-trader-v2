/*
 * Design: Fluid Obsidian Glass — Messages with realistic chat threads, auto-reply, and status indicators
 */
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, Send, User, ArrowRight, CheckCheck, Clock, Paperclip, Smile } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage { id: number; text: string; sender: 'user' | 'other'; time: string; read: boolean; }
interface Chat { id: number; name: string; role: string; lastMsg: string; time: string; unread: number; online: boolean; messages: ChatMessage[]; }

export default function Messages() {
  const { t, language } = useLanguage();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1, name: t('help.maham_expo_support'),
      role: t('team.support_team'),
      lastMsg: t('help.hello_how_can_we'),
      time: '10:30', unread: 2, online: true,
      messages: [
        { id: 1, text: t('login.welcome'), sender: 'other', time: '10:25', read: true },
        { id: 2, text: t('help.how_can_we_help'), sender: 'other', time: '10:30', read: false },
      ]
    },
    {
      id: 2, name: t('dashboard.manage_expos'),
      role: t('team.expo_manager'),
      lastMsg: t('messages.your_booking_for_booth'),
      time: '09:15', unread: 0, online: true,
      messages: [
        { id: 1, text: t('expo.hello_i_would_like'), sender: 'user', time: '09:00', read: true },
        { id: 2, text: t('expo.hello_yes_booth_a12'), sender: 'other', time: '09:05', read: true },
        { id: 3, text: t('bookings.excellent_i_would_like'), sender: 'user', time: '09:10', read: true },
        { id: 4, text: t('expo.your_booking_for_booth'), sender: 'other', time: '09:15', read: true },
      ]
    },
    {
      id: 3, name: t('payments.payments_department'),
      role: t('team.accountant'),
      lastMsg: t('payments.payment_received_successfully_receipt'),
      time: t('common.yesterday'), unread: 1, online: false,
      messages: [
        { id: 1, text: t('payments.payment_received_successfully_receipt'), sender: 'other', time: '14:30', read: false },
      ]
    },
    {
      id: 4, name: t('services.exhibitor_services'),
      role: t('team.service_coordinator'),
      lastMsg: t('messages.booth_design_service_request'),
      time: t('common.yesterday'), unread: 0, online: false,
      messages: [
        { id: 1, text: t('expo.hello_i_want_to'), sender: 'user', time: '11:00', read: true },
        { id: 2, text: t('contracts.of_course_we_will'), sender: 'other', time: '11:15', read: true },
        { id: 3, text: t('contracts.yes_i_want_a'), sender: 'user', time: '11:20', read: true },
        { id: 4, text: t('expo.booth_design_service_request'), sender: 'other', time: '11:30', read: true },
      ]
    },
  ]);

  const selectedChatData = chats.find(c => c.id === selectedChat);
  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat, chats]);

  const handleSend = () => {
    if (!newMsg.trim() || !selectedChat) return;
    const msg: ChatMessage = { id: Date.now(), text: newMsg.trim(), sender: 'user', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), read: false };
    setChats(prev => prev.map(c => c.id === selectedChat ? { ...c, messages: [...c.messages, msg], lastMsg: newMsg.trim(), time: msg.time } : c));
    setNewMsg('');

    // Auto reply
    setTimeout(() => {
      const reply: ChatMessage = {
        id: Date.now() + 1,
        text: t('messages.thanks_for_your_message'),
        sender: 'other', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), read: false
      };
      setChats(prev => prev.map(c => c.id === selectedChat ? { ...c, messages: [...c.messages, reply], lastMsg: reply.text, time: reply.time } : c));
    }, 2000);
  };

  return (
    <div className="page-enter pb-20 lg:pb-0">
      <h1 className="text-lg sm:text-2xl font-bold mb-4" >{t('messages.title')}</h1>
      <div className="grid lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Chat List */}
        <div className={`lg:col-span-1 rounded-xl glass-card overflow-hidden flex flex-col ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('messages.search')} value={search} onChange={e => setSearch(e.target.value)} className="ps-10 h-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map(chat => (
              <button key={chat.id} onClick={() => { setSelectedChat(chat.id); setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c)); }}
                className={`w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-start border-b border-border/20 ${selectedChat === chat.id ? 'bg-accent/50' : ''}`}>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a843] to-[#8B6914] flex items-center justify-center text-foreground font-bold text-sm">{chat.name.charAt(0)}</div>
                  {chat.online && <span className="absolute bottom-0 end-0 w-3 h-3 rounded-full bg-green-400 border-2 border-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{chat.name}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMsg}</p>
                </div>
                {chat.unread > 0 && <span className="w-5 h-5 rounded-full bg-[var(--gold-primary)] text-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{chat.unread}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`lg:col-span-2 rounded-xl glass-card flex flex-col ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-border/50 flex items-center gap-3">
                <button onClick={() => setSelectedChat(null)} className="lg:hidden"><ArrowRight className="w-5 h-5 rotate-180" /></button>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4a843] to-[#8B6914] flex items-center justify-center text-foreground font-bold text-xs">{selectedChatData.name.charAt(0)}</div>
                  {selectedChatData.online && <span className="absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-card" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{selectedChatData.name}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedChatData.role} {selectedChatData.online ? (t('common.online')) : ''}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {selectedChatData.messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.sender === 'other' && (
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0"><User className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    )}
                    <div className={`max-w-[75%] p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-[var(--gold-primary)]/10 text-foreground' : 'bg-accent'}`}>
                      {msg.text}
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        {msg.sender === 'user' && <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-blue-400' : 'text-muted-foreground'}`} />}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/50 flex gap-2">
                <Input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={t('messages.type_message')} className="flex-1" />
                <Button onClick={handleSend} disabled={!newMsg.trim()}
                  className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{t('messages.select_conversation')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
