
import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

type User = { id:string, name:string, avatar:string, banner:string, password:string, bio:string }
type Group = { id:string, name:string, ownerId:string, icon:string, color:string, logo?:string }
type Channel = { id:string, name:string, type:'text'|'voice', groupId:string, photo?:string, createdBy?:string }
type FriendRequest = { id:string, name:string, status:'pending'|'accepted'|'blocked', avatar:string, mutual?:number, isIncoming?:boolean, raw?:any }

export default function App(){
  const [users,setUsers]=useState<User[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-users')||'[]') }catch{ return [] } })
  const [currentUser,setCurrentUser]=useState<User|null>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-current')||'null') }catch{ return null } })
  const [groups,setGroups]=useState<Group[]>(()=>{ try{ const s=localStorage.getItem('nexus-groups'); if(s) return JSON.parse(s); return [{id:'1', name:'teste', ownerId:'', icon:'T', color:'#7c3aed', logo:''}] }catch{ return [{id:'1', name:'teste', ownerId:'', icon:'T', color:'#7c3aed', logo:''}] } })
  const [channels,setChannels]=useState<Channel[]>(()=>{ try{ const s=localStorage.getItem('nexus-channels'); if(s) return JSON.parse(s); return [{id:'1', name:'geral', type:'text', groupId:'1', photo:'', createdBy:''},{id:'v1', name:'Geral', type:'voice', groupId:'1', photo:'', createdBy:''}] }catch{ return [{id:'1', name:'geral', type:'text', groupId:'1', photo:'', createdBy:''},{id:'v1', name:'Geral', type:'voice', groupId:'1', photo:'', createdBy:''}] } })
  const [msgs,setMsgs]=useState<any[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-msgs')||'[]') }catch{ return [] } })
  const [activeGroup,setActiveGroup]=useState('1')
  const [activeChannel,setActiveChannel]=useState('1')
  const [input,setInput]=useState('')
  const [regName,setRegName]=useState(''); const [regPass,setRegPass]=useState('')
  const [authMode,setAuthMode]=useState<'login'|'register'>('login')
  const [showCreateGroup,setShowCreateGroup]=useState(false)
  const [newGroupName,setNewGroupName]=useState('')
  const [addFriendName,setAddFriendName]=useState('')
  const [addFriendStatus,setAddFriendStatus]=useState<'idle'|'success'|'error'|'already'|'self'>('idle')
  const [addFriendMsg,setAddFriendMsg]=useState('')
  const [friends,setFriends]=useState<string[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-friends')||'[]') }catch{ return [] } })
  const [friendRequests,setFriendRequests]=useState<FriendRequest[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-requests')||'[]') }catch{ return [] } })
  const [friendsTab,setFriendsTab]=useState<'online'|'all'|'pending'|'blocked'|'add'>('online')
  const [showGroupMenu,setShowGroupMenu]=useState(false)
  const [showChannelConfig,setShowChannelConfig]=useState<Channel|null>(null)
  const [editChannelName,setEditChannelName]=useState('')
  const [editChannelPhoto,setEditChannelPhoto]=useState('')
  const [inVoice,setInVoice]=useState<string|null>(null)
  const [micLevel,setMicLevel]=useState(0)
  const [voiceTime,setVoiceTime]=useState(0)
  const [isTestingMic,setIsTestingMic]=useState(false)
  const [micDevices,setMicDevices]=useState<MediaDeviceInfo[]>([])
  const [selectedMic,setSelectedMic]=useState(()=>localStorage.getItem('nexus-micId')||'')
  const [selectedOutput,setSelectedOutput]=useState(()=>localStorage.getItem('nexus-outId')||'')
  const [inputVolume,setInputVolume]=useState(()=>Number(localStorage.getItem('nexus-inputVol')||'100'))
  const [outputVolume,setOutputVolume]=useState(()=>Number(localStorage.getItem('nexus-outputVol')||'100'))
  const [noiseSuppression,setNoiseSuppression]=useState(()=>localStorage.getItem('nexus-noise')!=='false')
  const [echoCancellation,setEchoCancellation]=useState(()=>localStorage.getItem('nexus-echo')!=='false')
  const [showSettings,setShowSettings]=useState(false)
  const [settingsTab,setSettingsTab]=useState('voz')
  const [themeColor,setThemeColor]=useState(()=>localStorage.getItem('nexus-theme')||'#7c3aed')
  const [logoImage,setLogoImage]=useState(()=>localStorage.getItem('nexus-logo')||'')
  const [showFriendsPage,setShowFriendsPage]=useState(false)
  const endRef=useRef<HTMLDivElement>(null)
  const micRef=useRef<MediaStream|null>(null)
  const audioRef=useRef<HTMLAudioElement>(null)
  const screenRef=useRef<MediaStream|null>(null)
  const screenVideoRef=useRef<HTMLVideoElement>(null)
  const avatarInputRef=useRef<HTMLInputElement>(null)
  const logoInputRef=useRef<HTMLInputElement>(null)
  const channelPhotoInputRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{ document.title="NEXUS" },[])
  useEffect(()=>{ try{ localStorage.setItem('nexus-users',JSON.stringify(users)) }catch{} },[users])
  useEffect(()=>{ try{ localStorage.setItem('nexus-current',JSON.stringify(currentUser)) }catch{} },[currentUser])
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) },[msgs])

  const send=()=>{ if(!input.trim()) return; setMsgs([...msgs,{id:Date.now(),user:currentUser!.name,text:input,groupId:activeChannel,avatar:currentUser!.avatar,time:new Date().toLocaleTimeString()}]); setInput('') }

  // DISCORD 100% - IP + GLOBAL - CORRIGIDO
  const loadFriendsGlobal = async (userName:string) => {
    if(!supabase || !userName) return
    try{
      const { data: d1 } = await supabase.from('nexus_friends').select('*').eq('owner_name', userName)
      const { data: d2 } = await supabase.from('nexus_friends').select('*').eq('friend_name', userName)
      const data = [...(d1||[]), ...(d2||[])]
      if(data.length>0){
        const accepted = data.filter((f:any)=>f.status==='accepted').map((f:any)=> f.owner_name===userName ? f.friend_name : f.owner_name)
        setFriends([...new Set(accepted)] as any)
        const pending = data.filter((f:any)=>f.status==='pending').map((f:any)=>{
          const other = f.owner_name===userName ? f.friend_name : f.owner_name
          const isIncoming = f.friend_name===userName
          return { id: f.id, name: other, status: f.status as any, avatar: other[0].toUpperCase(), mutual: 1, isIncoming, raw: f }
        })
        setFriendRequests(pending)
      }
    }catch(e){ console.log(e) }
  }
  useEffect(()=>{ if(currentUser?.name) loadFriendsGlobal(currentUser.name); const iv=setInterval(()=>{ if(currentUser?.name) loadFriendsGlobal(currentUser.name) },3000); return()=>clearInterval(iv) },[currentUser?.name])

  const handleAddFriendDiscord = async () => {
    const raw = addFriendName.trim()
    if(!raw){ setAddFriendStatus('error'); setAddFriendMsg('Digite um nome de usuário NEXUS.'); return }
    const name = raw.replace('@','').split('#')[0].trim()
    if(name.toLowerCase()===currentUser?.name.toLowerCase()){ setAddFriendStatus('self'); setAddFriendMsg('Você não pode adicionar a si mesmo!'); return }
    if(friends.some(f=>f.toLowerCase()===name.toLowerCase())){ setAddFriendStatus('already'); setAddFriendMsg('Vocês já são amigos!'); return }
    let exists=false
    if(users.some(u=>u.name.toLowerCase()===name.toLowerCase())) exists=true
    if(supabase && !exists){
      try{
        const { data } = await supabase.from('nexus_users').select('name').ilike('name', name).limit(1)
        if(data && data.length>0) exists=true
        if(!exists){
          const { data: all } = await supabase.from('nexus_users').select('name').limit(200)
          if(all && all.some((u:any)=>u.name.toLowerCase()===name.toLowerCase())) exists=true
        }
      }catch{}
    }
    if(!exists){ setAddFriendStatus('error'); setAddFriendMsg(`Usuário "${name}" não existe! Ele precisa criar conta primeiro no seu link. Conta salva no IP do PC dele.`); return }
    if(supabase){
      try{
        const { data: a } = await supabase.from('nexus_friends').select('*').eq('owner_name', currentUser!.name).eq('friend_name', name)
        const { data: b } = await supabase.from('nexus_friends').select('*').eq('owner_name', name).eq('friend_name', currentUser!.name)
        const all=[...(a||[]), ...(b||[])]
        if(all.length>0){ setAddFriendStatus('already'); setAddFriendMsg(all.some((f:any)=>f.status==='accepted')?'Já são amigos!':'Pedido já enviado! Aguardando.'); return }
      }catch{}
    }
    const id=Date.now().toString()
    if(supabase){ try{ await supabase.from('nexus_friends').insert({ id, owner_name: currentUser!.name, friend_name: name, status: 'pending' }) }catch(e:any){ setAddFriendStatus('error'); setAddFriendMsg('Erro: '+e.message); return } }
    setAddFriendStatus('success'); setAddFriendMsg(`Sucesso! Pedido enviado para ${name}! Ele recebe em até 3s!`); setAddFriendName(''); setTimeout(()=>{ setFriendsTab('pending'); loadFriendsGlobal(currentUser!.name) },600)
  }

  const acceptFriend = async (id:string) => {
    const req = friendRequests.find(r=>r.id===id); if(!req) return
    if(supabase){ try{ await supabase.from('nexus_friends').update({ status: 'accepted' }).eq('id', id) }catch{} }
    if(!friends.includes(req.name)) setFriends([...friends, req.name])
    setFriendRequests(friendRequests.filter(r=>r.id!==id))
  }
  const rejectFriend = async (id:string) => { if(supabase){ try{ await supabase.from('nexus_friends').delete().eq('id', id) }catch{} } setFriendRequests(friendRequests.filter(r=>r.id!==id)) }

  const themeColors=[{name:'NEXUS Roxo', color:'#7c3aed'},{name:'Discord', color:'#5865F2'}]

  if(!currentUser){
    return(
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="bg-[#1e1f22] p-8 rounded-xl w-96 border border-[#7c3aed]/30">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-black" style={{background:themeColor}}>N</div>
          <h1 className="text-center font-black text-2xl mt-4">NEXUS</h1>
          <p className="text-center text-[#b5bac1] text-xs mt-1">Criação igual Discord - salvo no IP do seu PC + global</p>
          <div className="space-y-3 mt-6">
            <input value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Usuário (ex: primata)" className="w-full bg-[#2b2d31] p-2.5 rounded-full outline-none"/>
            <input value={regPass} onChange={e=>setRegPass(e.target.value)} type="password" placeholder="Senha" className="w-full bg-[#2b2d31] p-2.5 rounded-full outline-none"/>
            <button onClick={async()=>{
              if(authMode==='register'){
                if(!regName||!regPass) return alert('Preencha usuário e senha');
                if(users.find(u=>u.name.toLowerCase()===regName.toLowerCase())) return alert('Esse nome já existe nesse IP!');
                const id=Date.now().toString()
                const u={id,name:regName,avatar:regName[0].toUpperCase(),banner:themeColor,password:regPass,bio:''} as any
                setUsers([...users,u]); setCurrentUser(u)
                if(supabase){ try{ await supabase.from('nexus_users').insert({ id, name: regName, password: regPass, avatar: regName[0].toUpperCase() }) }catch(e){ console.log(e) } }
              }else{
                if(supabase){
                  try{
                    const { data } = await supabase.from('nexus_users').select('*').ilike('name', regName).eq('password', regPass).maybeSingle()
                    if(data){ setCurrentUser({ id: data.id, name: data.name, avatar: data.avatar||data.name[0].toUpperCase(), banner: themeColor, password: data.password, bio: '' } as any); return }
                  }catch{}
                }
                const u=users.find(u=>u.name.toLowerCase()===regName.toLowerCase()&&u.password===regPass)
                if(!u) return alert('Usuário não existe nesse IP - Crie conta!'); setCurrentUser(u)
              }
            }} className="w-full py-2.5 rounded-full font-bold" style={{background:themeColor}}>{authMode==='register'?'Criar conta - Salvar no IP':'Entrar'}</button>
            <div className="text-center text-[#a78bfa] text-sm cursor-pointer" onClick={()=>setAuthMode(authMode==='login'?'register':'login')}>{authMode==='login'?'Criar conta':'Já tem?'}</div>
            <div className="text-[10px] text-[#6d6f78] text-center">💾 Conta salva no IP do seu PC ({typeof window!=='undefined'?window.location.hostname:'local'}) + global no link</div>
          </div>
        </div>
      </div>
    )
  }

  const filtered=msgs.filter(m=>m.groupId===activeChannel)

  return(
    <div className="flex h-screen bg-[#313338] text-white text-sm overflow-hidden">
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
        <div onClick={()=>{ setShowFriendsPage(true); }} className={`w-12 h-12 rounded-[24px] flex items-center justify-center cursor-pointer ${showFriendsPage?'bg-[#5865F2] rounded-[16px]':'bg-[#313338] hover:bg-[#5865F2] hover:rounded-[16px]'}`}>👥</div>
        <div className="w-8 h-[2px] bg-[#2b2d31] rounded-full my-1"></div>
        {groups.map(g=>(
          <div key={g.id} onClick={()=>{setActiveGroup(g.id); setShowFriendsPage(false)}} className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer bg-[#313338]`} style={{background:g.color||themeColor}}>{g.icon}</div>
        ))}
      </div>

      <div className="w-60 bg-[#2b2d31] flex flex-col">
        <div className="p-2.5"><button className="w-full bg-[#404249] rounded-md px-2.5 py-1.5 text-sm text-left">🔍 Encontrar ou começar conversa</button></div>
        <div className="px-2 space-y-0.5 mt-2">
          <button onClick={()=>setFriendsTab('online')} className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md ${friendsTab!=='add'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c]'}`}><span>👥</span> Amigos</button>
        </div>
        <div className="mt-4 px-2 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-[#b5bac1] uppercase px-2">Mensagens diretas</div>
          <div className="mt-2">
            {friends.map(f=><div key={f} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-[#35373c]"><div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center">{f[0].toUpperCase()}</div><span className="text-sm">{f}</span></div>)}
            {friends.length===0 && <div className="text-xs text-[#6d6f78] px-2 py-2">Nenhum amigo - adicione!</div>}
          </div>
        </div>
        <div className="bg-[#232428] h-14 px-2 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#2b2d31] flex items-center justify-center">{currentUser.avatar}</div><div className="leading-none"><div className="text-sm font-bold">{currentUser.name}</div><div className="text-xs text-[#23a559]">Online • IP salvo</div></div></div>
          <button onClick={()=>{setSettingsTab('conta'); setShowSettings(true)}} className="w-8 h-8 rounded-full hover:bg-[#35373c]">⚙</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#313338]">
        <div className="h-12 border-b border-black/20 flex items-center px-4 gap-4">
          <div className="flex items-center gap-2 font-bold"><span className="w-7 h-7 rounded-full flex items-center justify-center" style={{background:themeColor}}>👥</span> Amigos</div>
          <div className="w-[1px] h-6 bg-[#3f4147] mx-2"></div>
          <div className="flex gap-2">
            <button onClick={()=>setFriendsTab('online')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${friendsTab==='online'?'text-white':'text-[#b5bac1] bg-[#2b2d31]'}`} style={{background:friendsTab==='online'?themeColor:''}}>Disponível</button>
            <button onClick={()=>setFriendsTab('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${friendsTab==='all'?'text-white':'text-[#b5bac1] bg-[#2b2d31]'}`} style={{background:friendsTab==='all'?themeColor:''}}>Todos • {friends.length}</button>
            <button onClick={()=>setFriendsTab('pending')} className={`px-3 py-1.5 rounded-full text-xs font-bold flex gap-1 ${friendsTab==='pending'?'text-white':'text-[#b5bac1] bg-[#2b2d31]'}`} style={{background:friendsTab==='pending'?themeColor:''}}>Pendente {friendRequests.filter(r=>r.status==='pending').length>0 && <span className="bg-[#ed4245] text-white text-[10px] px-1.5 rounded-full">{friendRequests.filter(r=>r.status==='pending').length}</span>}</button>
            <button onClick={()=>setFriendsTab('add')} className={`px-4 py-1.5 rounded-full text-xs font-bold text-white`} style={{background:friendsTab==='add'?'#23a559':themeColor}}>✨ Adicionar amigo</button>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto">
            {friendsTab==='add' ? (
              <div className="max-w-[700px]">
                <h2 className="text-xl font-black">ADICIONAR AMIGO - IGUAL DISCORD 100%</h2>
                <p className="text-sm text-[#b5bac1] mt-1">Você pode adicionar amigos com o nome de usuário do NEXUS. Cada conta salva no IP do seu PC + global!</p>
                <div className={`mt-5 bg-[#2b2d31] border-2 rounded-full p-1.5 flex items-center gap-2 ${addFriendStatus==='error'?'border-[#ed4245]':'border-[#1e1f22]'}`}>
                  <input value={addFriendName} onChange={e=>{setAddFriendName(e.target.value); setAddFriendStatus('idle'); setAddFriendMsg('')}} onKeyDown={e=>e.key==='Enter'&&handleAddFriendDiscord()} placeholder="Nome do NEXUS. Ex: primata" className="flex-1 bg-transparent outline-none text-white placeholder-[#6d6f78] text-sm px-4 py-2"/>
                  <button onClick={handleAddFriendDiscord} className="text-white px-6 py-2.5 rounded-full text-sm font-black" style={{background:themeColor}}>Enviar pedido</button>
                </div>
                {addFriendStatus!=='idle' && addFriendMsg && (
                  <div className={`mt-2 text-sm p-2 rounded ${addFriendStatus==='success'?'text-[#23a559] bg-[#23a559]/10':'text-[#fa777c] bg-[#ed4245]/10'}`}>{addFriendStatus==='success'?'✅ ':'❌ '}{addFriendMsg}</div>
                )}
                <div className="mt-6 p-3 bg-[#2b2d31] rounded-lg">
                  <p className="text-xs font-bold uppercase">Como funciona igual Discord:</p>
                  <ul className="text-xs text-[#b5bac1] mt-2 space-y-1">
                    <li>• Cada conta criada fica salva no IP do seu PC (localStorage) + Supabase global</li>
                    <li>• Digite nome exato: primata, ADM00 - igual Discord</li>
                    <li>• Busca case-insensitive (primata = Primata = PRIMATA)</li>
                    <li>• Pedido chega em Pendente em até 3s!</li>
                  </ul>
                </div>
                <div className="mt-8 border-t border-[#3f4147]/30 pt-8 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl" style={{background:themeColor}}>⚡</div>
                  <p className="text-base font-bold mt-4">NEXUS - 100% Discord!</p>
                </div>
              </div>
            ) : friendsTab==='pending' ? (
              <div>
                <div className="text-xs font-semibold text-[#b5bac1] uppercase mb-4">Pendente — {friendRequests.filter(r=>r.status==='pending').length}</div>
                {friendRequests.filter(r=>r.status==='pending').length===0 ? <div className="text-center mt-20 opacity-20">📭 Nenhum pedido</div> : (
                  <div>
                    {friendRequests.filter(r=>r.status==='pending').map(req=>(
                      <div key={req.id} className="flex items-center justify-between px-2 py-3 hover:bg-[#2e3035] rounded-lg border-t border-[#3f4147]/50">
                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center">{req.avatar}</div><div><div className="text-sm font-medium">{req.name}</div><div className="text-xs text-[#b5bac1]">{req.isIncoming ? 'Pedido de amizade recebido - igual Discord' : 'Pedido enviado'}</div></div></div>
                        <div className="flex gap-2">
                          {req.isIncoming ? (<><button onClick={()=>acceptFriend(req.id)} className="w-8 h-8 rounded-full bg-[#2b2d31] hover:bg-[#23a559]">✓</button><button onClick={()=>rejectFriend(req.id)} className="w-8 h-8 rounded-full bg-[#2b2d31] hover:bg-[#ed4245]">✕</button></>) : <span className="text-xs text-[#6d6f78]">Aguardando...</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="text-xs font-semibold text-[#b5bac1] uppercase mb-4">{friendsTab==='online'?'Online':'Todos'} — {friends.length}</div>
                {friends.length===0 ? <div className="text-center mt-20 opacity-20">👻 Ninguém - adicione amigos!</div> : friends.map(f=><div key={f} className="flex items-center gap-3 px-2 py-2 hover:bg-[#2e3035] rounded-lg"><div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center">{f[0].toUpperCase()}</div><span>{f} • IP salvo</span></div>)}
              </div>
            )}
          </div>
          <div className="w-60 border-l border-[#3f4147] bg-[#2b2d31] p-4 hidden lg:block">
            <h3 className="text-sm font-bold">Ativo agora</h3>
            <div className="mt-4 text-xs text-[#b5bac1] text-center py-8">
              <p className="font-medium text-white">Está calmo...</p>
              <p className="mt-1">Quando amigo jogar aparece aqui!</p>
              <div className="mt-6 p-2 bg-[#1e1f22] rounded text-[10px] text-left"><p className="font-bold">💾 IP Salvo</p><p>Cada conta NEXUS salva no IP do PC + global no link!</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
