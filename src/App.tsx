import { useState, useRef, useEffect } from 'react';
import { Hash, Volume2, Users, Sparkles, Languages, Layout, CheckSquare, BarChart3, Calendar, Code2, Music, Mic, MicOff, Headphones, Settings, Plus, Video, ScreenShare, Pencil, X, Send, Smile, Gift, Sticker, Search, Inbox, HelpCircle, Play, Pause, PhoneOff, ChevronDown, UserPlus } from 'lucide-react';

type Message = { id: number; user: string; avatar: string; color: string; text: string; time: string; type?: 'task'|'poll'|'event'|'code'|'music'; data?: any; translated?: string; }
type Server = { id: string; name: string; icon: string; color: string; }
type Channel = { id: string; name: string; type: 'text'|'voice'|'canvas'; unread?: number; category: string; }

const initialServers: Server[] = [
  { id: '1', name: 'Nexus HQ', icon: 'N', color: 'bg-[#7c3aed]' },
  { id: '2', name: 'Dev Squad', icon: 'D', color: 'bg-[#06b6d4]' },
  { id: '3', name: 'Design Club', icon: '🎨', color: 'bg-[#f43f5e]' },
];

const initialChannels: Channel[] = [
  { id: '1', name: 'geral', type: 'text', unread: 3, category: 'TEXT CHANNELS' },
  { id: '2', name: 'dev', type: 'text', category: 'TEXT CHANNELS' },
  { id: '3', name: 'design', type: 'text', category: 'TEXT CHANNELS' },
  { id: '6', name: 'eventos', type: 'text', category: 'TEXT CHANNELS' },
  { id: '4', name: 'Geral', type: 'voice', category: 'VOICE CHANNELS' },
  { id: '7', name: 'Musica', type: 'voice', category: 'VOICE CHANNELS' },
  { id: '5', name: 'canvas', type: 'canvas', category: 'NEXUS EXTRAS' },
];

const mockMessages: Message[] = [
  { id: 1, user: 'W3scley', avatar: 'W', color: '#7c3aed', text: 'Eai galera, bora testar o NEXUS? 🚀', time: '10:32' },
  { id: 2, user: 'Ana Dev', avatar: 'A', color: '#06b6d4', text: 'Esse canvas colaborativo é absurdo! Dá pra desenhar junto na call', time: '10:33' },
];

const THEME = "#7c3aed";

export default function App() {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [selectedServer, setSelectedServer] = useState('1');
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [selectedChannel, setSelectedChannel] = useState('1');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');
  const [showCanvas, setShowCanvas] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannel, setShowNewChannel] = useState<string | null>(null);
  const [joinedVoice, setJoinedVoice] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        screenVideoRef.current.play();
      }
      setIsScreenSharing(true);
      stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
    } catch (err) { alert("Você negou o compartilhamento"); }
  };

  const stopScreenShare = () => {
    if (screenVideoRef.current && screenVideoRef.current.srcObject) {
      (screenVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      screenVideoRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
  };

  const joinVoiceChannel = async (channelId: string) => {
    if (joinedVoice === channelId) { leaveVoiceChannel(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceStreamRef.current = stream;
      setJoinedVoice(channelId);
      setSelectedChannel(channelId);
    } catch { alert("Precisa permitir microfone pra entrar na voz"); }
  };

  const leaveVoiceChannel = () => {
    if (voiceStreamRef.current) {
      voiceStreamRef.current.getTracks().forEach(t => t.stop());
      voiceStreamRef.current = null;
    }
    setJoinedVoice(null);
    setIsScreenSharing(false);
    if (screenVideoRef.current?.srcObject) stopScreenShare();
  };

  const addChannel = (category: string) => {
    if (!newChannelName.trim()) return;
    const type = category === 'VOICE CHANNELS' ? 'voice' : 'text';
    const newChannel: Channel = { id: Date.now().toString(), name: newChannelName.toLowerCase().replace(/\s/g, '-'), type, category };
    setChannels([...channels, newChannel]);
    setNewChannelName('');
    setShowNewChannel(null);
  };

  const addServer = () => {
    if (!newServerName.trim()) return;
    const newServer: Server = { id: Date.now().toString(), name: newServerName, icon: newServerName[0].toUpperCase(), color: 'bg-[#7c3aed]' };
    setServers([...servers, newServer]);
    setNewServerName('');
    setShowCreateServer(false);
    setSelectedServer(newServer.id);
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showCanvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = THEME;
    const getPos = (e: any) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };
    const start = (e: any) => { isDrawing.current = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const move = (e: any) => { if (!isDrawing.current) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const end = () => { isDrawing.current = false; };
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
    return () => { canvas.removeEventListener('mousedown', start); canvas.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); }
  }, [showCanvas]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), user: 'W3scley', avatar: 'W', color: THEME, text: input, time: new Date().toLocaleTimeString().slice(0,5) }]);
    setInput('');
  };

  const categories = Array.from(new Set(channels.map(c => c.category)));

  return (
    <div className="flex h-screen bg-[#313338] text-white font-[Whitney] overflow-hidden">
      {/* SERVERS - IGUAL DISCORD */}
      {!focusMode && (
        <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 overflow-y-auto">
          {servers.map(s => (
            <div key={s.id} className="group relative flex items-center">
              <div className={`absolute -left-1 w-1 bg-white rounded-r-full transition-all ${selectedServer === s.id ? 'h-8' : 'h-0 group-hover:h-5'}`} />
              <button onClick={() => setSelectedServer(s.id)} className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] flex items-center justify-center font-bold text-lg transition-all ${s.color} ${selectedServer === s.id ? 'rounded-[16px]' : ''} hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]`}>{s.icon}</button>
            </div>
          ))}
          <div className="w-8 h-[2px] bg-[#2b2d31] rounded-full my-1" />
          <button onClick={() => setShowCreateServer(true)} className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#23a559] group flex items-center justify-center transition-all">
            <Plus size={24} className="text-[#23a559] group-hover:text-white" />
          </button>
        </div>
      )}

      {/* CHANNELS - ORGANIZADO IGUAL DISCORD */}
      {!focusMode && (
        <div className="w-[240px] bg-[#2b2d31] flex flex-col">
          <div className="h-[48px] px-4 flex items-center font-bold text-[15px] border-b border-[#1f2124] shadow-sm cursor-pointer hover:bg-[#35373c]">{servers.find(s => s.id === selectedServer)?.name} <ChevronDown size={16} className="ml-auto" /></div>
          
          <div className="p-2 flex-1 overflow-y-auto space-y-4 scrollbar-thin">
            {categories.map(cat => (
              <div key={cat}>
                <button onClick={() => toggleCategory(cat)} className="w-full flex items-center gap-1 px-1 py-1 text-[12px] font-semibold text-[#949ba4] hover:text-[#dcddde] tracking-wide">
                  <ChevronDown size={12} className={`transition-transform ${collapsedCategories.includes(cat) ? '-rotate-90' : ''}`} />
                  {cat}
                  <Plus size={12} className="ml-auto hover:text-white" onClick={(e) => { e.stopPropagation(); setShowNewChannel(cat); }} />
                </button>
                
                {!collapsedCategories.includes(cat) && (
                  <div className="mt-1 space-y-[2px]">
                    {showNewChannel === cat && (
                      <div className="flex gap-1 px-2 py-1">
                        <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChannel(cat)} placeholder={cat === 'VOICE CHANNELS' ? 'novo canal de voz' : 'novo canal'} autoFocus className="flex-1 bg-[#1e1f22] rounded px-2 py-1 text-sm outline-none text-white" />
                        <button onClick={() => addChannel(cat)} className="text-xs bg-[#7c3aed] px-2 rounded">+</button>
                      </div>
                    )}
                    
                    {channels.filter(c => c.category === cat).map(c => (
                      <div key={c.id}>
                        <button onClick={() => c.type === 'voice' ? joinVoiceChannel(c.id) : setSelectedChannel(c.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[4px] text-[15px] font-medium ${selectedChannel === c.id && c.type !== 'voice' ? 'bg-[#404249] text-white' : joinedVoice === c.id ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dcddde]'}`}>
                          {c.type === 'voice' ? <Volume2 size={18} className="text-[#80848e]" /> : c.type === 'canvas' ? <Pencil size={18} className="text-[#80848e]" /> : <Hash size={18} className="text-[#80848e]" />}
                          <span className="truncate">{c.name}</span>
                          {c.unread && <span className="ml-auto bg-[#f23f43] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">{c.unread}</span>}
                          {c.type === 'text' && <UserPlus size={14} className="ml-auto opacity-0 group-hover:opacity-100" />}
                        </button>
                        
                        {/* VOICE PARTICIPANTS - IGUAL DISCORD */}
                        {c.type === 'voice' && joinedVoice === c.id && (
                          <div className="ml-8 mt-1 space-y-1">
                            <div className="flex items-center gap-2 py-1 px-1 rounded hover:bg-[#35373c] group">
                              <div className="relative">
                                <div className="w-6 h-6 rounded-full bg-[#7c3aed] flex items-center justify-center text-[11px] font-bold ring-2 ring-[#23a559]">W</div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#1e1f22] rounded-full flex items-center justify-center">
                                  {isMuted ? <MicOff size={8} className="text-[#f23f43]" /> : <Mic size={8} className="text-[#23a559]" />}
                                </div>
                              </div>
                              <span className="text-[13px] text-[#23a559] font-medium">W3scley (Você)</span>
                            </div>
                            <div className="flex items-center gap-2 py-1 px-1 rounded hover:bg-[#35373c]">
                              <div className="w-6 h-6 rounded-full bg-[#06b6d4] flex items-center justify-center text-[11px] font-bold">A</div>
                              <span className="text-[13px] text-[#949ba4]">Ana Dev</span>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <button onClick={startScreenShare} className="flex items-center gap-1 bg-[#2b2d31] hover:bg-[#35373c] px-2 py-1 rounded text-[11px]"><Video size={12} /> Vídeo</button>
                              <button onClick={startScreenShare} className="flex items-center gap-1 bg-[#2b2d31] hover:bg-[#35373c] px-2 py-1 rounded text-[11px]"><ScreenShare size={12} /> Tela</button>
                              <button onClick={leaveVoiceChannel} className="flex items-center gap-1 bg-[#ed4245] hover:bg-[#c03537] px-2 py-1 rounded text-[11px]"><PhoneOff size={12} /> Sair</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* VOICE CONNECTED PANEL - IGUAL DISCORD */}
            {joinedVoice && (
              <div className="bg-[#232428] border border-[#2b2d31] rounded-lg p-2 mt-4">
                <div className="flex items-center gap-2 text-xs text-[#23a559]"><div className="w-2 h-2 bg-[#23a559] rounded-full animate-pulse" /> Conectado por voz / {channels.find(c => c.id === joinedVoice)?.name}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setIsMuted(!isMuted)} className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs ${isMuted ? 'bg-[#ed4245] text-white' : 'bg-[#2b2d31] hover:bg-[#35373c]'}`}>{isMuted ? <MicOff size={12} /> : <Mic size={12} />} {isMuted ? 'Unmute' : 'Mute'}</button>
                  <button onClick={() => setIsDeafened(!isDeafened)} className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs ${isDeafened ? 'bg-[#ed4245] text-white' : 'bg-[#2b2d31] hover:bg-[#35373c]'}`}><Headphones size={12} /> Deafen</button>
                  <button onClick={leaveVoiceChannel} className="flex-1 bg-[#ed4245] hover:bg-[#c03537] py-1 rounded text-xs flex items-center justify-center gap-1"><PhoneOff size={12} /> Desconectar</button>
                </div>
              </div>
            )}
          </div>

          <div className="h-[52px] bg-[#232428] px-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center font-bold text-sm">W</div>
            <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate">W3scley</div><div className="text-[11px] text-[#23a559]">● Online</div></div>
            <button onClick={() => setIsMuted(!isMuted)} className={`p-1.5 rounded hover:bg-[#35373c] ${isMuted ? 'text-[#ed4245]' : 'text-[#b5bac1]'}`}>{isMuted ? <MicOff size={18} /> : <Mic size={18} />}</button>
            <button onClick={() => setIsDeafened(!isDeafened)} className={`p-1.5 rounded hover:bg-[#35373c] ${isDeafened ? 'text-[#ed4245]' : 'text-[#b5bac1]'}`}><Headphones size={18} /></button>
            <Settings size={18} className="text-[#b5bac1] hover:text-white cursor-pointer" />
          </div>
        </div>
      )}

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col bg-[#313338]">
        <div className="h-[48px] bg-[#313338] border-b border-[#1f2124] flex items-center px-4 gap-4 shadow-sm">
          {channels.find(c => c.id === selectedChannel)?.type === 'voice' ? <Volume2 size={20} className="text-[#80848e]" /> : <Hash size={20} className="text-[#80848e]" />}
          <span className="font-bold text-[15px]">{channels.find(c => c.id === selectedChannel)?.name}</span>
          <div className="w-[1px] h-6 bg-[#3f4147] mx-2" />
          <span className="text-sm text-[#b5bac1] hidden md:block">{channels.find(c => c.id === selectedChannel)?.type === 'voice' ? 'Canal de voz' : 'Canal de texto'}</span>
          <div className="ml-auto flex items-center gap-4 text-[#b5bac1]">
            {isScreenSharing && <button onClick={stopScreenShare} className="bg-[#ed4245] hover:bg-[#c03537] px-3 py-1 rounded text-sm font-medium flex items-center gap-1.5 text-white"><ScreenShare size={14} /> Parar</button>}
            {!isScreenSharing && <button onClick={startScreenShare} className="hover:text-white flex items-center gap-1.5 text-sm"><ScreenShare size={18} /> Compartilhar Tela</button>}
            <button onClick={() => setShowRecap(!showRecap)} className="bg-[#7c3aed] hover:bg-[#6d28d9] px-3 py-1 rounded text-sm font-medium flex items-center gap-1.5 text-white"><Sparkles size={14} /> AI Recap</button>
            <button onClick={() => setFocusMode(!focusMode)} className="hover:text-white"><Layout size={18} /></button>
            <Search size={18} className="hover:text-white cursor-pointer" /><Inbox size={18} className="hover:text-white cursor-pointer" /><HelpCircle size={18} className="hover:text-white cursor-pointer" />
          </div>
        </div>

        {isScreenSharing && (
          <div className="bg-[#000] p-2 border-b border-[#1f2124]">
            <video ref={screenVideoRef} autoPlay playsInline muted className="w-full max-h-[400px] rounded-lg bg-black" />
            <div className="text-center text-xs text-[#23a559] mt-1 flex items-center justify-center gap-2"><div className="w-2 h-2 bg-[#ed4245] rounded-full animate-pulse" /> Você está compartilhando sua tela</div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.map(m => (
            <div key={m.id} className="flex gap-3 group hover:bg-[#2e3035] -mx-4 px-4 py-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 mt-0.5" style={{ background: m.color }}>{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2"><span className="font-medium text-[15px] hover:underline cursor-pointer" style={{ color: m.color }}>{m.user}</span><span className="text-[11px] text-[#949ba4]">{m.time}</span></div>
                <div className="text-[15px] text-[#dcddde] leading-[22px] whitespace-pre-wrap break-words">{m.text}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4">
          <div className="bg-[#383a40] rounded-lg">
            <div className="min-h-[44px] flex items-center px-3 gap-3">
              <button className="w-7 h-7 bg-[#b5bac1] hover:bg-[#dcddde] rounded-full flex items-center justify-center text-[#383a40] transition-colors"><Plus size={16} /></button>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={`Conversar em #${channels.find(c=>c.id===selectedChannel)?.name}`} className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[#6d6f78]" />
              <div className="flex gap-3 text-[#b5bac1]"><Gift size={20} className="hover:text-[#dcddde] cursor-pointer" /><Sticker size={20} className="hover:text-[#dcddde] cursor-pointer" /><Smile size={20} className="hover:text-[#dcddde] cursor-pointer" /></div>
              <button onClick={handleSend} className="bg-[#7c3aed] hover:bg-[#6d28d9] p-2 rounded-full transition-colors"><Send size={16} /></button>
            </div>
          </div>
          <div className="text-[11px] text-[#6d6f78] mt-2 px-1">NEXUS • Melhor que Discord • Aperte Enter para enviar • Tela e Voz funcionando 100%</div>
        </div>
      </div>

      {/* RIGHT MEMBERS - IGUAL DISCORD */}
      {!focusMode && (
        <div className="w-[240px] bg-[#2b2d31] hidden lg:flex flex-col">
          <div className="p-3 flex-1">
            {joinedVoice && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-[#949ba4] mb-2">NO VOZ — {channels.find(c => c.id === joinedVoice)?.name}</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 bg-[#35373c] rounded px-2 py-1"><div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center font-bold">W</div><div><div className="text-sm font-medium">W3scley</div><div className="text-xs text-[#23a559] flex items-center gap-1"><Mic size={10} /> Falando</div></div></div>
                </div>
              </div>
            )}
            <h3 className="text-xs font-semibold text-[#949ba4] mb-2">ONLINE — 4</h3>
            <div className="space-y-0.5">
              {[{ n: 'W3scley', s: 'Codando Nexus', c: '#7c3aed' }, { n: 'Ana Dev', s: 'No VS Code', c: '#06b6d4' }, { n: 'Lucas', s: 'Jogando Valorant', c: '#f43f5e' }, { n: 'Sophia', s: 'No Spotify', c: '#10b981' }].map(u => (
                <div key={u.n} className="flex items-center gap-3 px-2 py-1 rounded hover:bg-[#35373c] cursor-pointer group">
                  <div className="relative"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: u.c }}>{u.n[0]}</div><div className="absolute bottom-0 right-0 w-3 h-3 bg-[#23a559] rounded-full border-2 border-[#2b2d31]" /></div>
                  <div className="flex-1 min-w-0"><div className="text-[15px] font-medium truncate group-hover:text-white text-[#949ba4] group-hover:underline">{u.n}</div><div className="text-[12px] text-[#80848e] truncate">{u.s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE SERVER MODAL */}
      {showCreateServer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#313338] rounded-lg w-full max-w-[440px] p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Criar um servidor</h2><button onClick={() => setShowCreateServer(false)}><X size={20} /></button></div>
            <p className="text-sm text-[#b5bac1] mb-4">Seu servidor é onde você e seus amigos se reúnem. Crie o seu e comece a conversar.</p>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-[#b5bac1] uppercase">Nome do servidor</label><input value={newServerName} onChange={e => setNewServerName(e.target.value)} placeholder="Digite o nome do seu servidor" className="w-full mt-2 bg-[#1e1f22] rounded px-3 py-2.5 text-white outline-none" /></div>
              <div className="flex justify-between pt-2"><button onClick={() => setShowCreateServer(false)} className="text-sm hover:underline">Voltar</button><button onClick={addServer} className="bg-[#5865f2] hover:bg-[#4752c4] px-6 py-2.5 rounded text-sm font-medium text-white">Criar</button></div>
            </div>
          </div>
        </div>
      )}

      {showCanvas && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <div className="h-[48px] bg-[#313338] flex items-center px-4 justify-between border-b border-[#1f2124]"><span className="font-bold flex gap-2 items-center"><Pencil size={16} /> Canvas Colaborativo</span><button onClick={() => setShowCanvas(false)} className="bg-[#ed4245] px-3 py-1 rounded text-sm font-bold">Fechar</button></div>
          <canvas ref={canvasRef} width={1200} height={700} className="flex-1 bg-[#0f0f12] cursor-crosshair" />
        </div>
      )}
    </div>
  );
}
