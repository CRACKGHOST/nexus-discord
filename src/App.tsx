import { useState, useRef, useEffect } from 'react';
import { Hash, Volume2, Users, Sparkles, Languages, Layout, CheckSquare, BarChart3, Calendar, Code2, Music, Mic, Headphones, Settings, Plus, Video, ScreenShare, Pencil, X, Send, Smile, Gift, Sticker, Search, Inbox, HelpCircle, Play, Pause } from 'lucide-react';

type Message = { id: number; user: string; avatar: string; color: string; text: string; time: string; type?: 'task'|'poll'|'event'|'code'|'music'; data?: any; translated?: string; }
type Server = { id: string; name: string; icon: string; color: string; }
type Channel = { id: string; name: string; type: 'text'|'voice'|'canvas'; unread?: number; }

const servers: Server[] = [
  { id: '1', name: 'Nexus HQ', icon: 'N', color: 'bg-[#7c3aed]' },
  { id: '2', name: 'Dev Squad', icon: 'D', color: 'bg-[#06b6d4]' },
  { id: '3', name: 'Design Club', icon: '🎨', color: 'bg-[#f43f5e]' },
];

const channels: Channel[] = [
  { id: '1', name: 'geral', type: 'text', unread: 3 },
  { id: '2', name: 'dev', type: 'text' },
  { id: '3', name: 'design', type: 'text' },
  { id: '4', name: 'voz-geral', type: 'voice' },
  { id: '5', name: 'canvas', type: 'canvas' },
  { id: '6', name: 'eventos', type: 'text' },
];

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showCanvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#7c3aed';
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
    setMessages([...messages, { id: Date.now(), user: 'W3scley', avatar: 'W', color: '#7c3aed', text: input.replace(/^\/(task|poll|code|event)\s*/, ''), type, data, time: new Date().toLocaleTimeString().slice(0,5) }]);
    setInput('');
  };

  const toggleTranslate = (id: number) => {
    setMessages(messages.map(m => m.id === id ? { ...m, translated: m.translated ? undefined : `Traduzido: ${m.text} [PT-BR]` } : m));
  };

  return (
    <div className="flex h-screen bg-[#0f0f12] text-white font-[Inter] overflow-hidden">
      {/* Servers */}
      {!focusMode && (
        <div className="w-[72px] bg-[#0a0a0d] flex flex-col items-center py-3 gap-2 border-r border-[#1a1a1f]">
          {servers.map(s => (
            <button key={s.id} onClick={() => setSelectedServer(s.id)} className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] flex items-center justify-center font-bold transition-all ${s.color} ${selectedServer === s.id ? 'rounded-[16px] ring-2 ring-white' : ''}`}>{s.icon}</button>
          ))}
          <button className="w-12 h-12 rounded-[24px] bg-[#1a1a1f] hover:bg-[#22c55e] hover:rounded-[16px] flex items-center justify-center transition-all"><Plus size={24} /></button>
        </div>
      )}

      {/* Channels */}
      {!focusMode && (
        <div className="w-[240px] bg-[#141417] flex flex-col">
          <div className="h-[48px] px-4 flex items-center font-bold border-b border-[#1f1f23] shadow-sm">Nexus HQ <span className="ml-auto">⌄</span></div>
          <div className="p-2 flex-1 overflow-y-auto space-y-4">
            <div>
              <p className="text-[11px] text-[#8a8a8e] font-bold tracking-wider px-2 mb-1">CANAIS DE TEXTO</p>
              {channels.filter(c => c.type === 'text').map(c => (
                <button key={c.id} onClick={() => setSelectedChannel(c.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[15px] ${selectedChannel === c.id ? 'bg-[#2b2d31] text-white' : 'text-[#949ba4] hover:bg-[#1e1f22] hover:text-[#dcddde]'}`}>
                  <Hash size={18} /> {c.name} {c.unread && <span className="ml-auto bg-[#f23f43] text-white text-[10px] px-1.5 py-0.5 rounded-full">{c.unread}</span>}
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
              <div className="mt-2 ml-2 bg-[#232428] rounded-lg p-2">
                <div className="flex items-center gap-2 text-xs text-[#06b6d4]"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Ao vivo: "vamos subir o deploy hoje?"</div>
                <div className="text-[11px] text-[#8a8a8e] mt-1">Transcrição em tempo real ativa</div>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-[#8a8a8e] font-bold tracking-wider px-2 mb-1">EXTRAS NEXUS</p>
              <button onClick={() => setShowCanvas(true)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[#949ba4] hover:bg-[#1e1f22] text-[15px]"><Pencil size={18} /> canvas - quadro branco</button>
            </div>

            {/* Music Player */}
            <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/30 rounded-xl p-3 mt-4">
              <div className="flex items-center gap-2 text-sm font-bold"><Music size={16} className="text-[#7c3aed]" /> Listening Party</div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 bg-[#7c3aed] rounded flex items-center justify-center">🎧</div>
                <div className="flex-1"><div className="text-xs font-medium">Blinding Lights</div><div className="text-[11px] text-[#8a8a8e]">3 ouvindo agora</div></div>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black">{isPlaying ? <Pause size={14} /> : <Play size={14} />}</button>
              </div>
            </div>
          </div>

          <div className="h-[52px] bg-[#0f0f12] px-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center font-bold">W</div>
            <div className="flex-1"><div className="text-sm font-bold">W3scley</div><div className="text-[11px] text-[#23a559]">● Online</div></div>
            <Mic size={18} className="text-[#8a8a8e]" /><Headphones size={18} className="text-[#8a8a8e]" /><Settings size={18} className="text-[#8a8a8e]" />
          </div>
        </div>
      )}

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-[#313338]">
        {/* Top bar */}
        <div className="h-[48px] bg-[#313338] border-b border-[#1f1f23] flex items-center px-4 gap-4 shadow-sm">
          <Hash size={20} className="text-[#80848e]" />
          <span className="font-bold">{channels.find(c => c.id === selectedChannel)?.name}</span>
          <div className="w-[1px] h-6 bg-[#3f4147] mx-2" />
          <span className="text-sm text-[#b5bac1] hidden md:block">Canal com super-poderes do Nexus</span>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setShowRecap(!showRecap)} className="bg-[#7c3aed] hover:bg-[#6d28d9] px-3 py-1 rounded text-sm font-medium flex items-center gap-1.5"><Sparkles size={14} /> AI Recap</button>
            <button onClick={() => setFocusMode(!focusMode)} className="p-1.5 hover:bg-[#3f4147] rounded"><Layout size={18} /></button>
            <Search size={18} className="text-[#b5bac1]" /><Inbox size={18} className="text-[#b5bac1]" /><HelpCircle size={18} className="text-[#b5bac1]" />
          </div>
        </div>

        {/* Recap */}
        {showRecap && (
          <div className="bg-[#2b2d31] border-b border-[#1f1f23] p-4 animate-in">
            <div className="flex justify-between items-center mb-2"><h3 className="font-bold flex items-center gap-2"><Sparkles size={16} className="text-[#7c3aed]" /> Resumo por IA - 12 mensagens não lidas</h3><button onClick={() => setShowRecap(false)}><X size={16} /></button></div>
            <div className="text-sm text-[#b5bac1] space-y-1">
              <p>• Vocês discutiram o lançamento do MVP do Nexus</p>
              <p>• 3 tarefas criadas, 1 concluída. Pendente: voz com transcrição e deploy</p>
              <p>• Ana compartilhou um snippet de código e uma enquete sobre features</p>
              <p>• Listening party proposta para hoje às 20h</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className="flex gap-3 group hover:bg-[#2e3035] -mx-4 px-4 py-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ background: m.color }}>{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2"><span className="font-medium text-[15px]">{m.user}</span><span className="text-[11px] text-[#949ba4]">{m.time}</span>
                  <button onClick={() => toggleTranslate(m.id)} className="ml-2 opacity-0 group-hover:opacity-100 text-[11px] bg-[#2b2d31] px-1.5 py-0.5 rounded flex items-center gap-1"><Languages size={10} /> traduzir</button>
                </div>
                {m.text && <div className="text-[15px] text-[#dcddde] leading-[22px] whitespace-pre-wrap break-words">{m.text}</div>}
                {m.translated && <div className="mt-1 text-[13px] bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded px-2 py-1 text-[#c4b5fd]">{m.translated}</div>}

                {m.type === 'task' && (
                  <div className="mt-2 bg-[#2b2d31] border border-[#1f1f23] rounded-lg p-3 max-w-[400px]">
                    <div className="flex items-center gap-2 font-bold text-sm mb-2"><CheckSquare size={16} className="text-[#23a559]" /> {m.data.title}</div>
                    {m.data.tasks.map((t: any, i: number) => (<div key={i} className="flex items-center gap-2 text-sm text-[#b5bac1]"><input type="checkbox" checked={t.done} readOnly /> <span className={t.done ? 'line-through opacity-60' : ''}>{t.t}</span></div>))}
                  </div>
                )}
                {m.type === 'poll' && (
                  <div className="mt-2 bg-[#2b2d31] border border-[#1f1f23] rounded-lg p-3 max-w-[400px]">
                    <div className="font-bold text-sm mb-2 flex gap-2"><BarChart3 size={16} /> {m.data.q}</div>
                    {m.data.options.map((o: any, i: number) => (<div key={i} className="mb-1"><div className="flex justify-between text-xs text-[#b5bac1]"><span>{o.o}</span><span>{o.v} votos</span></div><div className="h-1.5 bg-[#1e1f22] rounded-full mt-1"><div className="h-full bg-[#7c3aed] rounded-full" style={{ width: `${(o.v/20)*100}%` }} /></div></div>))}
                  </div>
                )}
                {m.type === 'code' && (
                  <div className="mt-2 bg-[#1e1f22] rounded-lg overflow-hidden max-w-[500px] border border-[#1f1f23]">
                    <div className="flex justify-between px-3 py-1.5 bg-[#2b2d31] text-xs"><span className="flex gap-2 items-center"><Code2 size={12} /> {m.data.lang}</span><button className="bg-[#23a559] text-white px-2 py-0.5 rounded text-[11px]">▶ Run</button></div>
                    <pre className="p-3 text-sm text-[#b5bac1] font-mono">{m.text}</pre>
                    <div className="px-3 py-1.5 bg-[#0f0f12] text-xs text-[#23a559]">↳ {m.data.output}</div>
                  </div>
                )}
                {m.type === 'event' && (
                  <div className="mt-2 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg p-3 max-w-[350px] text-white"><div className="flex gap-2 items-center font-bold"><Calendar size={16} /> {m.data.title}</div><div className="text-xs opacity-90 mt-1">{m.data.date} • 5 confirmados</div><button className="mt-2 bg-white text-black text-xs px-3 py-1 rounded-full font-bold">Participar</button></div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 pt-0">
          <div className="bg-[#383a40] rounded-lg">
            <div className="min-h-[44px] flex items-center px-3 gap-3">
              <button className="w-7 h-7 bg-[#b5bac1] rounded-full flex items-center justify-center text-[#383a40]"><Plus size={16} /></button>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={`Conversar em #${channels.find(c=>c.id===selectedChannel)?.name} — digite / para comandos`} className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[#6d6f78]" />
              <div className="flex gap-3 text-[#b5bac1]"><Gift size={20} /><Sticker size={20} /><Smile size={20} /></div>
              <button onClick={handleSend} className="bg-[#7c3aed] hover:bg-[#6d28d9] p-2 rounded-full"><Send size={16} /></button>
            </div>
            <div className="px-3 pb-2 flex gap-2 text-[11px] text-[#6d6f78]"><span>Comandos:</span><code className="bg-[#2b2d31] px-1 rounded">/task criar tarefa</code><code className="bg-[#2b2d31] px-1 rounded">/poll enquete</code><code className="bg-[#2b2d31] px-1 rounded">/code</code><code className="bg-[#2b2d31] px-1 rounded">/event</code></div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {!focusMode && (
        <div className="w-[240px] bg-[#232428] hidden lg:flex flex-col">
          <div className="p-3">
            <h3 className="text-xs font-bold text-[#8a8a8e] mb-2">ONLINE — 4</h3>
            <div className="space-y-2">
              {[{ n: 'W3scley', s: 'Codando Nexus', c: '#7c3aed' }, { n: 'Ana Dev', s: 'No VS Code', c: '#06b6d4' }, { n: 'Lucas', s: 'Ouvindo música', c: '#f43f5e' }, { n: 'Sophia', s: 'No canvas', c: '#10b981' }].map(u => (
                <div key={u.n} className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: u.c }}>{u.n[0]}</div><div><div className="text-sm">{u.n}</div><div className="text-[11px] text-[#8a8a8e]">{u.s}</div></div></div>
              ))}
            </div>
          </div>
          <div className="mt-auto p-3 border-t border-[#1f1f23]">
            <div className="text-xs text-[#8a8a8e]">NEXUS v1.0 • Melhor que Discord</div>
            <div className="flex gap-2 mt-2"><span className="text-[10px] bg-[#7c3aed] px-2 py-0.5 rounded-full">AI Recap</span><span className="text-[10px] bg-[#06b6d4] px-2 py-0.5 rounded-full text-black">Canvas</span><span className="text-[10px] bg-[#23a559] px-2 py-0.5 rounded-full">Tradução</span></div>
          </div>
        </div>
      )}

      {/* Canvas Modal */}
      {showCanvas && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <div className="h-[48px] bg-[#1a1a1f] flex items-center px-4 justify-between"><span className="font-bold flex gap-2 items-center"><Pencil size={16} /> Canvas Colaborativo — #canvas</span><div className="flex gap-2"><button className="bg-[#2b2d31] px-3 py-1 rounded text-sm">Limpar</button><button onClick={() => setShowCanvas(false)} className="bg-white text-black px-3 py-1 rounded text-sm font-bold">Fechar</button></div></div>
          <canvas ref={canvasRef} width={1200} height={700} className="flex-1 bg-[#0f0f12] cursor-crosshair" />
          <div className="h-10 bg-[#1a1a1f] flex items-center justify-center text-xs text-[#8a8a8e]">Desenhe com o mouse — todos na call veem em tempo real (Discord não tem isso!)</div>
        </div>
      )}
    </div>
  );
}
