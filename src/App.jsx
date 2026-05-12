import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const SENHA_EDITOR = 'CGH';

export default function GincanaSite() {
  const [modoEditor, setModoEditor] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [diaAtivo, setDiaAtivo] = useState('Dia 1');

  const [novoJogo, setNovoJogo] = useState({
    esporte: '', horario: '', time1: '', time2: '', dia: 'Dia 1', 
    placar1: 0, placar2: 0, ptsVolei1: 0, ptsVolei2: 0, finalizado: false
  });

  useEffect(() => {
    onSnapshot(collection(db, 'ranking'), (s) => setRanking(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(collection(db, 'jogos'), (s) => setJogos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(collection(db, 'atividades'), (s) => setAtividades(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const adicionarSet = async (id, timeNum, setsAtuais) => {
    const campoSet = timeNum === 1 ? 'placar1' : 'placar2';
    await updateDoc(doc(db, 'jogos', id), { 
      [campoSet]: Number(setsAtuais) + 1,
      ptsVolei1: 0,
      ptsVolei2: 0
    });
  };

  const finalizarJogoSimples = async (jogo) => {
    if (!confirm("Encerrar jogo? No cronograma aparecerão apenas os Sets/Gols.")) return;
    const p1 = Number(jogo.placar1);
    const p2 = Number(jogo.placar2);
    let vencedorFinal = p1 > p2 ? jogo.time1 : p2 > p1 ? jogo.time2 : "Empate";

    await updateDoc(doc(db, 'jogos', jogo.id), {
      finalizado: true,
      vencedor: vencedorFinal,
      placarFinal: `${p1} x ${p2}`
    });
  };

  const cardStyle = { background: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '20px' };
  const btnStyle = { padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', padding: '15px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button onClick={() => {
            if(!modoEditor) {
                const senha = prompt('Senha:');
                if(senha === SENHA_EDITOR) setModoEditor(true);
            } else { setModoEditor(false); }
          }} style={{ ...btnStyle, background: modoEditor ? '#ef4444' : '#f59e0b', color: 'white' }}>
            {modoEditor ? 'Sair Editor' : '🔒 Modo Editor'}
          </button>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px' }}>GINCANA 2026</h1>

        {/* RANKING - FIX PARA O "AMASSADO" */}
        <div style={cardStyle}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{fontSize:'1.2rem', color:'#94a3b8'}}>🏆 PONTUAÇÃO</h2>
            {modoEditor && <button onClick={async() => {const n = prompt('Nome do Time:'); if(n) await addDoc(collection(db,'ranking'),{equipe:n, pontos:0})}} style={{...btnStyle, background:'#22c55e', color:'white', fontSize:'10px'}}>+ Time</button>}
          </div>
          {ranking.sort((a,b) => b.pontos - a.pontos).map((time) => (
            <div key={time.id} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '20px 0', 
                borderBottom: '1px solid #334155',
                gap: '10px' // Esse gap impede que um encoste no outro
            }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f8fafc' }}>{time.equipe}</span>
              <span style={{ fontSize: '4rem', color: '#4ade80', fontWeight: 'bold', lineHeight: '1.1' }}>{time.pontos}</span>
              {modoEditor && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                  <button onClick={() => updateDoc(doc(db, 'ranking', time.id), { pontos: Number(time.pontos) + 100 })} style={{...btnStyle, background: '#16a34a', color: 'white'}}>+100</button>
                  <button onClick={() => updateDoc(doc(db, 'ranking', time.id), { pontos: Number(time.pontos) + 10 })} style={{...btnStyle, background: '#334155', color: 'white'}}>+10</button>
                  <button onClick={() => updateDoc(doc(db, 'ranking', time.id), { pontos: Number(time.pontos) - 100 })} style={{...btnStyle, background: '#991b1b', color: 'white'}}>-100</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AO VIVO */}
        <div style={cardStyle}>
          <h2 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '15px' }}>⚽ AO VIVO</h2>
          {jogos.filter(j => !j.finalizado).map((jogo) => {
            const isVolei = jogo.esporte.toLowerCase().includes('vô') || jogo.esporte.toLowerCase().includes('vo');
            return (
              <div key={jogo.id} style={{ background: '#020617', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #334155' }}>
                <div style={{textAlign:'center', fontSize:'11px', color:'#3b82f6', textTransform:'uppercase', marginBottom:'10px'}}>{jogo.esporte}</div>
                <div style={{display:'flex', justifyContent:'space-around', alignItems:'center'}}>
                    <div style={{textAlign:'center', flex: 1}}>
                        <div style={{fontSize:'14px', marginBottom: '5px'}}>{jogo.time1}</div>
                        <div style={{fontSize:'32px', fontWeight:'bold', color: '#4ade80'}}>{jogo.placar1}</div>
                        {isVolei && <div style={{fontSize:'14px', color:'#60a5fa'}}>{jogo.ptsVolei1} <small>pts</small></div>}
                    </div>
                    <div style={{fontWeight:'bold', color:'#334155'}}>VS</div>
                    <div style={{textAlign:'center', flex: 1}}>
                        <div style={{fontSize:'14px', marginBottom: '5px'}}>{jogo.time2}</div>
                        <div style={{fontSize:'32px', fontWeight:'bold', color: '#4ade80'}}>{jogo.placar2}</div>
                        {isVolei && <div style={{fontSize:'14px', color:'#60a5fa'}}>{jogo.ptsVolei2} <small>pts</small></div>}
                    </div>
                </div>

                {modoEditor && (
                  <div style={{marginTop:'15px', display:'flex', flexDirection:'column', gap:'10px'}}>
                    <div style={{display:'flex', gap:'5px'}}>
                        <button onClick={() => adicionarSet(jogo.id, 1, jogo.placar1)} style={{...btnStyle, background:'#16a34a', color:'white', flex:1}}>{isVolei ? '+1 Set Esq' : '+1 Gol Esq'}</button>
                        <button onClick={() => adicionarSet(jogo.id, 2, jogo.placar2)} style={{...btnStyle, background:'#16a34a', color:'white', flex:1}}>{isVolei ? '+1 Set Dir' : '+1 Gol Dir'}</button>
                    </div>
                    {isVolei && (
                      <div style={{display:'flex', gap:'5px'}}>
                        <button onClick={() => updateDoc(doc(db, 'jogos', jogo.id), { ptsVolei1: Number(jogo.ptsVolei1) + 1 })} style={{...btnStyle, background:'#1e3a8a', color:'white', fontSize:'11px', flex:1}}>+ Ponto Esq</button>
                        <button onClick={() => updateDoc(doc(db, 'jogos', jogo.id), { ptsVolei2: Number(jogo.ptsVolei2) + 1 })} style={{...btnStyle, background:'#1e3a8a', color:'white', fontSize:'11px', flex:1}}>+ Ponto Dir</button>
                      </div>
                    )}
                    <button onClick={() => finalizarJogoSimples(jogo)} style={{...btnStyle, background:'#3b82f6', color:'white', width:'100%'}}>Finalizar Partida</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CRONOGRAMA */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '1.1rem' }}>📅 CRONOGRAMA</h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['Dia 1', 'Dia 2', 'Dia 3'].map(d => (
                <button key={d} onClick={() => setDiaAtivo(d)} style={{ padding: '5px 8px', fontSize: '10px', borderRadius: '4px', border: 'none', background: diaAtivo === d ? '#3b82f6' : '#334155', color: 'white' }}>{d}</button>
              ))}
            </div>
          </div>
          {jogos.concat(atividades).filter(i => i.dia === diaAtivo).sort((a,b) => a.horario.localeCompare(b.horario)).map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1.2fr', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155', fontSize: '13px' }}>
              <div style={{ color: '#94a3b8' }}>{item.horario}h</div>
              <div style={{ fontWeight: 'bold' }}>{item.esporte || item.nome}</div>
              <div style={{ textAlign: 'right' }}>
                {item.finalizado ? (
                  <span style={{ color: '#4ade80' }}>🏆 {item.vencedor} ({item.placarFinal})</span>
                ) : (
                  <span style={{ color: '#64748b' }}>{item.time1 ? `${item.time1} vs ${item.time2}` : item.local}</span>
                )}
                {modoEditor && <button onClick={() => deleteDoc(doc(db, item.esporte ? 'jogos' : 'atividades', item.id))} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor:'pointer' }}>🗑️</button>}
              </div>
            </div>
          ))}
        </div>

        {/* CRIAR JOGO */}
        {modoEditor && (
          <div style={cardStyle}>
            <h3 style={{marginBottom:'10px'}}>➕ Novo Jogo</h3>
            <input style={{width:'100%', padding:'10px', marginBottom:'8px', background:'#0f172a', border:'1px solid #334155', color:'white', borderRadius:'5px'}} placeholder="Esporte" value={novoJogo.esporte} onChange={e => setNovoJogo({...novoJogo, esporte: e.target.value})} />
            <input style={{width:'100%', padding:'10px', marginBottom:'8px', background:'#0f172a', border:'1px solid #334155', color:'white', borderRadius:'5px'}} placeholder="Horário (ex 14:00)" value={novoJogo.horario} onChange={e => setNovoJogo({...novoJogo, horario: e.target.value})} />
            <div style={{display:'flex', gap:'8px', marginBottom:'8px'}}>
                <input style={{flex:1, padding:'10px', background:'#0f172a', border:'1px solid #334155', color:'white', borderRadius:'5px'}} placeholder="Time 1" value={novoJogo.time1} onChange={e => setNovoJogo({...novoJogo, time1: e.target.value})} />
                <input style={{flex:1, padding:'10px', background:'#0f172a', border:'1px solid #334155', color:'white', borderRadius:'5px'}} placeholder="Time 2" value={novoJogo.time2} onChange={e => setNovoJogo({...novoJogo, time2: e.target.value})} />
            </div>
            <button onClick={async () => { if(novoJogo.time1) { await addDoc(collection(db, 'jogos'), novoJogo); alert('Criado!'); } }} style={{...btnStyle, width:'100%', background:'#3b82f6', color:'white'}}>Salvar Jogo</button>
          </div>
        )}
      </div>
    </div>
  );
}