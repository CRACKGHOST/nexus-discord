import { useState, useRef, useEffect } from 'react';
import { Hash, Volume2, Users, Sparkles, Languages, Layout, CheckSquare, BarChart3, Calendar, Code2, Music, Mic, Headphones, Settings, Plus, Video, ScreenShare, Pencil, X, Send, Smile, Gift, Sticker, Search, Inbox, HelpCircle, Play, Pause } from 'lucide-react';

type Message = { id: number; user: string; avatar: string; color: string; text: string; time: string; type?: 'task'|'poll'|'event'|'code'|'music'; data?: any; translated?: string; }
type Server = { id: string; name: string; icon: string; color: string; }
type Channel = { id: string; name: string; type: 'text'|'voice'|'canvas'; unread?: number; }

const servers: Server[] = [
  { id: '1', name: 'Nexus HQ', icon: 'N', color: 'bg-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.5)]' },
  { id: '2', name: 'Dev Squad', icon: 'D', color: 'bg-[#06b6d4]' },
  { id: '3', name: 'Design Club', icon: '🎨', color: 'bg-[#f43f5e]' },
];

const THEME = "#7c3aed";
const THEME_GLOW = "rgba(124,58,237,0.5)";

const mockMessages: Message[] = [
  { id: 1, user: 'W3scley', avatar: 'W', color: '#7c3aed', text: 'Eai galera, bora testar o NEXUS? 🚀', time: '10:32' },
  { id: 2, user: 'Ana Dev', avatar: 'A', color: '#06b6d4', text: 'Esse canvas colaborativo é absurdo! Dá pra desenhar junto na call', time: '10:33' },
  { id: 3, user: 'Lucas', avatar: 'L', color: '#f43f5e', text: '', type: 'task', data: { title: 'Lançar MVP do Nexus', tasks: [{ t: 'Finalizar chat', done: true }, { t: 'Adicionar voz com transcrição', done: false }, { t: 'Deploy na Vercel', done: false }] }, time: '10:34' },
  { id: 4, user: 'Sophia', avatar: 'S', color: '#10b981', text: 'Alguém afim de listening party mais tarde?', time: '10:35' },
  { id: 5, user: 'Ana Dev', avatar: 'A', color: '#06b6d4', text: 'function nexus() { return "melhor que discord"; }', type: 'code', data: { lang: 'js', output: '"melhor que discord"' }, time: '10:36' },
  { id: 6, user: 'Carlos', avatar: 'C', color: '#f59e0b', text: '', type: 'poll', data: { q: 'Qual feature falta?', options: [{ o: 'Videochamada 4K', v: 12 }, { o: 'Tradução automática', v: 8 }, { o: 'Whiteboard infinito', v: 15 }] }, time: '10:37' },
  { id: 7, user: 'W3scley', avatar: 'W', color: '#7c3aed', text: 'Hello guys, this chat has instant translation!', time: '10:38' },
];

export default function App() {
  const [selectedServer, setSelectedServer] = useState('1');
  const [selectedChannel, setSelectedChannel] = useState('1');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');
  const [showCanvas, setShowCanvas] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([
    { id: '1', name: 'geral', type: 'text', unread: 3 },
    { id: '2', name: 'dev', type: 'text' },
    { id: '3', name: 'design', type: 'text' },
    { id: '4', name: 'voz-geral', type: 'voice' },
    { id: '5', name: 'canvas', type: 'canvas' },
    { id: '6', name: 'eventos', type: 'text' },
  ]);
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
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
    } catch (err) {
      alert("Você negou o compartilhamento");
    }
  };

  const stopScreenShare = () => {
    if (screenVideoRef.current && screenVideoRef.current.srcObject) {
      const stream = screenVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      screenVideoRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
  };

  const addChannel = () => {
    if (!newChannelName.trim()) return;
    const newChannel: Channel = { id: Date.now().toString(), name: newChannelName.toLowerCase().replace(/\s/g, '-'), type: 'text' };
    setChannels([...channels, newChannel]);
    setNewChannelName('');
    setShowNewChannel(false);
    setSelectedChannel(newChannel.id);
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
    canvas.addEventListener('touchstart', start); canvas.addEventListener('touchmove', move); canvas.addEventListener('touchend', end);
    return () => { canvas.removeEventListener('mousedown', start); canvas.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); }
  }, [showCanvas]);

  const handleSend = () => {
    if (!input.trim()) return;
    let type: any = undefined, data: any = undefined;
    if (input.startsWith('/task')) { type = 'task'; data = { title: input.replace('/task', '') || 'Nova tarefa', tasks: [{ t: 'Fazer', done: false }] }; }
    else if (input.startsWith('/poll')) { type = 'poll'; data = { q: input.replace('/poll', '') || 'Enquete?', options: [{ o: 'Sim', v: 0 }, { o: 'Não', v: 0 }] }; }
    else if (input.startsWith('/code')) { type = 'code'; data = { lang: 'js', output: 'Rodando...' }; }
    else if (input.startsWith('/event')) { type = 'event'; data = { title: input.replace('/event', '') || 'Evento', date: 'Hoje 20h' }; }
    setMessages([...messages, { id: Date.now(), user: 'W3scley', avatar: 'W', color: THEME, text: input.replace(/^\/(task|poll|code|event)\s*/, ''), type, data, time: new Date().toLocaleTimeString().slice(0,5) }]);
    setInput('');
  };

  const toggleTranslate = (id: number) => {
    setMessages(messages.map(m => m.id === id ? { ...m, translated: m.translated ? undefined : `Traduzido: ${m.text} [PT-BR]` } : m));
  };

  return (
    <div className="flex h-screen bg-[#050507] text-white font-[Inter] overflow-hidden">
      {!focusMode && (
        <div className="w-[72px] bg-[#08080a] flex flex-col items-center py-3 gap-2 border-r border-[#1a1a1f]">
          {servers.map(s => (
            <button key={s.id} onClick={() => setSelectedServer(s.id)} className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] flex items-center justify-center font-bold transition-all ${s.color} ${selectedServer === s.id ? 'rounded-[16px] ring-2 ring-white shadow-[0_0_15px_rgba(124,58,237,0.8)]' : ''}`}>{s.icon}</button>
          ))}
          <button className="w-12 h-12 rounded-[24px] bg-[#1a1a1f] hover:bg-[#7c3aed] hover:rounded-[16px] hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] flex items-center justify-center transition-all"><Plus size={24} /></button>
        </div>
      )}

      {!focusMode && (
        <div className="w-[240px] bg-[#0f0f12] flex flex-col border-r border-[#1a1a1f]">
          <div className="h-[48px] px-4 flex items-center font-bold border-b border-[#1f1f23] shadow-sm">Nexus HQ <span className="ml-auto">⌄</span></div>
          <div className="p-2 flex-1 overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-[11px] text-[#8a8a8e] font-bold tracking-wider">CANAIS DE TEXTO</p>
                <button onClick={() => setShowNewChannel(!showNewChannel)} className="text-[#8a8a8e] hover:text-[#7c3aed] transition-colors"><Plus size={14} /></button>
              </div>
              {showNewChannel && (
                <div className="flex gap-1 mb-2 px-2">
                  <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChannel()} placeholder="nome do canal" className="flex-1 bg-[#1a1a1f] border border-[#7c3aed]/30 rounded px-2 py-1 text-xs outline-none focus:border-[#7c3aed]" />
                  <button onClick={addChannel} className="bg-[#7c3aed] hover:bg-[#6d28d9] shadow-[0_0_10px_rgba(124,58,237,0.4)] px-2 py-1 rounded text-xs">Criar</button>
                </div>
              )}
              {channels.filter(c => c.type === 'text').map(c => (
                <button key={c.id} onClick={() => setSelectedChannel(c.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[15px] transition-all ${selectedChannel === c.id ? 'bg-[#1e1e24] text-white border-l-2 border-[#7c3aed] shadow-[inset_0_0_10px_rgba(124,58,237,0.1)]' : 'text-[#949ba4] hover:bg-[#1e1f22] hover:text-[#dcddde]'}`}>
                  <Hash size={18} /> {c.name} {c.unread && <span className="ml-auto bg-[#7c3aed] text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.6)]">{c.unread}</span>}
                </button>
              ))}
            </div>
            <div>
              <p className="text-[11px] text-[#8a8a8e] font-bold tracking-wider px-2 mb-1">VOZ • COM TRANSCRIÇÃO</p>
              {channels.filter(c => c.type === 'voice').map(c => (
                <button key={c.id} onClick={() => setSelectedChannel(c.id)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[#949ba4] hover:bg-[#1e1f22] text-[15px]">
                  <Volume2 size={18} /> {c.name}
                </button>
              ))}
              <div className="mt-2 ml-2 bg-[#141417] rounded-lg p-2 border border-[#7c3aed]/20">
                <div className="flex items-center gap-2 text-xs text-[#a78bfa]"><div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.8)]" /> Ao vivo: "vamos subir o deploy hoje?"</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={startScreenShare} className="flex items-center gap-1 bg-[#1e1e24] hover:bg-[#7c3aed] border border-[#7c3aed]/30 px-2 py-1 rounded text-xs transition-all"><ScreenShare size={12} /> Tela</button>
                  <button className="flex items-center gap-1 bg-[#1e1e24] hover:bg-[#1a1a1f] border border-[#2a2a30] px-2 py-1 rounded text-xs"><Video size={12} /> Cam</button>
                </div>
                {isScreenSharing && <div className="text-[11px] text-[#a78bfa] mt-1 animate-pulse">● Transmitindo tela com neon</div>}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-[#8a8a8e] font-bold tracking-wider px-2 mb-1">EXTRAS NEXUS</p>
              <button onClick={() => setShowCanvas(true)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[#949ba4] hover:bg-[#1e1f22] text-[15px]"><Pencil size={18} /> canvas - quadro branco</button>
            </div>

            <div className="bg-gradient-to-br from-[#7c3aed]/30 to-[#050507] border border-[#7c3aed]/40 rounded-xl p-3 mt-4 shadow-[0_0_20px_rgba(124,58,237,0.15)]">
              <div className="flex items-center gap-2 text-sm font-bold"><Music size={16} className="text-[#7c3aed]" /> Listening Party</div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 bg-[#7c3aed] rounded flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">🎧</div>
                <div className="flex-1"><div className="text-xs font-medium">Blinding Lights</div><div className="text-[11px] text-[#8a8a8e]">3 ouvindo agora</div></div>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all">{isPlaying ? <Pause size={14} /> : <Play size={14} />}</button>
              </div>
            </div>
          </div>

          <div className="h-[52px] bg-[#08080a] px-2 flex items-center gap-2 border-t border-[#1a1a1f]">
            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center font-bold shadow-[0_0_10px_rgba(124,58,237,0.6)]">W</div>
            <div className="flex-1"><div className="text-sm font-bold">W3scley</div><div className="text-[11px] text-[#a78bfa]">● Online</div></div>
            <Mic size={18} className="text-[#8a8a8e] hover:text-[#7c3aed] cursor-pointer" /><Headphones size={18} className="text-[#8a8a8e] hover:text-[#7c3aed] cursor-pointer" /><Settings size={18} className="text-[#8a8a8e] hover:text-[#7c3aed] cursor-pointer" />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-[#0f0f12]">
        <div className="h-[48px] bg-[#0f0f12] border-b border-[#1f1f23] flex items-center px-4 gap-4 shadow-[0_1px_20px_rgba(124,58,237,0.1)]">
          <Hash size={20} className="text-[#7c3aed]" />
          <span className="font-bold">{channels.find(c => c.id === selectedChannel)?.name}</span>
          <div className="w-[1px] h-6 bg-[#3f4147] mx-2" />
          <span className="text-sm text-[#8a8a8e] hidden md:block">Canal com super-poderes do Nexus</span>
          <div className="ml-auto flex items-center gap-3">
            {isScreenSharing && <button onClick={stopScreenShare} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-medium flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)]"><ScreenShare size={14} /> Parar Tela</button>}
            {!isScreenSharing && <button onClick={startScreenShare} className="bg-[#1a1a1f] hover:bg-[#7c3aed] border border-[#7c3aed]/30 px-3 py-1 rounded text-sm font-medium flex items-center gap-1.5 transition-all"><ScreenShare size={14} /> Tela</button>}
            <button onClick={() => setShowRecap(!showRecap)} className="bg-[#7c3aed] hover:bg-[#6d28d9] px-3 py-1 rounded text-sm font-medium flex items-center gap-1.5 shadow-[0_0_15px_rgba(124,58,237,0.5)]"><Sparkles size={14} /> AI Recap</button>
            <button onClick={() => setFocusMode(!focusMode)} className="p-1.5 hover:bg-[#1a1a1f] rounded"><Layout size={18} /></button>
          </div>
        </div>

        {isScreenSharing && (
          <div className="bg-black p-2 border-b border-[#7c3aed]/30 shadow-[inset_0_0_30px_rgba(124,58,237,0.1)]">
            <video ref={screenVideoRef} autoPlay playsInline muted className="w-full max-h-[350px] rounded-lg bg-black border border-[#7c3aed]/30" />
            <div className="text-center text-xs text-[#a78bfa] mt-1">Você está compartilhando sua tela - todo mundo vendo com efeito neon roxo</div>
          </div>
        )}

        {showRecap && (
          <div className="bg-[#141417] border-b border-[#7c3aed]/20 p-4">
            <div className="flex justify-between items-center mb-2"><h3 className="font-bold flex items-center gap-2"><Sparkles size={16} className="text-[#7c3aed]" /> Resumo por IA - 12 mensagens não lidas</h3><button onClick={() => setShowRecap(false)}><X size={16} /></button></div>
            <div className="text-sm text-[#b5bac1] space-y-1">
              <p>• Vocês discutiram o lançamento do MVP do Nexus</p>
              <p>• 3 tarefas criadas, 1 concluída. Pendente: voz com transcrição e deploy</p>
              <p>• Ana compartilhou um snippet de código e uma enquete sobre features</p>
              <p>• Listening party proposta para hoje às 20h</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#101012]">
          {messages.map(m => (
            <div key={m.id} className="flex gap-3 group hover:bg-[#1a1a1f]/50 -mx-4 px-4 py-1.5 rounded transition-colors">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.3)]" style={{ background: m.color }}>{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2"><span className="font-medium text-[15px]">{m.user}</span><span className="text-[11px] text-[#6a6a70]">{m.time}</span>
                  <button onClick={() => toggleTranslate(m.id)} className="ml-2 opacity-0 group-hover:opacity-100 text-[11px] bg-[#1a1a1f] border border-[#7c3aed]/20 px-1.5 py-0.5 rounded flex items-center gap-1 hover:border-[#7c3aed]/50"><Languages size={10} /> traduzir</button>
                </div>
                {m.text && <div className="text-[15px] text-[#dcddde] leading-[22px] whitespace-pre-wrap break-words">{m.text}</div>}
                {m.translated && <div className="mt-1 text-[13px] bg-[#7c3aed]/10 border border-[#7c3aed]/30 rounded px-2 py-1 text-[#c4b5fd]">{m.translated}</div>}
                {m.type === 'task' && (
                  <div className="mt-2 bg-[#1a1a1f] border border-[#7c3aed]/20 rounded-lg p-3 max-w-[400px]">
                    <div className="flex items-center gap-2 font-bold text-sm mb-2"><CheckSquare size={16} className="text-[#7c3aed]" /> {m.data.title}</div>
                    {m.data.tasks.map((t: any, i: number) => (<div key={i} className="flex items-center gap-2 text-sm text-[#b5bac1]"><input type="checkbox" checked={t.done} readOnly className="accent-[#7c3aed]" /> <span className={t.done ? 'line-through opacity-60' : ''}>{t.t}</span></div>))}
                  </div>
                )}
                {m.type === 'poll' && (
                  <div className="mt-2 bg-[#1a1a1f] border border-[#7c3aed]/20 rounded-lg p-3 max-w-[400px]">
                    <div className="font-bold text-sm mb-2 flex gap-2"><BarChart3 size={16} className="text-[#7c3aed]" /> {m.data.q}</div>
                    {m.data.options.map((o: any, i: number) => (<div key={i} className="mb-1"><div className="flex justify-between text-xs text-[#b5bac1]"><span>{o.o}</span><span>{o.v} votos</span></div><div className="h-1.5 bg-[#0a0a0a] rounded-full mt-1"><div className="h-full bg-[#7c3aed] rounded-full shadow-[0_0_8px_rgba(124,58,237,0.6)]" style={{ width: `${(o.v/20)*100}%` }} /></div></div>))}
                  </div>
                )}
                {m.type === 'code' && (
                  <div className="mt-2 bg-[#08080a] rounded-lg overflow-hidden max-w-[500px] border border-[#7c3aed]/20">
                    <div className="flex justify-between px-3 py-1.5 bg-[#1a1a1f] text-xs"><span className="flex gap-2 items-center"><Code2 size={12} className="text-[#7c3aed]" /> {m.data.lang}</span><button className="bg-[#7c3aed] text-white px-2 py-0.5 rounded text-[11px] shadow-[0_0_10px_rgba(124,58,237,0.4)]">▶ Run</button></div>
                    <pre className="p-3 text-sm text-[#b5bac1] font-mono">{m.text}</pre>
                    <div className="px-3 py-1.5 bg-[#050507] text-xs text-[#a78bfa] border-t border-[#7c3aed]/10">↳ {m.data.output}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 pt-2 bg-[#0f0f12] border-t border-[#1a1a1f]">
          <div className="bg-[#1a1a1f] rounded-lg border border-[#2a2a30] focus-within:border-[#7c3aed]/50 focus-within:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all">
            <div className="min-h-[44px] flex items-center px-3 gap-3">
              <button className="w-7 h-7 bg-[#2a2a30] hover:bg-[#7c3aed] rounded-full flex items-center justify-center text-[#8a8a8e] hover:text-white transition-all"><Plus size={16} /></button>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={`Conversar em #${channels.find(c=>c.id===selectedChannel)?.name} — digite / para comandos`} className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[#5a5a60]" />
              <div className="flex gap-3 text-[#5a5a60]"><Gift size={20} className="hover:text-[#7c3aed] cursor-pointer" /><Sticker size={20} className="hover:text-[#7c3aed] cursor-pointer" /><Smile size={20} className="hover:text-[#7c3aed] cursor-pointer" /></div>
              <button onClick={handleSend} className="bg-[#7c3aed] hover:bg-[#6d28d9] p-2 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all"><Send size={16} /></button>
            </div>
            <div className="px-3 pb-2 flex gap-2 text-[11px] text-[#5a5a60]"><span>Comandos:</span><code className="bg-[#0f0f12] px-1 rounded border border-[#1a1a1f]">/task criar tarefa</code><code className="bg-[#0f0f12] px-1 rounded border border-[#1a1a1f]">/poll enquete</code><code className="bg-[#0f0f12] px-1 rounded border border-[#1a1a1f]">/code</code><code className="bg-[#0f0f12] px-1 rounded border border-[#1a1a1f]">/event</code></div>
          </div>
        </div>
      </div>

      {!focusMode && (
        <div className="w-[240px] bg-[#08080a] hidden lg:flex flex-col border-l border-[#1a1a1f]">
          <div className="p-3">
            <h3 className="text-xs font-bold text-[#6a6a70] mb-2 tracking-wider">ONLINE — 4</h3>
            <div className="space-y-2">
              {[{ n: 'W3scley', s: 'Codando Nexus', c: '#7c3aed' }, { n: 'Ana Dev', s: 'No VS Code', c: '#06b6d4' }, { n: 'Lucas', s: 'Ouvindo música', c: '#f43f5e' }, { n: 'Sophia', s: 'No canvas', c: '#10b981' }].map(u => (
                <div key={u.n} className="flex items-center gap-2 hover:bg-[#1a1a1f] p-1 rounded transition-colors cursor-pointer"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(124,58,237,0.2)]" style={{ background: u.c }}>{u.n[0]}</div><div><div className="text-sm">{u.n}</div><div className="text-[11px] text-[#6a6a70]">{u.s}</div></div></div>
              ))}
            </div>
          </div>
          <div className="mt-auto p-3 border-t border-[#1a1a1f]">
            <div className="text-xs text-[#6a6a70]">NEXUS v1.0 • Melhor que Discord</div>
            <div className="flex gap-2 mt-2"><span className="text-[10px] bg-[#7c3aed] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.4)]">AI Recap</span><span className="text-[10px] bg-[#1a1a1f] border border-[#7c3aed]/20 px-2 py-0.5 rounded-full">Canvas</span><span className="text-[10px] bg-[#1a1a1f] border border-[#06b6d4]/20 px-2 py-0.5 rounded-full">Tradução</span></div>
          </div>
        </div>
      )}

      {showCanvas && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col backdrop-blur-sm">
          <div className="h-[48px] bg-[#08080a] border-b border-[#7c3aed]/20 flex items-center px-4 justify-between"><span className="font-bold flex gap-2 items-center"><Pencil size={16} className="text-[#7c3aed]" /> Canvas Colaborativo — #canvas</span><div className="flex gap-2"><button className="bg-[#1a1a1f] border border-[#2a2a30] px-3 py-1 rounded text-sm hover:border-[#7c3aed]/30">Limpar</button><button onClick={() => setShowCanvas(false)} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3 py-1 rounded text-sm font-bold shadow-[0_0_15px_rgba(124,58,237,0.4)]">Fechar</button></div></div>
          <canvas ref={canvasRef} width={1200} height={700} className="flex-1 bg-[#050507] cursor-crosshair" />
          <div className="h-10 bg-[#08080a] border-t border-[#7c3aed]/20 flex items-center justify-center text-xs text-[#6a6a70]">Desenhe com o mouse — todos na call veem em tempo real com brilho neon</div>
        </div>
      )}
    </div>
  );
}
