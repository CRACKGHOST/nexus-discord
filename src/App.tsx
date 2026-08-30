
import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

type User = { id:string, name:string, email?:string, avatar:string, banner:string, password:string, bio:string, tag?:string, dob?:string }
type Group = { id:string, name:string, ownerId:string, icon:string, color:string, logo?:string, categories?: { id:string, name:string }[] }
type Channel = { id:string, name:string, type:'text'|'voice'|'announcement', groupId:string, categoryId?:string, photo?:string, topic?:string }
type Message = { id:string, user:string, text:string, groupId:string, avatar:string, time:string, userId:string, edited?:boolean, replyTo?:string, attachments?:string[] }
type FriendRequest = { id:string, name:string, status:'pending'|'accepted'|'blocked', avatar:string, isIncoming?:boolean }
type VoiceParticipant = { id:string, name:string, avatar:string, muted:boolean, deafened:boolean, speaking:boolean, video:boolean, sharing:boolean }
type Call = { id:string, with:string, type:'voice'|'video', status:'ringing'|'ongoing'|'ended', startTime?:number, incoming?:boolean }

export default function App(){
  // CORE STATE
  const [users,setUsers]=useState<User[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-users')||'[]') }catch{ return [] } })
  const [currentUser,setCurrentUser]=useState<User|null>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-current')||'null') }catch{ return null } })
  const [groups,setGroups]=useState<Group[]>(()=>{ try{ const s=localStorage.getItem('nexus-groups'); if(s) return JSON.parse(s); return [{id:'1', name:'NEXUS HQ', ownerId:'', icon:'N', color:'#7c3aed', categories:[{id:'c1', name:'CANALS DE TEXTO'},{id:'c2', name:'CANALS DE VOZ'}]}] }catch{ return [{id:'1', name:'NEXUS HQ', ownerId:'', icon:'N', color:'#7c3aed'}] } })
  const [channels,setChannels]=useState<Channel[]>(()=>{ try{ const s=localStorage.getItem('nexus-channels'); if(s) return JSON.parse(s); return [{id:'1', name:'geral', type:'text', groupId:'1', categoryId:'c1', topic:'Canal geral do NEXUS'}, {id:'2', name:'bate-papo', type:'text', groupId:'1', categoryId:'c1'}, {id:'v1', name:'Geral', type:'voice', groupId:'1', categoryId:'c2'}, {id:'v2', name:'Jogando', type:'voice', groupId:'1', categoryId:'c2'}] }catch{ return [{id:'1', name:'geral', type:'text', groupId:'1'}, {id:'v1', name:'Geral', type:'voice', groupId:'1'}] } })
  const [msgs,setMsgs]=useState<Message[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-msgs')||'[]') }catch{ return [] } })
  
  // UI STATE
  const [activeGroup,setActiveGroup]=useState('1')
  const [activeChannel,setActiveChannel]=useState('1')
  const [input,setInput]=useState('')
  const [showFriendsPage,setShowFriendsPage]=useState(true)
  const [friendsTab,setFriendsTab]=useState<'online'|'all'|'pending'|'blocked'|'add'>('online')
  const [addFriendName,setAddFriendName]=useState('')
  const [addFriendStatus,setAddFriendStatus]=useState<'idle'|'success'|'error'|'already'|'self'>('idle')
  const [addFriendMsg,setAddFriendMsg]=useState('')
  const [friends,setFriends]=useState<string[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-friends')||'[]') }catch{ return [] } })
  const [friendRequests,setFriendRequests]=useState<FriendRequest[]>(()=>{ try{ return JSON.parse(localStorage.getItem('nexus-requests')||'[]') }catch{ return [] } })
  const [showSettings,setShowSettings]=useState(false)
  const [settingsTab,setSettingsTab]=useState('conta')
  const [themeColor,setThemeColor]=useState(()=>localStorage.getItem('nexus-theme')||'#7c3aed')
  const [logoImage,setLogoImage]=useState(()=>localStorage.getItem('nexus-logo')||'')
  
  // AUTH STATE - DISCORD STYLE
  const [authMode,setAuthMode]=useState<'login'|'register'>('register')
  const [regName,setRegName]=useState('')
  const [regEmail,setRegEmail]=useState('')
  const [regPass,setRegPass]=useState('')
  const [regDob,setRegDob]=useState('')
  const [dobMonth,setDobMonth]=useState('')
  const [dobDay,setDobDay]=useState('')
  const [dobYear,setDobYear]=useState('')
  const [showPass,setShowPass]=useState(false)
  
  // VOICE & CALL - DISCORD STYLE 100%
  const [inVoice,setInVoice]=useState<string|null>(null)
  const [voiceParticipants,setVoiceParticipants]=useState<VoiceParticipant[]>([])
  const [micMuted,setMicMuted]=useState(false)
  const [deafened,setDeafened]=useState(false)
  const [videoOn,setVideoOn]=useState(false)
  const [isScreenSharing,setIsScreenSharing]=useState(false)
  const [micLevel,setMicLevel]=useState(0)
  const [voiceTime,setVoiceTime]=useState(0)
  const [activeCall,setActiveCall]=useState<Call|null>(null)
  const [incomingCall,setIncomingCall]=useState<Call|null>(null)
  const [selectedMic,setSelectedMic]=useState(()=>localStorage.getItem('nexus-micId')||'')
  const [selectedOutput,setSelectedOutput]=useState(()=>localStorage.getItem('nexus-outId')||'')
  const [inputVolume,setInputVolume]=useState(()=>Number(localStorage.getItem('nexus-inputVol')||'100'))
  const [outputVolume,setOutputVolume]=useState(()=>Number(localStorage.getItem('nexus-outputVol')||'100'))
  const [noiseSuppression,setNoiseSuppression]=useState(()=>localStorage.getItem('nexus-noise')!=='false')
  const [echoCancellation,setEchoCancellation]=useState(()=>localStorage.getItem('nexus-echo')!=='false')
  const [micDevices,setMicDevices]=useState<MediaDeviceInfo[]>([])
  const [outputDevices,setOutputDevices]=useState<MediaDeviceInfo[]>([])
  
  // MODALS
  const [showCreateGroup,setShowCreateGroup]=useState(false)
  const [newGroupName,setNewGroupName]=useState('')
  const [showChannelConfig,setShowChannelConfig]=useState<Channel|null>(null)
  const [editChannelName,setEditChannelName]=useState('')
  const [showGroupMenu,setShowGroupMenu]=useState(false)
  const [editingName,setEditingName]=useState(false)
  const [newNameInput,setNewNameInput]=useState('')
  const [isTestingMic,setIsTestingMic]=useState(false)
  const [isTestingFone,setIsTestingFone]=useState(false)
  const [outputLevel,setOutputLevel]=useState(0)

  // REFS
  const endRef=useRef<HTMLDivElement>(null)
  const micRef=useRef<MediaStream|null>(null)
  const screenRef=useRef<MediaStream|null>(null)
  const screenVideoRef=useRef<HTMLVideoElement>(null)
  const avatarInputRef=useRef<HTMLInputElement>(null)
  const logoInputRef=useRef<HTMLInputElement>(null)
  const audioRef=useRef<HTMLAudioElement>(null)
  const testCtxRef=useRef<AudioContext|null>(null)

  // PERSIST
  useEffect(()=>{ try{ localStorage.setItem('nexus-users',JSON.stringify(users)) }catch{} },[users])
  useEffect(()=>{ if(currentUser) localStorage.setItem('nexus-current',JSON.stringify(currentUser)) },[currentUser])
  useEffect(()=>{ try{ localStorage.setItem('nexus-groups',JSON.stringify(groups)) }catch{} },[groups])
  useEffect(()=>{ try{ localStorage.setItem('nexus-channels',JSON.stringify(channels)) }catch{} },[channels])
  useEffect(()=>{ try{ localStorage.setItem('nexus-msgs',JSON.stringify(msgs)) }catch{} },[msgs])
  useEffect(()=>{ try{ localStorage.setItem('nexus-friends',JSON.stringify(friends)) }catch{} },[friends])
  useEffect(()=>{ try{ localStorage.setItem('nexus-requests',JSON.stringify(friendRequests)) }catch{} },[friendRequests])
  useEffect(()=>{ try{ localStorage.setItem('nexus-theme',themeColor) }catch{} },[themeColor])
  useEffect(()=>{ try{ localStorage.setItem('nexus-logo',logoImage) }catch{} },[logoImage])
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) },[msgs])
  useEffect(()=>{ let t:any; if(inVoice||activeCall){ t=setInterval(()=>setVoiceTime(v=>v+1),1000) } else setVoiceTime(0); return()=>clearInterval(t) },[inVoice, activeCall])
  useEffect(()=>{ document.title="NEXUS - Discord 100% Clone" },[])

  // DEVICES
  const loadDevices=async()=>{
    try{
      const s=await navigator.mediaDevices.getUserMedia({audio:true}); s.getTracks().forEach(t=>t.stop())
      const d=await navigator.mediaDevices.enumerateDevices()
      setMicDevices(d.filter(x=>x.kind==='audioinput'))
      setOutputDevices(d.filter(x=>x.kind==='audiooutput'))
    }catch{}
  }
  useEffect(()=>{ loadDevices() },[showSettings])

  // SUPABASE GLOBAL LOAD - CONTA SALVA NO IP + GLOBAL
  useEffect(()=>{
    const load=async()=>{
      if(!supabase) return
      try{
        const { data: u } = await supabase.from('nexus_users').select('*').limit(1000)
        if(u && u.length>0){
          const mapped=u.map((x:any)=>({ id:x.id, name:x.name, email:x.email||'', password:x.password, avatar:x.avatar||x.name[0].toUpperCase(), banner:'#7c3aed', bio:'' }))
          setUsers(prev=>{
            const m=[...prev]
            mapped.forEach((x:any)=>{ if(!m.find(y=>y.name.toLowerCase()===x.name.toLowerCase())) m.push(x) })
            return m
          })
        }
        // Load calls incoming
        if(currentUser?.name){
          const { data: calls } = await supabase.from('nexus_calls').select('*').eq('to_name', currentUser.name).eq('status','ringing').limit(1)
          if(calls && calls.length>0){
            const c=calls[0]
            setIncomingCall({ id:c.id, with:c.from_name, type:c.type, status:'ringing', incoming:true })
          }
        }
      }catch{}
    }
    load()
  },[currentUser?.name])

  // FRIENDS GLOBAL - DISCORD 100%
  const loadFriendsGlobal=async(userName:string)=>{
    if(!supabase||!userName) return
    try{
      const { data: d1 } = await supabase.from('nexus_friends').select('*').eq('owner_name', userName)
      const { data: d2 } = await supabase.from('nexus_friends').select('*').eq('friend_name', userName)
      const data=[...(d1||[]), ...(d2||[])]
      if(data.length>0){
        const accepted=data.filter((f:any)=>f.status==='accepted').map((f:any)=> f.owner_name===userName ? f.friend_name : f.owner_name)
        setFriends([...new Set(accepted)] as any)
        const pending=data.filter((f:any)=>f.status==='pending').map((f:any)=>{
          const other=f.owner_name===userName ? f.friend_name : f.owner_name
          return { id:f.id, name:other, status:f.status, avatar:other[0].toUpperCase(), isIncoming:f.friend_name===userName }
        })
        setFriendRequests(pending)
      }
    }catch{}
  }
  useEffect(()=>{
    if(currentUser?.name) loadFriendsGlobal(currentUser.name)
    const iv=setInterval(()=>{ if(currentUser?.name){ loadFriendsGlobal(currentUser.name) } },3000)
    return()=>clearInterval(iv)
  },[currentUser?.name])

  // ADD FRIEND - DISCORD EXACT
  const handleAddFriend=async()=>{
    const raw=addFriendName.trim()
    if(!raw){ setAddFriendStatus('error'); setAddFriendMsg('Digite um nome de usuário.'); return }
    const name=raw.replace('@','').split('#')[0].trim()
    if(name.toLowerCase()===currentUser?.name.toLowerCase()){ setAddFriendStatus('self'); setAddFriendMsg('Você não pode adicionar a si mesmo como amigo.'); return }
    if(friends.some(f=>f.toLowerCase()===name.toLowerCase())){ setAddFriendStatus('already'); setAddFriendMsg(`Você já é amigo de ${name}!`); return }
    let exists=false
    if(users.some(u=>u.name.toLowerCase()===name.toLowerCase())) exists=true
    if(supabase && !exists){
      try{
        const { data } = await supabase.from('nexus_users').select('name').ilike('name', name).limit(1)
        if(data && data.length>0) exists=true
      }catch{}
    }
    if(!exists){ setAddFriendStatus('error'); setAddFriendMsg(`Hm, não funcionou. Verifique se o nome de usuário está correto. Lembre-se que os nomes diferenciam maiúsculas de minúsculas. O usuário "${name}" precisa criar conta no seu link NEXUS primeiro!`); return }
    if(supabase){
      try{
        const { data: a } = await supabase.from('nexus_friends').select('*').eq('owner_name', currentUser!.name).eq('friend_name', name)
        const { data: b } = await supabase.from('nexus_friends').select('*').eq('owner_name', name).eq('friend_name', currentUser!.name)
        const all=[...(a||[]), ...(b||[])]
        if(all.length>0){
          if(all.some((f:any)=>f.status==='accepted')){ setAddFriendStatus('already'); setAddFriendMsg(`Você já é amigo de ${name}!`); return }
          else { setAddFriendStatus('already'); setAddFriendMsg(`Você já enviou um pedido de amizade para ${name}!`); return }
        }
      }catch{}
    }
    const id=Date.now().toString()
    if(supabase){ try{ await supabase.from('nexus_friends').insert({ id, owner_name: currentUser!.name, friend_name: name, status: 'pending' }) }catch(e:any){ setAddFriendStatus('error'); setAddFriendMsg(e.message); return } }
    setAddFriendStatus('success'); setAddFriendMsg(`Sucesso! Seu pedido de amizade para ${name} foi enviado. Ele vai receber em Pendente!`); setAddFriendName(''); setTimeout(()=>{ setFriendsTab('pending'); loadFriendsGlobal(currentUser!.name) },800)
  }
  const acceptFriend=async(id:string)=>{
    const req=friendRequests.find(r=>r.id===id); if(!req) return
    if(supabase){ try{ await supabase.from('nexus_friends').update({ status:'accepted' }).eq('id',id) }catch{} }
    if(!friends.includes(req.name)) setFriends([...friends, req.name])
    setFriendRequests(friendRequests.filter(r=>r.id!==id))
  }
  const rejectFriend=async(id:string)=>{ if(supabase){ try{ await supabase.from('nexus_friends').delete().eq('id',id) }catch{} } setFriendRequests(friendRequests.filter(r=>r.id!==id)) }

  // VOICE - DISCORD 100% IGUAL
  const joinVoice=async(channelId:string)=>{
    if(inVoice===channelId){
      setInVoice(null); setVoiceParticipants([]); micRef.current?.getTracks().forEach(t=>t.stop()); setMicLevel(0); setVoiceTime(0); setMicMuted(false); setDeafened(false); setVideoOn(false); setIsScreenSharing(false); return
    }
    try{
      if(micRef.current) micRef.current.getTracks().forEach(t=>t.stop())
      const s=await navigator.mediaDevices.getUserMedia({ audio:{ deviceId: selectedMic?{exact:selectedMic}:undefined, echoCancellation, noiseSuppression, autoGainControl:true }, video: videoOn?{ width:1280, height:720 }:false })
      micRef.current=s
      // Analyser for speaking
      const ctx=new (window.AudioContext||(window as any).webkitAudioContext)(); if(ctx.state==='suspended') await ctx.resume()
      const src=ctx.createMediaStreamSource(s); const an=ctx.createAnalyser(); an.fftSize=256; src.connect(an); const data=new Uint8Array(an.frequencyBinCount)
      const loop=()=>{ if(!micRef.current||micMuted) return; an.getByteFrequencyData(data); let sum=0; for(let i=0;i<data.length;i++) sum+=data[i]; const lvl=Math.min(100,(sum/data.length/40)*100*(inputVolume/100)); setMicLevel(lvl); setVoiceParticipants(prev=>prev.map(p=>p.id===currentUser!.id?{...p, speaking: lvl>10}:p)); if(micRef.current) requestAnimationFrame(loop) }; loop()
      
      setInVoice(channelId)
      setVoiceParticipants([
        { id:currentUser!.id, name:currentUser!.name, avatar:currentUser!.avatar, muted:micMuted, deafened, speaking:false, video:videoOn, sharing:false },
        ...Array.from({length: Math.floor(Math.random()*2)}, (_,i)=>({ id:`bot-${i}`, name:['Ana Dev','W3scley','Lucas'][i]||`User${i}`, avatar:['A','W','L'][i]||'U', muted:false, deafened:false, speaking: Math.random()>0.5, video:false, sharing:false }))
      ])
    }catch(e:any){ alert('Libere o microfone no cadeado 🔒: '+e.message) }
  }

  // 1-1 CALL - DISCORD IGUAL
  const startCall=async(friendName:string, type:'voice'|'video')=>{
    const id=Date.now().toString()
    const call:Call={ id, with:friendName, type, status:'ringing', startTime:Date.now() }
    setActiveCall(call)
    if(supabase){
      try{ await supabase.from('nexus_calls').insert({ id, from_name: currentUser!.name, to_name: friendName, type, status:'ringing' }) }catch{}
    }
    // Simulate answer after 2s if friend not online (demo)
    setTimeout(()=>{ setActiveCall(prev=> prev && prev.id===id ? {...prev, status:'ongoing'} : prev) }, 2000)
  }
  const acceptIncomingCall=async()=>{
    if(!incomingCall) return
    setActiveCall({ ...incomingCall, status:'ongoing', startTime:Date.now(), incoming:false })
    if(supabase){ try{ await supabase.from('nexus_calls').update({ status:'ongoing' }).eq('id', incomingCall.id) }catch{} }
    setIncomingCall(null)
  }
  const declineIncomingCall=async()=>{
    if(supabase && incomingCall){ try{ await supabase.from('nexus_calls').delete().eq('id', incomingCall.id) }catch{} }
    setIncomingCall(null)
  }
  const endCall=async()=>{
    if(supabase && activeCall){ try{ await supabase.from('nexus_calls').delete().eq('id', activeCall.id) }catch{} }
    setActiveCall(null); setVoiceTime(0); micRef.current?.getTracks().forEach(t=>t.stop())
  }

  const testMic=async()=>{
    if(isTestingMic){ micRef.current?.getTracks().forEach(t=>t.stop()); testCtxRef.current?.close().catch(()=>{}); if(audioRef.current){ audioRef.current.pause(); audioRef.current.srcObject=null } setIsTestingMic(false); setMicLevel(0); return }
    try{
      const s=await navigator.mediaDevices.getUserMedia({ audio:{ deviceId: selectedMic?{exact:selectedMic}:undefined } }); micRef.current=s
      const ctx=new (window.AudioContext||(window as any).webkitAudioContext)(); testCtxRef.current=ctx
      const src=ctx.createMediaStreamSource(s); const gain=ctx.createGain(); gain.gain.value=inputVolume/100*2; const dest=ctx.createMediaStreamDestination(); src.connect(gain); gain.connect(dest)
      if(audioRef.current){ audioRef.current.srcObject=dest.stream; audioRef.current.volume=outputVolume/100; if(selectedOutput && (audioRef.current as any).setSinkId){ try{ await (audioRef.current as any).setSinkId(selectedOutput) }catch{} } await audioRef.current.play() }
      const an=ctx.createAnalyser(); src.connect(an); const data=new Uint8Array(an.frequencyBinCount); setIsTestingMic(true)
      const loop=()=>{ if(!micRef.current) return; an.getByteFrequencyData(data); let sum=0; for(let i=0;i<data.length;i++) sum+=data[i]; setMicLevel(Math.min(100,sum/data.length/22*100)); if(micRef.current) requestAnimationFrame(loop) }; loop()
    }catch{}
  }
  const testFone=()=>{
    if(isTestingFone){ setIsTestingFone(false); setOutputLevel(0); return }
    setIsTestingFone(true); const a=new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3'); a.volume=outputVolume/100; if(selectedOutput && (a as any).setSinkId){ try{ (a as any).setSinkId(selectedOutput) }catch{} } a.play().catch(()=>{}); let l=0; const iv=setInterval(()=>{ l=(l+25)%100; setOutputLevel(l) },80); a.onended=()=>{ clearInterval(iv); setIsTestingFone(false); setOutputLevel(0) }; setTimeout(()=>{ clearInterval(iv); setIsTestingFone(false); setOutputLevel(0) },3500)
  }

  const shareScreen=async()=>{
    if(isScreenSharing){ screenRef.current?.getTracks().forEach(t=>t.stop()); setIsScreenSharing(false); setVoiceParticipants(prev=>prev.map(p=>p.id===currentUser!.id?{...p, sharing:false}:p)); return }
    try{ const s=await (navigator.mediaDevices as any).getDisplayMedia({video:true, audio:true}); screenRef.current=s; if(screenVideoRef.current){ screenVideoRef.current.srcObject=s; screenVideoRef.current.play() } setIsScreenSharing(true); setVoiceParticipants(prev=>prev.map(p=>p.id===currentUser!.id?{...p, sharing:true}:p)); s.getVideoTracks()[0].onended=()=>{ setIsScreenSharing(false); setVoiceParticipants(prev=>prev.map(p=>p.id===currentUser!.id?{...p, sharing:false}:p)) } }catch{}
  }

  const sendMessage=()=>{
    if(!input.trim()) return
    const msg:Message={ id:Date.now().toString(), user:currentUser!.name, text:input, groupId:activeChannel, avatar:currentUser!.avatar, time:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), userId:currentUser!.id }
    setMsgs([...msgs, msg]); setInput('')
    if(supabase){ try{ supabase.from('nexus_msgs').insert({ id:msg.id, user_name:msg.user, text:msg.text, group_id:msg.groupId, avatar:msg.avatar, time:msg.time, user_id:msg.userId }).then(()=>{}) }catch{} }
  }

  const formatTime=(s:number)=>{ const m=Math.floor(s/60).toString().padStart(2,'0'); const sec=(s%60).toString().padStart(2,'0'); return `${m}:${sec}` }
  const themeColors=[{name:'NEXUS Roxo', color:'#7c3aed'}, {name:'Discord', color:'#5865F2'}, {name:'Verde', color:'#23a559'}, {name:'Vermelho', color:'#ed4245'}]

  // AUTH SCREEN - DISCORD 100% CLONE
  if(!currentUser){
    return(
      <div className="min-h-screen bg-[#5865F2] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#5865F2]"></div>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='2' fill='white'/%3E%3C/svg%3E")`}}></div>
        
        <div className="relative z-10 bg-[#313338] rounded-[5px] w-full max-w-[784px] flex shadow-[0_2px_10px_rgba(0,0,0,0.2)] overflow-hidden animate-[fadeIn_0.3s]">
          <div className="flex-1 p-8">
            <div className="text-center">
              <h1 className="text-[24px] font-bold text-white leading-[30px]">{authMode==='login' ? 'Boas-vindas de volta!' : 'Criar uma conta'}</h1>
              <p className="text-[#b5bac1] text-[16px] leading-[20px] mt-2">{authMode==='login' ? 'Estamos muito animados em te ver de novo!' : ''}</p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[12px] font-bold text-[#b5bac1] uppercase tracking-[0.02em] flex gap-1">E-mail <span className="text-[#f23f43]">*</span></label>
                <input value={regEmail} onChange={e=>setRegEmail(e.target.value)} type="email" className="w-full mt-2 bg-[#2b2d31] border border-[#1e1f22] rounded-[4px] p-2.5 text-[16px] text-white outline-none focus:border-[#00a8fc]" />
              </div>

              {authMode==='register' && (
                <div>
                  <label className="text-[12px] font-bold text-[#b5bac1] uppercase">Nome de exibição</label>
                  <input value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Como os outros vão te ver" className="w-full mt-2 bg-[#2b2d31] border border-[#1e1f22] rounded-[4px] p-2.5 text-[16px] text-white outline-none placeholder:text-[#6d6f78]" />
                  <p className="text-[12px] text-[#949ba4] mt-1">Esse nome será usado para seus amigos te adicionarem - igual Discord!</p>
                </div>
              )}

              <div>
                <label className="text-[12px] font-bold text-[#b5bac1] uppercase flex gap-1">Nome de usuário <span className="text-[#f23f43]">*</span></label>
                <input value={authMode==='login'?regName:regName} onChange={e=>setRegName(e.target.value)} placeholder={authMode==='register'?'Ex: primata':'Seu nome de usuário'} className="w-full mt-2 bg-[#2b2d31] border border-[#1e1f22] rounded-[4px] p-2.5 text-[16px] text-white outline-none" />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#b5bac1] uppercase flex gap-1">Senha <span className="text-[#f23f43]">*</span></label>
                <div className="relative mt-2">
                  <input value={regPass} onChange={e=>setRegPass(e.target.value)} type={showPass ? "text" : "password"} className="w-full bg-[#2b2d31] border border-[#1e1f22] rounded-[4px] p-2.5 pr-10 text-[16px] text-white outline-none focus:border-[#00a8fc]" />
                  <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b5bac1] hover:text-white text-[18px] w-6 h-6 flex items-center justify-center" title={showPass ? "Esconder senha" : "Mostrar senha"}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {authMode==='login' && <a className="text-[14px] text-[#00a8fc] hover:underline mt-1 inline-block">Esqueceu sua senha?</a>}
                {regPass && <div className="text-[11px] mt-1 flex items-center gap-1"><span className={regPass.length>=6 ? "text-[#23a559]" : "text-[#fa777c]"}>{regPass.length>=6 ? "✓" : "✗"} {regPass.length} caracteres {regPass.length>=6 ? "(forte)" : "(mínimo 6)"}</span><span className="ml-auto text-[#6d6f78]">{showPass ? "Senha visível" : "Clique no 👁 pra ver"}</span></div>}
              </div>

              {authMode==='register' && (
                <>
                  <div>
                    <label className="text-[12px] font-bold text-[#b5bac1] uppercase flex gap-1">Data de nascimento <span className="text-[#f23f43]">*</span></label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <select value={dobMonth} onChange={e=>setDobMonth(e.target.value)} className="bg-[#2b2d31] border border-[#1e1f22] rounded-[4px] p-2.5 text-white outline-none">
                        <option value="">Mês</option>
                        <option value="1">Janeiro</option><option value="2">Fevereiro</option><option value="3">Março</option><option value="4">Abril</option><option value="5">Maio</option><option value="6">Junho</option><option value="7">Julho</option><option value="8">Agosto</option><option value="9">Setembro</option><option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
                      </select>
                      <select value={dobDay} onChange={e=>setDobDay(e.target.value)} className="bg-[#2b2d31] border border-[#1e1f22] rounded-[4px] p-2.5 text-white outline-none">
                        <option value="">Dia</option>
                        {Array.from({length:31}, (_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
                      </select>
                      <select value={dobYear} onChange={e=>setDobYear(e.target.value)} className="bg-[#2b2d31] border border-[#1e1f22] rounded-[4px] p-2.5 text-white outline-none">
                        <option value="">Ano</option>
                        {Array.from({length:100}, (_,i)=>new Date().getFullYear()-i).map(y=><option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    {(dobMonth||dobDay||dobYear) && <div className="text-[11px] text-[#23a559] mt-1">✓ {dobDay||'?'}/{dobMonth||'?'} / {dobYear||'?'}</div>}
                  </div>
                  <label className="flex gap-2 items-start mt-2">
                    <input type="checkbox" defaultChecked className="mt-1" />
                    <span className="text-[12px] text-[#b5bac1] leading-[16px]">Eu li e concordo com os <span className="text-[#00a8fc]">Termos de Serviço</span> e a <span className="text-[#00a8fc]">Política de Privacidade</span> do NEXUS. Conta salva no IP do seu PC + global!</span>
                  </label>
                </>
              )}

              <button onClick={async()=>{
                if(!regName||!regPass) return alert('Preencha usuário e senha!')
                if(authMode==='register'){
                  if(!regEmail) return alert('Email obrigatório igual Discord!')
                  if(users.find(u=>u.name.toLowerCase()===regName.toLowerCase())) return alert('Esse nome já existe nesse IP/PC!')
                  const id=Date.now().toString()
                  const dobFull = `${dobDay||''}/${dobMonth||''}/${dobYear||''}`
                  const u={ id, name:regName, email:regEmail, avatar:regName[0].toUpperCase(), banner:'#7c3aed', password:regPass, bio:'', tag:Math.floor(1000+Math.random()*9000).toString(), dob:dobFull } as User
                  setUsers([...users,u]); setCurrentUser(u); localStorage.setItem('nexus-users', JSON.stringify([...users,u])); localStorage.setItem('nexus-current', JSON.stringify(u))
                  if(supabase){ try{ await supabase.from('nexus_users').insert({ id, name:regName, email:regEmail, password:regPass, avatar:regName[0].toUpperCase() }) }catch(e){ console.log(e) } }
                }else{
                  if(supabase){
                    try{
                      const { data } = await supabase.from('nexus_users').select('*').ilike('name', regName).eq('password', regPass).maybeSingle()
                      if(data){ setCurrentUser({ id:data.id, name:data.name, email:data.email||'', avatar:data.avatar||data.name[0].toUpperCase(), banner:'#7c3aed', password:data.password, bio:'', tag:'0001' } as User); return }
                    }catch{}
                  }
                  const u=users.find(u=>u.name.toLowerCase()===regName.toLowerCase()&&u.password===regPass)
                  if(!u) return alert('Login ou senha inválidos - igual Discord!')
                  setCurrentUser(u)
                }
              }} className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white py-2.5 rounded-[3px] font-medium text-[16px] mt-2 transition">
                {authMode==='register' ? 'Continuar' : 'Entrar'}
              </button>

              <div className="text-[14px] mt-2">
                <span className="text-[#949ba4]">{authMode==='login'?'Precisa de uma conta? ':'Já tem uma conta?'}</span>{' '}
                <span onClick={()=>setAuthMode(authMode==='login'?'register':'login')} className="text-[#00a8fc] hover:underline cursor-pointer">{authMode==='login'?'Registre-se':'Entrar'}</span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#949ba4]">
                <div className={`w-2 h-2 rounded-full ${supabase?'bg-[#23a559]':'bg-[#f23f43]'}`}></div>
                <span>💾 Conta salva no IP do PC ({typeof window!=='undefined'?window.location.hostname:'local'}) + global Supabase • Igual Discord 100%</span>
              </div>
            </div>
          </div>

          {authMode==='register' ? (
            <div className="w-[240px] bg-[#2b2d31] hidden md:flex flex-col items-center justify-center p-8 text-center border-l border-[#1e1f22]/30">
              <div className="w-20 h-20 rounded-full bg-[#7c3aed] flex items-center justify-center text-3xl font-black text-white shadow-xl">⚡</div>
              <h3 className="text-white font-bold text-[20px] mt-6">NEXUS</h3>
              <p className="text-[#b5bac1] text-[14px] mt-2 leading-[18px]">Chat de voz, vídeo e texto para gamers. Igual Discord, 100% roxo e redondo!</p>
              <div className="mt-6 text-[12px] text-[#949ba4]">Cada conta criada fica salva no seu PC (IP) e no link global!</div>
            </div>
          ) : (
            <div className="w-[280px] bg-[#2b2d31] hidden md:flex flex-col items-center justify-center p-8 text-center border-l border-[#1e1f22]/30">
              <div className="w-[176px] h-[176px] bg-white p-2 rounded-[4px]"><div className="w-full h-full bg-[#2b2d31] flex items-center justify-center text-[12px] text-white">QR CODE<br/>NEXUS</div></div>
              <h3 className="text-white font-bold text-[20px] mt-6">Entrar com QR Code</h3>
              <p className="text-[#b5bac1] text-[14px] mt-2">Escaneie com o <b>app móvel NEXUS</b> para entrar instantaneamente.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // MAIN - DISCORD 100% CLONE
  const filtered=msgs.filter(m=>m.groupId===activeChannel)
  const activeChannelData=channels.find(c=>c.id===activeChannel)
  const activeGroupData=groups.find(g=>g.id===activeGroup)
  const voiceChannels=channels.filter(c=>c.groupId===activeGroup&&c.type==='voice')
  const textChannels=channels.filter(c=>c.groupId===activeGroup&&c.type==='text')

  return(
    <div className="h-screen flex bg-[#313338] text-white overflow-hidden select-none">
      {/* INCOMING CALL - DISCORD STYLE */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center">
          <div className="bg-[#232428] rounded-[8px] p-8 w-[440px] shadow-2xl border border-[#1e1f22] text-center animate-[bounceIn_0.3s]">
            <div className="w-20 h-20 rounded-full bg-[#5865F2] mx-auto flex items-center justify-center text-2xl font-bold">{incomingCall.with[0].toUpperCase()}</div>
            <h2 className="text-[20px] font-bold mt-4">{incomingCall.with}</h2>
            <p className="text-[#b5bac1] text-[14px] mt-1">Chamada de {incomingCall.type==='video'?'vídeo':'voz'} recebida — NEXUS</p>
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={declineIncomingCall} className="w-14 h-14 rounded-full bg-[#ed4245] hover:bg-[#c03537] flex items-center justify-center text-2xl">✕</button>
              <button onClick={acceptIncomingCall} className="w-14 h-14 rounded-full bg-[#23a559] hover:bg-[#1a7f44] flex items-center justify-center text-2xl">📞</button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE CALL - DISCORD STYLE */}
      {activeCall && (
        <div className="fixed bottom-[52px] left-[72px] right-0 top-12 bg-[#000] z-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#5865F2] mx-auto flex items-center justify-center text-3xl font-bold animate-pulse">{activeCall.with[0].toUpperCase()}</div>
              <h2 className="text-[24px] font-bold mt-6">{activeCall.with}</h2>
              <p className="text-[#b5bac1] mt-1">{activeCall.status==='ringing' ? 'Chamando...' : formatTime(voiceTime)} • {activeCall.type==='video'?'Vídeo':'Voz'} • NEXUS • IP salvo</p>
              {activeCall.type==='video' && <div className="mt-6 w-[640px] h-[360px] bg-[#1e1f22] rounded-[8px] flex items-center justify-center text-[#6d6f78]">Vídeo de {activeCall.with}</div>}
            </div>
            {isScreenSharing && <video ref={screenVideoRef} autoPlay className="absolute inset-0 w-full h-full object-contain bg-black" />}
          </div>
          <div className="h-[80px] bg-[#232428] flex items-center justify-center gap-3">
            <button onClick={()=>setMicMuted(!micMuted)} className={`w-12 h-12 rounded-full flex items-center justify-center ${micMuted?'bg-[#ed4245]':'bg-[#2b2d31] hover:bg-[#35373c]'}`}>🎤</button>
            <button onClick={()=>setDeafened(!deafened)} className={`w-12 h-12 rounded-full flex items-center justify-center ${deafened?'bg-[#ed4245]':'bg-[#2b2d31] hover:bg-[#35373c]'}`}>🎧</button>
            <button onClick={()=>setVideoOn(!videoOn)} className={`w-12 h-12 rounded-full flex items-center justify-center ${videoOn?'bg-white text-black':'bg-[#2b2d31] hover:bg-[#35373c]'}`}>📹</button>
            <button onClick={shareScreen} className={`w-12 h-12 rounded-full flex items-center justify-center ${isScreenSharing?'bg-[#23a559]':'bg-[#2b2d31] hover:bg-[#35373c]'}`}>🖥</button>
            <button onClick={endCall} className="w-14 h-14 rounded-full bg-[#ed4245] hover:bg-[#c03537] flex items-center justify-center text-xl">📞</button>
          </div>
        </div>
      )}

      {/* SERVER LIST - DISCORD EXACT */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 shrink-0">
        <div onClick={()=>{ setShowFriendsPage(true); setActiveGroup('') }} className={`group relative w-12 h-12 flex items-center justify-center cursor-pointer`}>
          <div className={`absolute left-0 w-1 bg-white rounded-r-full transition-all ${showFriendsPage?'h-8':'h-0 group-hover:h-5'}`}></div>
          <div className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] flex items-center justify-center transition-all ${showFriendsPage?'bg-[#5865F2] rounded-[16px] text-white':'bg-[#313338] group-hover:bg-[#5865F2] text-[#dbdee1] group-hover:text-white'}`}>👥</div>
        </div>
        <div className="w-8 h-[2px] bg-[#2b2d31] rounded-full"></div>
        {groups.map(g=>(
          <div key={g.id} onClick={()=>{setActiveGroup(g.id); setShowFriendsPage(false); const first=textChannels.find(c=>c.groupId===g.id); if(first) setActiveChannel(first.id)}} onContextMenu={(e)=>{ e.preventDefault(); setActiveGroup(g.id); setShowGroupMenu(!showGroupMenu)}} className="group relative w-12 h-12 flex items-center justify-center cursor-pointer">
            <div className={`absolute left-0 w-1 bg-white rounded-r-full transition-all ${activeGroup===g.id && !showFriendsPage?'h-8':'h-0 group-hover:h-5'}`}></div>
            <div className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] flex items-center justify-center font-bold text-white transition-all overflow-hidden ${activeGroup===g.id && !showFriendsPage?'rounded-[16px]':'hover:rounded-[16px]'}`} style={{background:g.logo||logoImage? 'transparent' : g.color||themeColor}}>
              {g.logo||logoImage ? <img src={g.logo||logoImage} className="w-full h-full object-cover rounded-[inherit]" /> : g.icon}
            </div>
          </div>
        ))}
        <div onClick={()=>setShowCreateGroup(true)} className="group w-12 h-12 bg-[#313338] hover:bg-[#23a559] rounded-[24px] hover:rounded-[16px] flex items-center justify-center text-[#23a559] hover:text-white text-2xl cursor-pointer transition-all">+</div>
        <div className="group w-12 h-12 bg-[#313338] hover:bg-[#23a559] rounded-[24px] hover:rounded-[16px] flex items-center justify-center text-[#23a559] hover:text-white cursor-pointer transition-all">🧭</div>
      </div>

      {/* CHANNELS / DM LIST - DISCORD EXACT */}
      <div className="w-60 bg-[#2b2d31] flex flex-col shrink-0">
        {!showFriendsPage ? (
          <>
            <div className="h-12 px-4 flex items-center border-b border-[#1f2124] font-bold text-white shadow-[0_1px_0_#1f2124,0_1.5px_0_#232428,0_2px_0_#2b2d31] justify-between cursor-pointer hover:bg-[#35373c]">
              <span className="truncate">{activeGroupData?.name}</span>
              <span className="text-[12px]">▼</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin">
              {[
                { id:'c1', name:'CANALS DE TEXTO' },
                { id:'c2', name:'CANALS DE VOZ' }
              ].map(cat=>(
                <div key={cat.id}>
                  <div className="flex items-center gap-0.5 px-0.5 text-[12px] font-semibold text-[#949ba4] hover:text-[#dcdee1] uppercase tracking-[0.02em] cursor-pointer">
                    <span className="text-[10px]">▼</span> {cat.name}
                  </div>
                  <div className="mt-1 space-y-[2px]">
                    {(cat.id==='c1'? textChannels : voiceChannels).map(ch=>(
                      <div key={ch.id}>
                        <div onClick={()=>{ if(ch.type==='text') setActiveChannel(ch.id); else joinVoice(ch.id) }} className={`group flex items-center justify-between px-2 py-1 rounded-[4px] cursor-pointer ${activeChannel===ch.id && ch.type==='text' ? 'bg-[#404249] text-white' : inVoice===ch.id ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dcdee1]'}`}>
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-[18px] leading-none">{ch.type==='text'?'#':'🔊'}</span>
                            <span className="text-[16px] font-medium truncate">{ch.name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            <span className="text-[12px]">👤</span>
                            <span className="text-[12px]">⚙</span>
                          </div>
                        </div>
                        {/* Voice participants like Discord */}
                        {ch.type==='voice' && inVoice===ch.id && voiceParticipants.length>0 && (
                          <div className="ml-6 mt-1 space-y-1">
                            {voiceParticipants.map(p=>(
                              <div key={p.id} className="flex items-center gap-2 px-2 py-0.5 rounded-[4px] hover:bg-[#35373c]">
                                <div className="relative">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${p.speaking?'ring-2 ring-[#23a559]':''}`} style={{background: p.id===currentUser?.id ? '#5865F2' : '#3ba55c'}}>{p.avatar}</div>
                                  {p.muted && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#ed4245] rounded-full flex items-center justify-center text-[8px]">🔇</div>}
                                  {p.sharing && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a559] rounded-full flex items-center justify-center text-[8px]">🖥</div>}
                                </div>
                                <span className={`text-[14px] truncate ${p.speaking?'text-white font-medium':'text-[#949ba4]'}`}>{p.name}</span>
                                {p.video && <span className="text-[12px]">📹</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Friends in this server */}
              <div>
                <div className="text-[12px] font-semibold text-[#949ba4] uppercase px-0.5">Amigos — {friends.length}</div>
                <div className="mt-1 space-y-[2px]">
                  {friends.map(f=>(
                    <div key={f} className="flex items-center gap-2 px-2 py-1 rounded-[4px] hover:bg-[#35373c] text-[#949ba4] hover:text-[#dcdee1] cursor-pointer">
                      <div className="relative"><div className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center text-[11px]">{f[0].toUpperCase()}</div><div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a559] rounded-full border-2 border-[#2b2d31]"></div></div>
                      <span className="text-[14px]">{f}</span>
                    </div>
                  ))}
                  {friends.length===0 && <div className="text-[12px] text-[#6d6f78] px-2 py-1">Nenhum amigo ainda</div>}
                </div>
              </div>
            </div>

            {/* Voice status panel - Discord exact */}
            {inVoice && (
              <div className="bg-[#232428] border-t border-[#1f2124] p-2">
                <div className="flex items-center justify-between text-[12px] text-[#23a559]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#23a559] rounded-full animate-pulse"></span> Conectado por voz / {formatTime(voiceTime)}</span>
                  <div className="flex gap-1">
                    <button onClick={shareScreen} className={`w-6 h-6 rounded-[4px] flex items-center justify-center ${isScreenSharing?'bg-[#23a559] text-white':'bg-[#2b2d31] hover:bg-[#35373c]'}`}>🖥</button>
                    <button onClick={()=>{ setInVoice(null); setVoiceParticipants([]); micRef.current?.getTracks().forEach(t=>t.stop()) }} className="w-6 h-6 rounded-[4px] bg-[#ed4245] hover:bg-[#c03537] flex items-center justify-center">✕</button>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  <button onClick={()=>setMicMuted(!micMuted)} className={`py-1.5 rounded-[4px] text-[12px] ${micMuted?'bg-[#ed4245]':'bg-[#2b2d31] hover:bg-[#35373c]'}`}>{micMuted?'🔇':'🎤'}</button>
                  <button onClick={()=>setDeafened(!deafened)} className={`py-1.5 rounded-[4px] text-[12px] ${deafened?'bg-[#ed4245]':'bg-[#2b2d31] hover:bg-[#35373c]'}`}>{deafened?'🔇':'🎧'}</button>
                  <button onClick={()=>setVideoOn(!videoOn)} className={`py-1.5 rounded-[4px] text-[12px] ${videoOn?'bg-white text-black':'bg-[#2b2d31] hover:bg-[#35373c]'}`}>📹</button>
                  <button onClick={shareScreen} className={`py-1.5 rounded-[4px] text-[12px] ${isScreenSharing?'bg-[#23a559]':'bg-[#2b2d31] hover:bg-[#35373c]'}`}>🖥</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-2.5 border-b border-[#1f2124] shadow-sm">
              <button className="w-full bg-[#1e1f22] hover:bg-[#2b2d31] text-[#949ba4] rounded-[4px] px-2 py-1 text-[14px] text-left">Encontrar ou começar uma conversa</button>
            </div>
            <div className="p-2 space-y-[2px]">
              <button onClick={()=>setFriendsTab('online')} className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-[4px] ${friendsTab!=='add'?'bg-[#404249] text-white':'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dcdee1]'}`}><span className="text-[18px]">👥</span><span className="text-[16px] font-medium">Amigos</span></button>
              <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-[4px] text-[#949ba4] hover:bg-[#35373c] hover:text-[#dcdee1]"><span className="text-[18px]">⚡</span><span className="text-[16px] font-medium">Nitro</span></button>
              <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-[4px] text-[#949ba4] hover:bg-[#35373c] hover:text-[#dcdee1]"><span className="text-[18px]">🛒</span><span className="text-[16px] font-medium">Loja</span></button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 mt-4">
              <div className="flex items-center justify-between px-2 text-[12px] font-semibold text-[#949ba4] uppercase tracking-[0.02em] hover:text-[#dcdee1] cursor-pointer"><span>Mensagens diretas</span><span>+</span></div>
              <div className="mt-2 space-y-[2px]">
                {friends.map(f=>(
                  <div key={f} className="group flex items-center gap-3 px-2 py-1 rounded-[4px] hover:bg-[#35373c] cursor-pointer">
                    <div className="relative"><div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-[12px] font-medium">{f[0].toUpperCase()}</div><div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a559] rounded-full border-2 border-[#2b2d31]"></div></div>
                    <span className="text-[16px] font-medium text-[#949ba4] group-hover:text-white truncate">{f}</span>
                    <button onClick={(e)=>{ e.stopPropagation(); startCall(f,'voice') }} className="ml-auto opacity-0 group-hover:opacity-100 text-[14px]">📞</button>
                  </div>
                ))}
                {friends.length===0 && <div className="text-[12px] text-[#6d6f78] px-2 py-2">Nenhuma conversa<br/><span className="text-[#00a8fc] cursor-pointer" onClick={()=>setFriendsTab('add')}>Adicionar amigo para começar!</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* User panel - Discord exact */}
        <div className="bg-[#232428] h-[52px] px-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-[12px] font-bold cursor-pointer overflow-hidden" onClick={()=>avatarInputRef.current?.click()}>
                {currentUser.avatar.startsWith('data:') ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.avatar}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a559] rounded-full border-2 border-[#232428]"></div>
            </div>
            <div className="leading-[13px] min-w-0">
              <div className="text-[14px] font-bold text-white truncate max-w-[80px]">{currentUser.name}</div>
              <div className="text-[12px] text-[#23a559]">Online • IP salvo</div>
            </div>
          </div>
          <div className="flex gap-0.5 text-[#b5bac1]">
            <button onClick={()=>setMicMuted(!micMuted)} className={`w-8 h-8 rounded-[4px] flex items-center justify-center hover:bg-[#35373c] hover:text-[#dcdee1] ${micMuted?'text-[#ed4245]':''}`}>🎤</button>
            <button onClick={()=>setDeafened(!deafened)} className={`w-8 h-8 rounded-[4px] flex items-center justify-center hover:bg-[#35373c] hover:text-[#dcdee1] ${deafened?'text-[#ed4245]':''}`}>🎧</button>
            <button onClick={()=>{ setSettingsTab('conta'); setShowSettings(true) }} className="w-8 h-8 rounded-[4px] flex items-center justify-center hover:bg-[#35373c] hover:text-[#dcdee1]">⚙</button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - DISCORD FRIENDS OR CHANNEL */}
      <div className="flex-1 flex flex-col bg-[#313338] min-w-0">
        {showFriendsPage ? (
          <>
            {/* Friends header - Discord exact */}
            <div className="h-12 border-b border-[#1f2124] flex items-center px-4 gap-4 bg-[#313338] shadow-sm shrink-0">
              <div className="flex items-center gap-2 font-bold text-white">
                <div className="w-6 h-6 rounded-full bg-[#80848e] flex items-center justify-center text-[12px]">👥</div>
                <span className="text-[16px]">Amigos</span>
              </div>
              <div className="w-[1px] h-6 bg-[#3f4147] mx-2"></div>
              <div className="flex gap-2">
                <button onClick={()=>setFriendsTab('online')} className={`px-2 py-1 rounded-[4px] text-[14px] font-medium ${friendsTab==='online'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c] hover:text-[#dcdee1]'}`}>Disponível</button>
                <button onClick={()=>setFriendsTab('all')} className={`px-2 py-1 rounded-[4px] text-[14px] font-medium ${friendsTab==='all'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c]'}`}>Todos • {friends.length}</button>
                <button onClick={()=>setFriendsTab('pending')} className={`px-2 py-1 rounded-[4px] text-[14px] font-medium flex items-center gap-1.5 ${friendsTab==='pending'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c]'}`}>
                  Pendente {friendRequests.filter(r=>r.isIncoming).length>0 && <span className="bg-[#ed4245] text-white text-[12px] px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">{friendRequests.filter(r=>r.isIncoming).length}</span>}
                </button>
                <button onClick={()=>setFriendsTab('blocked')} className={`px-2 py-1 rounded-[4px] text-[14px] font-medium ${friendsTab==='blocked'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c]'}`}>Bloqueado</button>
                <button onClick={()=>setFriendsTab('add')} className={`px-2 py-1 rounded-[4px] text-[14px] font-medium ${friendsTab==='add'?'bg-[#23a559] text-white':'bg-[#248046] hover:bg-[#1a6334] text-white'}`}>Adicionar amigo</button>
              </div>
              <div className="ml-auto flex items-center gap-3 text-[#b5bac1]">
                <button className="hover:text-[#dcdee1]">💬</button>
                <div className="w-[1px] h-6 bg-[#3f4147]"></div>
                <button className="hover:text-[#dcdee1]">📥</button>
                <button className="hover:text-[#dcdee1]">❓</button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {friendsTab==='add' ? (
                  <div className="p-4 max-w-[700px]">
                    <h2 className="text-[16px] font-bold text-white uppercase">Adicionar amigo</h2>
                    <p className="text-[14px] text-[#b5bac1] mt-2 leading-[18px]">Você pode adicionar amigos com o nome de usuário do NEXUS. Cada conta salva no IP do seu PC + global Supabase, igual Discord 100%!</p>
                    <div className={`mt-4 bg-[#2b2d31] border rounded-[8px] p-2.5 flex items-center gap-2 ${addFriendStatus==='error' || addFriendStatus==='already' || addFriendStatus==='self' ? 'border-[#fa777c]' : 'border-[#1e1f22] focus-within:border-[#00a8fc]'}`}>
                      <input value={addFriendName} onChange={e=>{setAddFriendName(e.target.value); setAddFriendStatus('idle'); setAddFriendMsg('')}} onKeyDown={e=>e.key==='Enter'&&handleAddFriend()} placeholder="Você pode adicionar amigos com o nome de usuário do NEXUS." className="flex-1 bg-[#2b2d31] outline-none text-white placeholder-[#6d6f78] text-[16px]" />
                      <button onClick={handleAddFriend} disabled={!addFriendName.trim()} className="bg-[#5865F2] disabled:bg-[#4e5058] disabled:text-[#6d6f78] hover:bg-[#4752c4] text-white px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition">Enviar pedido de amizade</button>
                    </div>
                    {addFriendStatus!=='idle' && addFriendMsg && (
                      <div className={`mt-3 text-[14px] leading-[18px] ${addFriendStatus==='success'?'text-[#23a559]':'text-[#fa777c]'}`}>{addFriendStatus==='success'?'✅ ':'❌ '}{addFriendMsg}</div>
                    )}
                    <div className="mt-6 border-t border-[#3f4147] pt-4">
                      <h3 className="text-[12px] font-bold text-[#b5bac1] uppercase">Como funciona igual Discord 100%</h3>
                      <ul className="text-[14px] text-[#949ba4] mt-2 space-y-1 list-disc ml-4 leading-[18px]">
                        <li>Cada conta criada fica salva no <b className="text-[#dcdee1]">IP do seu PC</b> (localStorage) + global Supabase</li>
                        <li>Digite o nome exato do amigo (ex: primata, ADM00) - case-insensitive igual Discord</li>
                        <li>Pedido vai instantâneo e aparece em Pendente da outra pessoa em até 3 segundos</li>
                        <li>Aceitou? Vira amigo em Todos e Online com status verde!</li>
                        <li>Ligação de voz e vídeo igual Discord: clique no 📞 no DM ou no canal de voz!</li>
                      </ul>
                      <div className="mt-8 flex flex-col items-center opacity-60">
                        <div className="w-20 h-20 rounded-full bg-[#2b2d31] flex items-center justify-center text-3xl">⚡</div>
                        <p className="text-[14px] text-[#949ba4] mt-4 text-center">O NEXUS está aguardando. Adicione amigos e comece a conversar!</p>
                      </div>
                    </div>
                  </div>
                ) : friendsTab==='pending' ? (
                  <div className="p-4">
                    <div className="text-[12px] font-semibold text-[#b5bac1] uppercase tracking-[0.02em]">Pedidos pendentes — {friendRequests.length}</div>
                    {friendRequests.length===0 ? (
                      <div className="flex flex-col items-center justify-center mt-20">
                        <div className="w-[100px] h-[100px] bg-[#2b2d31] rounded-full flex items-center justify-center text-4xl opacity-30">📭</div>
                        <p className="text-[14px] text-[#6d6f78] mt-4">Não há pedidos pendentes. Tá tudo certo.</p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {friendRequests.map(req=>(
                          <div key={req.id} className="group flex items-center justify-between px-2 py-3 hover:bg-[#2e3035] rounded-[4px] border-t border-[#3f4147]/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-[12px] font-medium">{req.avatar}</div>
                              <div>
                                <div className="text-[16px] font-medium text-white leading-[20px]">{req.name}</div>
                                <div className="text-[12px] text-[#b5bac1] leading-[13px]">{req.isIncoming ? 'Pedido de amizade recebido' : 'Pedido de amizade enviado'}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {req.isIncoming ? (
                                <>
                                  <button onClick={()=>acceptFriend(req.id)} className="w-8 h-8 rounded-full bg-[#2b2d31] hover:bg-[#23a559] text-white flex items-center justify-center transition">✓</button>
                                  <button onClick={()=>rejectFriend(req.id)} className="w-8 h-8 rounded-full bg-[#2b2d31] hover:bg-[#ed4245] text-white flex items-center justify-center transition">✕</button>
                                </>
                              ) : (
                                <span className="text-[12px] text-[#949ba4] px-2">Aguardando resposta...</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="text-[12px] font-semibold text-[#b5bac1] uppercase tracking-[0.02em]">{friendsTab==='online'?'Online':'Todos os amigos'} — {friends.length}</div>
                    {friends.length===0 ? (
                      <div className="flex flex-col items-center justify-center mt-20">
                        <div className="w-[100px] h-[100px] bg-[#2b2d31] rounded-full flex items-center justify-center text-4xl opacity-30">👻</div>
                        <p className="text-[14px] text-[#6d6f78] mt-4">Ninguém está online. Chame seus amigos!</p>
                        <button onClick={()=>setFriendsTab('add')} className="mt-4 bg-[#5865F2] hover:bg-[#4752c4] px-4 py-2 rounded-[4px] text-[14px] text-white font-medium">Adicionar amigo</button>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {friends.map(f=>(
                          <div key={f} className="group flex items-center justify-between px-2 py-2 hover:bg-[#2e3035] rounded-[4px] border-t border-[#3f4147]/30">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-[12px] font-medium">{f[0].toUpperCase()}</div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a559] rounded-full border-2 border-[#313338]"></div>
                              </div>
                              <div>
                                <div className="text-[16px] font-medium text-white leading-[20px]">{f}</div>
                                <div className="text-[12px] text-[#b5bac1] leading-[13px]">Online • Salvo no IP</div>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={()=>{ setShowFriendsPage(false); const dmId=`dm-${f}`; if(!channels.find(c=>c.id===dmId)){ setChannels([...channels, { id:dmId, name:f, type:'text', groupId:'dm', topic:`DM com ${f}` }]) } setActiveGroup('dm'); setActiveChannel(dmId) }} className="w-8 h-8 rounded-full bg-[#2b2d31] hover:bg-[#35373c] flex items-center justify-center text-[#b5bac1] hover:text-[#dcdee1]">💬</button>
                              <button onClick={()=>startCall(f,'voice')} className="w-8 h-8 rounded-full bg-[#2b2d31] hover:bg-[#35373c] flex items-center justify-center text-[#b5bac1] hover:text-[#dcdee1]">📞</button>
                              <button onClick={()=>startCall(f,'video')} className="w-8 h-8 rounded-full bg-[#2b2d31] hover:bg-[#35373c] flex items-center justify-center text-[#b5bac1] hover:text-[#dcdee1]">📹</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ativo agora - Discord exact */}
              <div className="w-[360px] border-l border-[#3f4147]/50 bg-[#2b2d31] p-4 hidden xl:block">
                <h3 className="text-[12px] font-bold text-[#b5bac1] uppercase tracking-[0.02em]">Ativo agora</h3>
                <div className="mt-6">
                  <div className="text-center">
                    <p className="text-[16px] font-bold text-white">Está calmo por enquanto...</p>
                    <p className="text-[14px] text-[#949ba4] mt-1 leading-[18px]">Quando um amigo começar uma atividade — como jogar um jogo — ela aparecerá aqui!</p>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="bg-[#232428] rounded-[8px] p-3 border border-[#1e1f22]">
                      <p className="text-[12px] font-bold text-white">💾 Contas salvas no IP</p>
                      <p className="text-[12px] text-[#949ba4] mt-1 leading-[16px]">Cada conta criada no NEXUS fica salva no IP/PC da pessoa (localStorage) + no Supabase global pra funcionar de qualquer lugar! Igual Discord 100%.</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#23a559]"><div className="w-2 h-2 bg-[#23a559] rounded-full animate-pulse"></div> Sistema Discord 100% funcionando</div>
                    </div>
                    <div className="bg-[#232428] rounded-[8px] p-3 border border-[#1e1f22]">
                      <p className="text-[12px] font-bold text-white">📞 Ligações igual Discord</p>
                      <p className="text-[12px] text-[#949ba4] mt-1 leading-[16px]">Clique em 📞 no amigo para ligar. Chamada de voz e vídeo com mute, deafen, compartilhar tela igual Discord!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // CHANNEL VIEW - DISCORD EXACT
          <>
            <div className="h-12 border-b border-[#1f2124] flex items-center px-4 justify-between bg-[#313338] shadow-sm shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[#80848e] text-[20px] leading-none">#</span>
                <b className="text-[16px] text-white truncate">{activeChannelData?.name}</b>
                <span className="hidden md:inline text-[14px] text-[#b5bac1] ml-2 truncate border-l border-[#3f4147] pl-2">{activeChannelData?.topic || `Canal de texto ${activeChannelData?.name}`}</span>
              </div>
              <div className="flex items-center gap-4 text-[#b5bac1] shrink-0">
                <button onClick={()=>joinVoice(voiceChannels[0]?.id || 'v1')} className="hover:text-[#dcdee1] text-[18px]" title="Entrar na call de voz - igual Discord">🔊</button>
                <button className="hover:text-[#dcdee1]">🔔</button>
                <button className="hover:text-[#dcdee1]">📌</button>
                <button className="hover:text-[#dcdee1]">👥</button>
                <div className="relative hidden md:block">
                  <input placeholder="Pesquisar" className="bg-[#1e1f22] rounded-[4px] px-1.5 py-1 text-[14px] w-[144px] outline-none placeholder:text-[#949ba4]" />
                </div>
                <button className="hover:text-[#dcdee1]">📥</button>
                <button className="hover:text-[#dcdee1]">❓</button>
              </div>
            </div>

            {inVoice && voiceParticipants.length>0 && (
              <div className="bg-[#2b2d31] border-b border-[#1f2124] p-3">
                <div className="flex flex-wrap gap-2">
                  {voiceParticipants.map(p=>(
                    <div key={p.id} className={`relative bg-[#232428] rounded-[8px] w-[200px] h-[120px] flex flex-col items-center justify-center border-2 ${p.speaking?'border-[#23a559]':'border-[#1e1f22]'}`}>
                      <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center text-[16px] font-bold">{p.avatar}</div>
                      <span className="text-[14px] font-medium mt-2">{p.name}</span>
                      {p.sharing && <div className="absolute top-1 right-1 bg-[#23a559] text-[10px] px-1 rounded">TELA</div>}
                      {p.muted && <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#ed4245] rounded-full flex items-center justify-center text-[10px]">🔇</div>}
                      {p.video && <div className="absolute inset-0 bg-[#000] rounded-[6px] flex items-center justify-center text-[12px]">📹 {p.name}</div>}
                    </div>
                  ))}
                </div>
                {isScreenSharing && <video ref={screenVideoRef} autoPlay className="mt-3 w-full max-h-[400px] bg-black rounded-[8px]" />}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
              <div className="py-8">
                <div className="w-16 h-16 rounded-full bg-[#5865F2] flex items-center justify-center text-2xl">#</div>
                <h1 className="text-[32px] font-bold text-white mt-2">Boas-vindas a #{activeChannelData?.name}!</h1>
                <p className="text-[16px] text-[#b5bac1] mt-1">Esse é o começo do histórico de #{activeChannelData?.name}.</p>
              </div>
              {filtered.map(m=>(
                <div key={m.id} className="group flex gap-4 hover:bg-[#2e3035] px-4 py-0.5 -mx-4">
                  <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0 mt-0.5 text-[14px] font-medium overflow-hidden">
                    {m.avatar.startsWith('data:') ? <img src={m.avatar} className="w-full h-full object-cover" /> : m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <b className="text-[15.5px] font-medium text-white hover:underline cursor-pointer">{m.user}</b>
                      <span className="text-[12px] text-[#949ba4]">{m.time}</span>
                    </div>
                    <div className="text-[15.5px] leading-[22px] text-[#dcdee1] whitespace-pre-wrap break-words">{m.text}</div>
                  </div>
                  <button onClick={()=>{ if(confirm('Apagar mensagem?')) setMsgs(msgs.filter(x=>x.id!==m.id)) }} className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-[4px] bg-[#313338] border border-[#3f4147] hover:bg-[#2b2d31] flex items-center justify-center text-[14px]">🗑</button>
                </div>
              ))}
              {filtered.length===0 && <div className="text-[14px] text-[#6d6f78]">Nenhuma mensagem ainda. Seja o primeiro a falar!</div>}
              <div ref={endRef} />
            </div>

            <div className="p-4 pt-2">
              <div className="bg-[#383a40] rounded-[8px]">
                <div className="min-h-[44px] flex items-center px-3 gap-3">
                  <button className="w-7 h-7 bg-[#b5bac1] hover:bg-[#dcdee1] rounded-full flex items-center justify-center text-[#383a40] text-[18px] leading-none">+</button>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder={`Conversar em #${activeChannelData?.name}`} className="flex-1 bg-transparent outline-none text-[16px] placeholder:text-[#6d6f78] text-[#dcdee1]" />
                  <div className="flex items-center gap-3 text-[#b5bac1]">
                    <button className="hover:text-[#dcdee1] text-[20px]">🎁</button>
                    <button className="hover:text-[#dcdee1] text-[20px]">😊</button>
                    <button className="hover:text-[#dcdee1] text-[20px]">😀</button>
                  </div>
                </div>
              </div>
              <div className="text-[12px] text-[#6d6f78] mt-1 hidden md:block">Pressione Enter para enviar, Shift+Enter para nova linha • Igual Discord 100%</div>
            </div>
          </>
        )}
      </div>

      {/* MEMBERS LIST - DISCORD */}
      {!showFriendsPage && (
        <div className="w-60 bg-[#2b2d31] hidden lg:flex flex-col p-3 overflow-y-auto">
          <div className="text-[12px] font-semibold text-[#949ba4] uppercase tracking-[0.02em]">Online — {friends.length+1}</div>
          <div className="mt-2 space-y-0.5">
            <div className="flex items-center gap-2 px-2 py-1 rounded-[4px] hover:bg-[#35373c] text-[#949ba4] hover:text-[#dcdee1] cursor-pointer">
              <div className="relative"><div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-[12px]">{currentUser.avatar}</div><div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a559] rounded-full border-2 border-[#2b2d31]"></div></div>
              <span className="text-[14px] font-medium">{currentUser.name} (você)</span>
            </div>
            {friends.map(f=>(
              <div key={f} className="flex items-center gap-2 px-2 py-1 rounded-[4px] hover:bg-[#35373c] text-[#949ba4] hover:text-[#dcdee1] cursor-pointer group">
                <div className="relative"><div className="w-8 h-8 rounded-full bg-[#3ba55c] flex items-center justify-center text-[12px]">{f[0].toUpperCase()}</div><div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a559] rounded-full border-2 border-[#2b2d31]"></div></div>
                <span className="text-[14px] font-medium flex-1 truncate">{f}</span>
                <button onClick={()=>startCall(f,'voice')} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-[#2b2d31] hover:bg-[#404249] flex items-center justify-center text-[12px]">📞</button>
              </div>
            ))}
          </div>
          <div className="mt-4 text-[12px] font-semibold text-[#949ba4] uppercase">Offline — 0</div>
        </div>
      )}

      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      {/* CREATE SERVER MODAL - DISCORD */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[5px] w-[440px] text-[#060607] overflow-hidden animate-[scaleIn_0.2s]">
            <div className="p-4 text-center">
              <h2 className="text-[24px] font-bold">Personalize seu servidor</h2>
              <p className="text-[14px] text-[#4e5058] mt-1">Dê um toque pessoal ao seu servidor com um nome e um ícone. Você sempre pode mudar isso depois.</p>
              <div className="mt-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#949ba4] flex items-center justify-center text-[#949ba4] cursor-pointer" onClick={()=>logoInputRef.current?.click()}>📷</div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=(ev)=>setLogoImage(ev.target?.result as string); r.readAsDataURL(f) }} />
                <input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} placeholder="Nome do servidor" className="w-full mt-6 bg-[#f6f6f7] border border-[#e3e5e8] rounded-[4px] p-2.5 text-[16px] outline-none" />
                <p className="text-[12px] text-[#4e5058] mt-4 text-left w-full">Ao criar um servidor, você concorda com as <span className="text-[#00a8fc] font-bold">Diretrizes da Comunidade do NEXUS</span>.</p>
              </div>
            </div>
            <div className="bg-[#f6f6f7] p-4 flex justify-between items-center">
              <button onClick={()=>setShowCreateGroup(false)} className="text-[14px] font-medium">Voltar</button>
              <button onClick={()=>{ if(!newGroupName.trim()) return; const id=Date.now().toString(); const newG={ id, name:newGroupName, ownerId:currentUser!.id, icon:newGroupName[0].toUpperCase(), color:themeColor, logo:logoImage }; setGroups([...groups, newG]); setChannels([...channels, { id:`t-${id}`, name:'geral', type:'text', groupId:id, topic:'Canal geral' }, { id:`v-${id}`, name:'Geral', type:'voice', groupId:id }]); setActiveGroup(id); setActiveChannel(`t-${id}`); setShowCreateGroup(false); setNewGroupName('') }} className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-[3px] text-[14px] font-medium">Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS - DISCORD 100% */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex bg-[#313338]">
          <div className="w-[35%] bg-[#2b2d31] flex justify-end">
            <div className="w-[192px] py-[60px] pr-2 space-y-6">
              <div className="space-y-5">
                <div>
                  <div className="text-[12px] font-bold text-[#949ba4] uppercase px-2.5 py-1">Configurações de usuário</div>
                  <div className="mt-1 space-y-[2px]">
                    <button onClick={()=>setSettingsTab('conta')} className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-[16px] ${settingsTab==='conta'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c] hover:text-[#dcdee1]'}`}>Minha conta</button>
                    <button className="w-full text-left px-2.5 py-1.5 rounded-[4px] text-[16px] text-[#b5bac1] hover:bg-[#35373c]">Perfis</button>
                    <button className="w-full text-left px-2.5 py-1.5 rounded-[4px] text-[16px] text-[#b5bac1] hover:bg-[#35373c]">Privacidade e segurança</button>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#949ba4] uppercase px-2.5 py-1">Configurações de voz e vídeo</div>
                  <div className="mt-1 space-y-[2px]">
                    <button onClick={()=>setSettingsTab('voz')} className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-[16px] ${settingsTab==='voz'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c]'}`}>Voz e vídeo</button>
                    <button onClick={()=>setSettingsTab('aparencia')} className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-[16px] ${settingsTab==='aparencia'?'bg-[#404249] text-white':'text-[#b5bac1] hover:bg-[#35373c]'}`}>Aparência</button>
                  </div>
                </div>
              </div>
              <div className="h-[1px] bg-[#3f4147] mx-2.5"></div>
              <div className="px-2.5 space-y-2">
                <button onClick={()=>{ setCurrentUser(null); localStorage.removeItem('nexus-current'); setShowSettings(false) }} className="w-full text-left px-2.5 py-1.5 rounded-[4px] text-[16px] text-[#ed4245] hover:bg-[#35373c]">Sair</button>
                <div className="text-[12px] text-[#949ba4] px-2.5">💾 Salvo no IP: {typeof window!=='undefined'?window.location.hostname:'local'} • Igual Discord 100%</div>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-[#313338] flex">
            <div className="flex-1 max-w-[660px] py-[60px] px-10 overflow-y-auto">
              {settingsTab==='conta' && (
                <div>
                  <h2 className="text-[20px] font-bold text-white">Minha conta</h2>
                  <div className="mt-5 bg-[#232428] rounded-[8px] overflow-hidden border border-[#1e1f22]">
                    <div className="h-[100px] bg-[#7c3aed]"></div>
                    <div className="p-4 flex items-center gap-4 -mt-10">
                      <div className="w-20 h-20 rounded-full bg-[#5865F2] border-[6px] border-[#232428] flex items-center justify-center text-[24px] font-bold overflow-hidden cursor-pointer" onClick={()=>avatarInputRef.current?.click()}>
                        {currentUser.avatar.startsWith('data:') ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.avatar}
                      </div>
                      <div className="flex-1 mt-8">
                        <div className="text-[20px] font-bold text-white">{currentUser.name}</div>
                        <div className="text-[14px] text-[#b5bac1]">Online • Conta salva no IP do seu PC + global Supabase</div>
                      </div>
                      <button onClick={()=>avatarInputRef.current?.click()} className="mt-8 bg-[#5865F2] hover:bg-[#4752c4] text-white px-3 py-1.5 rounded-[3px] text-[14px] font-medium">Editar perfil</button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="bg-[#2b2d31] rounded-[8px] p-3">
                        <div className="flex justify-between items-center">
                          <div><div className="text-[12px] font-bold text-[#b5bac1] uppercase">Nome de usuário</div><div className="text-[16px] text-white mt-1 flex items-center gap-2">{currentUser.name} <span className="text-[#b5bac1] text-[14px]">#{currentUser.tag||'0001'}</span></div></div>
                          <button onClick={()=>{ setEditingName(true); setNewNameInput(currentUser.name) }} className="bg-[#4e5058] hover:bg-[#6d6f78] text-white px-3 py-1.5 rounded-[3px] text-[14px] font-medium">Editar</button>
                        </div>
                        {editingName && (
                          <div className="mt-3 flex gap-2">
                            <input value={newNameInput} onChange={e=>setNewNameInput(e.target.value)} className="flex-1 bg-[#1e1f22] border border-[#1e1f22] rounded-[4px] p-2 text-white outline-none" />
                            <button onClick={()=>{ if(!newNameInput.trim()) return; const u={...currentUser, name:newNameInput} as User; setUsers(users.map(x=>x.id===currentUser.id?u:x)); setCurrentUser(u); setEditingName(false) }} className="bg-[#23a559] text-white px-3 py-1.5 rounded-[3px] text-[14px]">Salvar</button>
                            <button onClick={()=>setEditingName(false)} className="bg-[#4e5058] text-white px-3 py-1.5 rounded-[3px] text-[14px]">Cancelar</button>
                          </div>
                        )}
                      </div>
                      <div className="bg-[#2b2d31] rounded-[8px] p-3">
                        <div className="text-[12px] font-bold text-[#b5bac1] uppercase">E-mail</div>
                        <div className="text-[16px] text-white mt-1">{currentUser.email||'Não definido'} • <span className="text-[#00a8fc]">Revelar</span></div>
                        <div className="text-[12px] text-[#949ba4] mt-2">💾 Conta salva no IP: {typeof window!=='undefined'?window.location.hostname:'local'} + global no link NEXUS</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {settingsTab==='voz' && (
                <div>
                  <h2 className="text-[20px] font-bold text-white">Voz e vídeo</h2>
                  <div className="mt-5 space-y-6">
                    <div className="border-b border-[#3f4147] pb-6">
                      <h3 className="text-[12px] font-bold text-[#b5bac1] uppercase">Dispositivo de entrada</h3>
                      <select value={selectedMic} onChange={e=>setSelectedMic(e.target.value)} className="w-full mt-2 bg-[#1e1f22] border border-[#1e1f22] rounded-[4px] p-2.5 text-[16px] text-white outline-none">
                        {micDevices.map(d=><option key={d.deviceId} value={d.deviceId}>{d.label||'Microfone'}</option>)}
                        {micDevices.length===0 && <option>ME6S ou Microfone padrão</option>}
                      </select>
                      <div className="mt-4">
                        <div className="flex justify-between text-[12px] font-bold text-[#b5bac1] uppercase"><span>Volume de entrada</span><span>{inputVolume}%</span></div>
                        <input type="range" min="0" max="100" value={inputVolume} onChange={e=>setInputVolume(Number(e.target.value))} className="w-full mt-2 accent-[#23a559]" />
                        <div className="h-2 bg-[#4e5058] rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#23a559] transition-all" style={{width:micLevel+'%'}}></div></div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={testMic} className={`px-4 py-1.5 rounded-[3px] text-[14px] font-medium text-white ${isTestingMic?'bg-[#ed4245]':'bg-[#5865F2] hover:bg-[#4752c4]'}`}>{isTestingMic?`Parar teste - ${Math.round(micLevel)}%`:'Vamos testar!'}</button>
                          <span className="text-[14px] text-[#b5bac1] py-1.5">{isTestingMic?(micLevel>5?'🔴 Falando! Voz limpa!':'Fale algo...'):'Clique e fale de fone'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-[#3f4147] pb-6">
                      <h3 className="text-[12px] font-bold text-[#b5bac1] uppercase">Dispositivo de saída</h3>
                      <select value={selectedOutput} onChange={e=>setSelectedOutput(e.target.value)} className="w-full mt-2 bg-[#1e1f22] border border-[#1e1f22] rounded-[4px] p-2.5 text-[16px] text-white outline-none">
                        {outputDevices.map(d=><option key={d.deviceId} value={d.deviceId}>{d.label||'Saída'}</option>)}
                        {outputDevices.length===0 && <option>USB Audio ou Saída padrão</option>}
                      </select>
                      <div className="mt-4">
                        <div className="flex justify-between text-[12px] font-bold text-[#b5bac1] uppercase"><span>Volume de saída</span><span>{outputVolume}%</span></div>
                        <input type="range" min="0" max="100" value={outputVolume} onChange={e=>setOutputVolume(Number(e.target.value))} className="w-full mt-2 accent-[#5865F2]" />
                        <div className="h-2 bg-[#4e5058] rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#5865F2] transition-all" style={{width:outputLevel+'%'}}></div></div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={testFone} className={`px-4 py-1.5 rounded-[3px] text-[14px] font-medium text-white ${isTestingFone?'bg-[#ed4245]':'bg-[#5865F2] hover:bg-[#4752c4]'}`}>{isTestingFone?'Parar':'Vamos testar!'}</button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[12px] font-bold text-[#b5bac1] uppercase">Configurações de voz</h3>
                      <div className="mt-3 space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-[16px] text-[#dcdee1]">Supressão de ruído - Krisp</span>
                          <input type="checkbox" checked={noiseSuppression} onChange={e=>setNoiseSuppression(e.target.checked)} className="w-10 h-6 accent-[#23a559]" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-[16px] text-[#dcdee1]">Cancelamento de eco</span>
                          <input type="checkbox" checked={echoCancellation} onChange={e=>setEchoCancellation(e.target.checked)} className="w-10 h-6 accent-[#23a559]" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {settingsTab==='aparencia' && (
                <div>
                  <h2 className="text-[20px] font-bold text-white">Aparência</h2>
                  <div className="mt-5">
                    <h3 className="text-[12px] font-bold text-[#b5bac1] uppercase">Cor do tema NEXUS - 100% redondo e roxo</h3>
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      {themeColors.map(c=>(
                        <button key={c.color} onClick={()=>setThemeColor(c.color)} className={`p-4 rounded-[8px] border-2 flex flex-col items-center gap-2 ${themeColor===c.color?'border-white':'border-[#2b2d31]'} bg-[#2b2d31]`}>
                          <div className="w-12 h-12 rounded-full" style={{background:c.color}}></div>
                          <div className="text-[12px] font-medium">{c.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-10 pr-20">
              <button onClick={()=>setShowSettings(false)} className="w-9 h-9 rounded-full border border-[#b5bac1] flex items-center justify-center text-[#b5bac1] hover:border-white hover:text-white">✕</button>
              <div className="text-[12px] text-[#b5bac1] mt-2 text-center">ESC</div>
            </div>
          </div>
        </div>
      )}

      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=(ev)=>{ const d=ev.target?.result as string; const u={...currentUser!, avatar:d} as User; setUsers(users.map(x=>x.id===currentUser!.id?u:x)); setCurrentUser(u) }; r.readAsDataURL(f) }} />
    </div>
  )
}
