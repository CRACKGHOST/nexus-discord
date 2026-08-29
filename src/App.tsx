import { useState, useRef, useEffect } from 'react';
import { Hash, Volume2, Sparkles, Layout, Search, Inbox, HelpCircle, Plus, Video, ScreenShare, Pencil, X, Send, Gift, Sticker, Smile, Mic, MicOff, Headphones, Settings, PhoneOff, ChevronDown, UserPlus, Camera, Image as ImageIcon, Save } from 'lucide-react';

type Message = { id: number; user: string; avatar: string; avatarImg?: string; color: string; text: string; time: string; }
type Server = { id: string; name: string; icon: string; iconImg?: string; color: string; }
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
  { id: '4', name: 'Geral', type: 'voice', category: 'VOICE CHANNELS' },
  { id: '7', name: 'Musica', type: 'voice', category: 'VOICE CHANNELS' },
  { id: '5', name: 'canvas', type: 'canvas', category: 'NEXUS EXTRAS' },
];

export default function App() {
  // USER PROFILE - EDITAVEL
  const [userName, setUserName] = useState('W3scley');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState('Codando Nexus');
  const [userColor, setUserColor] = useState('#7c3aed');

  const [servers, setServers] = useState<Server[]>(initialServers);
  const [selectedServer, setSelectedServer] = useState('1');
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [selectedChannel, setSelectedChannel] = useState('1');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: 'W3scley', avatar: 'W', color: '#7c3aed', text: 'Eai galera, bora testar o NEXUS? 🚀', time: '10:32' },
  ]);
  const [input, setInput] = useState('');
  const [showCanvas, setShowCanvas] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
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
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('conta');
  const [tempName, setTempName] = useState(userName);
  const [tempStatus, setTempStatus] = useState(userStatus);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serverFileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { setTempName(userName); setTempStatus(userStatus); }, [showSettings]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserAvatar(url);
    }
  };

  const handleServerIconChange = (e: React.ChangeEvent<HTMLInputElement>, serverId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (serverId) {
        setServers(servers.map(s => s.id === serverId ? { ...s, iconImg: url } : s));
      }
    }
  };

  const saveProfile = () => {
    setUserName(tempName);
    setUserStatus(tempStatus);
    setMessages(messages.map(m => m.user === userName ? { ...m, user: tempName, avatar: tempName[0].toUpperCase(), avatarImg: userAvatar || undefined } : m));
    setShowSettings(false);
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      if (screenVideoRef.current) { screenVideoRef.current.srcObject = stream; screenVideoRef.current.play(); }
      setIsScreenSharing(true);
      stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
    } catch { alert("Negou compartilhamento"); }
  };

  const stopScreenShare = () => {
    if (screenVideoRef.current?.srcObject) {
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
    } catch { alert("Permita microfone"); }
  };

  const leaveVoiceChannel = () => {
    voiceStreamRef.current?.getTracks().forEach(t => t.stop());
    voiceStreamRef.current = null;
    setJoinedVoice(null);
    if (screenVideoRef.current?.srcObject) stopScreenShare();
  };

  const addChannel = (category: string) => {
    if (!newChannelName.trim()) return;
    const type = category === 'VOICE CHANNELS' ? 'voice' : 'text';
    setChannels([...channels, { id: Date.now().toString(), name: newChannelName.toLowerCase().replace(/\s/g, '-'), type, category }]);
    setNewChannelName(''); setShowNewChannel(null);
  };

  const addServer = () => {
    if (!newServerName.trim()) return;
    const newServer: Server = { id: Date.now().toString(), name: newServerName, icon: newServerName[0].toUpperCase(), color: 'bg-[#7c3aed]' };
    setServers([...servers, newServer]); setNewServerName(''); setShowCreateServer(false); setSelectedServer(newServer.id);
  };

  const toggleCategory = (cat: string) => setCollapsedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), user: userName, avatar: userName[0].toUpperCase(), avatarImg: userAvatar || undefined, color: userColor, text: input, time: new Date().toLocaleTimeString().slice(0,5) }]);
    setInput('');
  };

  const categories = Array.from(new Set(channels.map(c => c.category)));

  return (
    <div className="flex h-screen bg-[#313338] text-white overflow-hidden">
      {!focusMode && (
        <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 overflow-y-auto">
          {servers.map(s => (
            <div key={s.id} className="group relative flex items-center">
              <div className={`absolute -left-1 w-1 bg-white rounded-r-full transition-all ${selectedServer === s.id ? 'h-8' : 'h-0 group-hover:h-5'}`} />
              <button onClick={() => setSelectedServer(s.id)} onContextMenu={(e) => { e.preventDefault(); setEditingServerId(s.id); serverFileInputRef.current?.click(); }} className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] flex items-center justify-center font-bold text-lg transition-all overflow-hidden ${s.color} ${selectedServer === s.id ? 'rounded-[16px]' : ''}`}>
                {s.iconImg ? <img src={s.iconImg} className="w-full h-full object-cover" /> : s.icon}
              </button>
            </div>
          ))}
          <div className="w-8 h-[2px] bg-[#2b2d31] rounded-full my-1" />
          <button onClick={() => setShowCreateServer(true)} className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#23a559] group flex items-center justify-center transition-all"><Plus size={24} className="text-[#23a559] group-hover:text-white" /></button>
        </div>
      )}

      {!focusMode && (
        <div className="w-[240px] bg-[#2b2d31] flex flex-col">
          <div className="h-[48px] px-4 flex items-center font-bold text-[15px] border-b border-[#1f2124] shadow-sm">{servers.find(s => s.id === selectedServer)?.name} <ChevronDown size={16} className="ml-auto" /></div>
          <div className="p-2 flex-1 overflow-y-auto space-y-4">
            {categories.map(cat => (
              <div key={cat}>
                <button onClick={() => toggleCategory(cat)} className="w-full flex items-center gap-1 px-1 py-1 text-[12px] font-semibold text-[#949ba4] hover:text-[#dcddde]">{cat === 'TEXT CHANNELS' ? <ChevronDown size={12} className={`${collapsedCategories.includes(cat) ? '-rotate-90' : ''}`} /> : null}{cat}<Plus size={12} className="ml-auto" onClick={(e) => { e.stopPropagation(); setShowNewChannel(cat); }} /></button>
                {!collapsedCategories.includes(cat) && (
                  <div className="mt-1 space-y-[2px]">
                    {showNewChannel === cat && <div className="flex gap-1 px-2 py-1"><input value={newChannelName} onChange={e => setNewChannelName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChannel(cat)} placeholder="nome" autoFocus className="flex-1 bg-[#1e1f22] rounded px-2 py-1 text-sm outline-none" /><button onClick={() => addChannel(cat)} className="text-xs bg-[#7c3aed] px-2 rounded">+</button></div>}
                    {channels.filter(c => c.category === cat).map(c => (
                      <div key={c.id}>
                        <button onClick={() => c.type === 'voice' ? joinVoiceChannel(c.id) : setSelectedChannel(c.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[15px] ${selectedChannel === c.id && c.type !== 'voice' ? 'bg-[#404249] text-white' : joinedVoice === c.id ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dcddde]'}`}>
                          {c.type === 'voice' ? <Volume2 size={18} /> : c.type === 'canvas' ? <Pencil size={18} /> : <Hash size={18} />}<span className="truncate">{c.name}</span>
                        </button>
                        {c.type === 'voice' && joinedVoice === c.id && (
                          <div className="ml-8 mt-1 space-y-1">
                            <div className="flex items-center gap-2 py-1 px-1 rounded hover:bg-[#35373c]"><div className="w-6 h-6 rounded-full overflow-hidden bg-[#7c3aed] flex items-center justify-center text-[11px] font-bold">{userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : userName[0]}</div><span className="text-[13px] text-[#23a559]">{userName} (Você)</span></div>
                            <div className="flex gap-1 mt-2"><button onClick={startScreenShare} className="flex items-center gap-1 bg-[#2b2d31] px-2 py-1 rounded text-[11px]"><Video size={12} /> Vídeo</button><button onClick={startScreenShare} className="flex items-center gap-1 bg-[#2b2d31] px-2 py-1 rounded text-[11px]"><ScreenShare size={12} /> Tela</button><button onClick={leaveVoiceChannel} className="bg-[#ed4245] px-2 py-1 rounded text-[11px]"><PhoneOff size={12} /></button></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="h-[52px] bg-[#232428] px-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#7c3aed] flex items-center justify-center font-bold cursor-pointer" onClick={() => setShowSettings(true)}>{userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : userName[0]}</div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowSettings(true)}><div className="text-sm font-bold truncate">{userName}</div><div className="text-[11px] text-[#23a559] truncate">{userStatus}</div></div>
            <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 rounded hover:bg-[#35373c]">{isMuted ? <MicOff size={18} className="text-[#ed4245]" /> : <Mic size={18} />}</button>
            <button onClick={() => setShowSettings(true)} className="p-1.5 rounded hover:bg-[#35373c]"><Settings size={18} /></button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-[#313338]">
        <div className="h-[48px] bg-[#313338] border-b border-[#1f2124] flex items-center px-4 gap-4">
          <Hash size={20} className="text-[#80848e]" /><span className="font-bold">{channels.find(c => c.id === selectedChannel)?.name}</span>
          <div className="ml-auto flex items-center gap-4 text-[#b5bac1]">
            {isScreenSharing && <button onClick={stopScreenShare} className="bg-[#ed4245] px-3 py-1 rounded text-sm text-white flex gap-1 items-center"><ScreenShare size={14} /> Parar</button>}
            {!isScreenSharing && <button onClick={startScreenShare} className="hover:text-white flex gap-1 text-sm"><ScreenShare size={18} /> Tela</button>}
            <button onClick={() => setFocusMode(!focusMode)}><Layout size={18} /></button>
          </div>
        </div>
        {isScreenSharing && <div className="bg-black p-2"><video ref={screenVideoRef} autoPlay playsInline muted className="w-full max-h-[400px] rounded-lg" /><div className="text-center text-xs text-[#23a559] mt-1">Compartilhando tela</div></div>}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.map(m => (
            <div key={m.id} className="flex gap-3 hover:bg-[#2e3035] -mx-4 px-4 py-1">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold shrink-0" style={{ background: m.color }}>{m.avatarImg ? <img src={m.avatarImg} className="w-full h-full object-cover" /> : m.avatar}</div>
              <div className="flex-1"><div className="flex gap-2 items-baseline"><span className="font-medium" style={{ color: m.color }}>{m.user}</span><span className="text-[11px] text-[#949ba4]">{m.time}</span></div><div className="text-[15px] text-[#dcddde]">{m.text}</div></div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4"><div className="bg-[#383a40] rounded-lg flex items-center px-3 gap-3 min-h-[44px]"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={`Conversar em #${channels.find(c=>c.id===selectedChannel)?.name}`} className="flex-1 bg-transparent outline-none text-[15px]" /><button onClick={handleSend} className="bg-[#7c3aed] p-2 rounded-full"><Send size={16} /></button></div></div>
      </div>

      {/* SETTINGS MODAL - ESTILO DISCORD */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex bg-[#313338]">
          <div className="w-[33%] bg-[#2b2d31] flex justify-end p-6 pt-20">
            <div className="w-[192px] space-y-6">
              <div>
                <div className="text-[12px] font-bold text-[#949ba4] mb-2">CONFIGURAÇÕES DO USUÁRIO</div>
                <div className="space-y-1">
                  <button onClick={() => setSettingsTab('conta')} className={`w-full text-left px-2 py-1.5 rounded text-[15px] ${settingsTab === 'conta' ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dcddde]'}`}>Minha Conta</button>
                  <button onClick={() => setSettingsTab('perfil')} className={`w-full text-left px-2 py-1.5 rounded text-[15px] ${settingsTab === 'perfil' ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:bg-[#35373c]'}`}>Perfis</button>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="flex items-center gap-2 border border-[#4e5058] px-3 py-2 rounded-full text-sm hover:bg-[#35373c]"><X size={14} /> Esc • Fechar</button>
            </div>
          </div>
          <div className="flex-1 bg-[#313338] p-10 pt-20 overflow-y-auto">
            {settingsTab === 'conta' && (
              <div className="max-w-[660px]">
                <h2 className="text-xl font-bold mb-6">Minha Conta</h2>
                <div className="bg-[#232428] rounded-lg overflow-hidden">
                  <div className="h-[100px] bg-[#7c3aed]" />
                  <div className="p-4 flex items-end gap-4 -mt-8">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-[#7c3aed] border-4 border-[#232428] flex items-center justify-center text-2xl font-bold">
                        {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : userName[0]}
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={20} /></button>
                    </div>
                    <div className="flex-1 pb-2"><div className="text-xl font-bold">{tempName}</div><div className="text-sm text-[#949ba4]">Online</div></div>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-[#5865f2] hover:bg-[#4752c4] px-4 py-1.5 rounded text-sm">Alterar Avatar</button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </div>
                  <div className="p-4 space-y-4 bg-[#2b2d31] m-4 rounded-lg">
                    <div className="flex justify-between items-center"><div><div className="text-xs font-bold text-[#b5bac1] uppercase">Nome de usuário</div><div className="text-[15px]">{userName}</div></div><button onClick={() => setSettingsTab('perfil')} className="bg-[#2b2d31] border border-[#4e5058] px-4 py-1 rounded text-sm hover:bg-[#35373c]">Editar</button></div>
                    <div className="flex justify-between items-center"><div><div className="text-xs font-bold text-[#b5bac1] uppercase">Status personalizado</div><div className="text-[15px]">{userStatus}</div></div><button onClick={() => setSettingsTab('perfil')} className="bg-[#2b2d31] border border-[#4e5058] px-4 py-1 rounded text-sm">Editar</button></div>
                  </div>
                </div>
              </div>
            )}
            {settingsTab === 'perfil' && (
              <div className="max-w-[660px]">
                <h2 className="text-xl font-bold">Perfis</h2>
                <p className="text-sm text-[#b5bac1] mb-6">Mude seu avatar, nome e status igual no Discord</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-[#b5bac1] uppercase mb-2 block">Avatar</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-[#7c3aed] flex items-center justify-center text-2xl font-bold">{userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : tempName[0]}</div>
                      <div className="flex gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="bg-[#5865f2] hover:bg-[#4752c4] px-4 py-2 rounded text-sm flex gap-2 items-center"><ImageIcon size={16} /> Trocar foto</button>
                        {userAvatar && <button onClick={() => setUserAvatar(null)} className="bg-[#2b2d31] hover:bg-[#35373c] px-4 py-2 rounded text-sm">Remover</button>}
                      </div>
                    </div>
                    <p className="text-xs text-[#949ba4] mt-2">Clique no avatar ou no botão para escolher foto do seu PC</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#b5bac1] uppercase mb-2 block">Nome de exibição</label>
                    <input value={tempName} onChange={e => setTempName(e.target.value)} className="w-full bg-[#1e1f22] rounded px-3 py-2.5 outline-none" placeholder="Seu nome" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#b5bac1] uppercase mb-2 block">Status personalizado</label>
                    <input value={tempStatus} onChange={e => setTempStatus(e.target.value)} className="w-full bg-[#1e1f22] rounded px-3 py-2.5 outline-none" placeholder="Ex: Codando Nexus, Jogando..." />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#b5bac1] uppercase mb-2 block">Cor do seu nome</label>
                    <div className="flex gap-2">
                      {['#7c3aed','#06b6d4','#f43f5e','#10b981','#f59e0b','#5865f2'].map(c => (
                        <button key={c} onClick={() => setUserColor(c)} className={`w-8 h-8 rounded-full ${userColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#313338]' : ''}`} style={{ background: c }} />
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#2b2d31] border border-[#fa777c]/30 rounded p-3 flex gap-3">
                    <div className="text-[#fa777c]">⚠️</div>
                    <div><div className="text-sm font-bold text-[#fa777c]">Dica</div><div className="text-xs text-[#b5bac1]">Seu avatar aparece no chat, na voz e no perfil. Use foto quadrada que fica melhor!</div></div>
                  </div>

                  <button onClick={saveProfile} className="bg-[#23a559] hover:bg-[#1a7f43] px-6 py-2.5 rounded text-sm font-bold flex gap-2 items-center"><Save size={16} /> Salvar alterações</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateServer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#313338] rounded-lg w-full max-w-[440px] p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Criar um servidor</h2><button onClick={() => setShowCreateServer(false)}><X size={20} /></button></div><input value={newServerName} onChange={e => setNewServerName(e.target.value)} placeholder="Nome do servidor" className="w-full bg-[#1e1f22] rounded px-3 py-2.5 outline-none" /><div className="flex justify-end gap-2 mt-4"><button onClick={() => setShowCreateServer(false)} className="px-4 py-2 text-sm">Voltar</button><button onClick={addServer} className="bg-[#5865f2] px-6 py-2.5 rounded text-sm text-white">Criar</button></div></div>
        </div>
      )}

      <input ref={serverFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file && editingServerId) { const url = URL.createObjectURL(file); setServers(servers.map(s => s.id === editingServerId ? { ...s, iconImg: url } : s)); setEditingServerId(null); } }} />
    </div>
  );
}
