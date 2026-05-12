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

  const [novaAtividade, setNovaAtividade] = useState({
    nome: '', horario: '', local: '', dia: 'Dia 1'
  });

  useEffect(() => {
    onSnapshot(collection(db, 'ranking'), (s) => setRanking(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(collection(db, 'jogos'), (s) => setJogos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(collection(db, 'atividades'), (s) => setAtividades(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const mudarPlacar = async (jogo, timeNum, incremento) => {
    const campoPlacar = timeNum === 1 ? 'placar1' : 'placar2';
    const valorAtual = timeNum === 1 ? jogo.placar1 : jogo.placar2;
    const esporte = (jogo.esporte || "").toLowerCase();
    const isVolei = esporte.includes('vol') || esporte.includes('vô');
    const updateData = { [campoPlacar]: (Number(valorAtual) || 0) + incremento };
    if (isVolei) { updateData.ptsVolei1 = 0; updateData.ptsVolei2 = 0; }
    await updateDoc(doc(db, 'jogos', jogo.id), updateData);
  };

  const mudarPontoVolei = async (id, timeNum, ptsAtuais, incremento) => {
    const campo = timeNum === 1 ? 'ptsVolei1' : 'ptsVolei2';
    await updateDoc(doc(db, 'jogos', id), { [campo]: (Number(ptsAtuais) || 0) + incremento });
  };

  const finalizarJogo = async (jogo) => {
    if (!confirm("Encerrar partida?")) return;
    const p1 = Number(jogo.placar1) || 0;
    const p2 = Number(jogo.placar2) || 0;
    let vencedor = p1 > p2 ? jogo.time1 : p2 > p1 ? jogo.time2 : "Empate";
    await updateDoc(doc(db, 'jogos', jogo.id), { finalizado: true, vencedor, placarFinal: `${p1} x ${p2}` });
  };

  const cardStyle = { background: '#1e293b', padding: '25px', borderRadius: '15px', marginBottom: '25px' };
  const btnStyle = { padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '8px' };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <button onClick={() => {
            if(!modoEditor) {
                const senha = prompt('Senha:');
                if(senha === SENHA_EDITOR) setModoEditor(true);
            } else { setModoEditor(false); }
          }} style={{ ...btnStyle, background: modoEditor ? '#ef4444' : '#f59e0b', color: 'white', fontSize: '12px' }}>
            {modoEditor ? 'Sair Editor' : '🔒 Modo Editor'}
          </button>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '40px', fontWeight: 'bold' }}>GINCANA 2026</h1>

        {/* RANKING - ESPAÇAMENTO MELHORADO */}
        <div style={cardStyle}>
          <h2 style={{fontSize:'1rem', color:'#94a3b8', textAlign:'center', marginBottom:'25px'}}>🏆 PONTUAÇÃO GERAL</h2>
          {ranking.sort((a,b) => b.pontos - a.pontos).map((time) => (
            <div key={time.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #334155' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '10px' }}>{time.equipe}</span>
              <span style={{ fontSize: '4rem', color: '#4ade80', fontWeight: 'bold', lineHeight: '1.1' }}>{Number(time.pontos) || 0}</span>
              {modoEditor && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button onClick={() => updateDoc(doc(db, 'ranking', time.id), { pontos: (Number(time.pontos) || 0) + 100 })} style={{...btnStyle, background: '#16a34a', color: 'white'}}>+100</button>
                  <button onClick={() => updateDoc(doc(db, 'ranking', time.id), { pontos: (Number(time.pontos) || 0) - 100 })} style={{...btnStyle, background: '#991b1b', color: 'white'}}>-100</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AO VIVO - ESPAÇAMENTO MELHORADO */}
        <div style={cardStyle}>
          <h2 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '20px', color: '#94a3b8' }}>AO VIVO</h2>
          {jogos.filter(j => !j.finalizado).map((jogo) => {
            const esporte = (jogo.esporte || "").toLowerCase();
            const isBasquete = esporte.includes('basq');
            const isVolei = esporte.includes('vol') || esporte.includes('vô');

            return (
              <div key={jogo.id} style={{ background: '#020617', padding: '25px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' }}>
                <div style={{textAlign:'center', fontSize:'11px', color:'#3b82f6', textTransform:'uppercase', marginBottom:'20px', fontWeight: 'bold'}}>{jogo.esporte}</div>
                
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: '15px', marginBottom: '20px'}}>
                    <div style={{textAlign:'center', flex: 1}}>
                        <div style={{fontSize:'14px', marginBottom: '10px', minHeight: '40px', display:'flex', alignItems:'center', justifyContent:'center'}}>{jogo.time1}</div>
                        <div style={{fontSize:'3.5rem', fontWeight:'bold', color: '#4ade80', lineHeight: '1'}}>{Number(jogo.placar1) || 0}</div>
                        {isVolei && <div style={{fontSize:'12px', color:'#60a5fa', marginTop: '8px'}}>{Number(jogo.ptsVolei1) || 0} pts</div>}
                        
                        {modoEditor && (
                          <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'20px'}}>
                            {isBasquete ? (
                              <><button onClick={() => mudarPlacar(jogo, 1, 1)} style={{...btnStyle, background:'#334155', color:'white', fontSize:'11px'}}>+1</button>
                                <button onClick={() => mudarPlacar(jogo, 1, 2)} style={{...btnStyle, background:'#16a34a', color:'white'}}>+2</button>
                                <button onClick={() => mudarPlacar(jogo, 1, 3)} style={{...btnStyle, background:'#1e3a8a', color:'white'}}>+3</button></>
                            ) : (
                              <button onClick={() => mudarPlacar(jogo, 1, 1)} style={{...btnStyle, background:'#16a34a', color:'white'}}>{isVolei ? '+ Set' : '+ Gol'}</button>
                            )}
                            {isVolei && <button onClick={() => mudarPontoVolei(jogo.id, 1, jogo.ptsVolei1, 1)} style={{...btnStyle, background:'#1e3a8a', color:'white', fontSize:'11px'}}>+ Ponto</button>}
                          </div>
                        )}
                    </div>

                    <div style={{fontWeight:'bold', color:'#334155', marginTop: '60px', fontSize: '14px'}}>VS</div>

                    <div style={{textAlign:'center', flex: 1}}>
                        <div style={{fontSize:'14px', marginBottom: '10px', minHeight: '40px', display:'flex', alignItems:'center', justifyContent:'center'}}>{jogo.time2}</div>
                        <div style={{fontSize:'3.5rem', fontWeight:'bold', color: '#4ade80', lineHeight: '1'}}>{Number(jogo.placar2) || 0}</div>
                        {isVolei && <div style={{fontSize:'12px', color:'#60a5fa', marginTop: '8px'}}>{Number(jogo.ptsVolei2) || 0} pts</div>}

                        {modoEditor && (
                          <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'20px'}}>
                            {isBasquete ? (
                              <><button onClick={() => mudarPlacar(jogo, 2, 1)} style={{...btnStyle, background:'#334155', color:'white', fontSize:'11px'}}>+1</button>
                                <button onClick={() => mudarPlacar(jogo, 2, 2)} style={{...btnStyle, background:'#16a34a', color:'white'}}>+2</button>
                                <button onClick={() => mudarPlacar(jogo, 2, 3)} style={{...btnStyle, background:'#1e3a8a', color:'white'}}>+3</button></>
                            ) : (
                              <button onClick={() => mudarPlacar(jogo, 2, 1)} style={{...btnStyle, background:'#16a34a', color:'white'}}>{isVolei ? '+ Set' : '+ Gol'}</button>
                            )}
                            {isVolei && <button onClick={() => mudarPontoVolei(jogo.id, 2, jogo.ptsVolei2, 1)} style={{...btnStyle, background:'#1e3a8a', color:'white', fontSize:'11px'}}>+ Ponto</button>}
                          </div>
                        )}
                    </div>
                </div>

                {modoEditor && <button onClick={() => finalizarJogo(jogo)} style={{...btnStyle, background:'#3b82f6', color:'white', width:'100%', marginTop: '10px'}}>Finalizar Partida</button>}
              </div>
            );
          })}
        </div>

        {/* CRONOGRAMA CORRIGIDO */}
<div style={cardStyle}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
    <h2 style={{ fontSize: '1.1rem', color: '#94a3b8' }}>📅 CRONOGRAMA</h2>
    <div style={{ display: 'flex', gap: '8px' }}>
      {['Dia 1', 'Dia 2', 'Dia 3'].map(d => (
        <button key={d} onClick={() => setDiaAtivo(d)} style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', border: 'none', background: diaAtivo === d ? '#3b82f6' : '#334155', color: 'white' }}>{d}</button>
      ))}
    </div>
  </div>

  {jogos.concat(atividades)
    .filter(i => i.dia === diaAtivo)
    .sort((a, b) => {
      // Função para converter "6h", "06:00" ou "14:30" em um formato comparável
      const formatTime = (t) => {
        if (!t) return "99:99";
        let time = t.toLowerCase().replace('h', ':'); // transforma "6h" em "6:"
        if (!time.includes(':')) time += ':00';
        let [hrs, mins] = time.split(':');
        return `${hrs.padStart(2, '0')}:${(mins || '00').padStart(2, '0')}`;
      };
      return formatTime(a.horario).localeCompare(formatTime(b.horario));
    })
    .map(item => (
    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '75px 1fr 1.2fr', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #334155', fontSize: '14px' }}>
      <div style={{ color: '#94a3b8', fontWeight: '500' }}>{item.horario.includes('h') ? item.horario : `${item.horario}h`}</div>
      <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{item.esporte || item.nome}</div>
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
        {item.finalizado ? (
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>🏆 {item.vencedor}</span>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>({item.placarFinal})</span>
          </div>
        ) : (
          <span style={{ color: '#94a3b8', fontStyle: item.time1 ? 'normal' : 'italic' }}>
            {item.time1 ? `${item.time1} vs ${item.time2}` : `📍 ${item.local || 'Local a definir'}`}
          </span>
        )}
        {modoEditor && (
          <button 
            onClick={() => { if(confirm("Excluir item?")) deleteDoc(doc(db, item.esporte ? 'jogos' : 'atividades', item.id)) }} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '5px' }}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  ))}
</div>

        {/* ÁREA DE CRIAÇÃO */}
        {modoEditor && (
          <>
            <div style={cardStyle}>
              <h3 style={{marginBottom:'20px'}}>Novo Jogo</h3>
              <input style={inputStyle} placeholder="Esporte" value={novoJogo.esporte} onChange={e => setNovoJogo({...novoJogo, esporte: e.target.value})} />
              <input style={inputStyle} placeholder="Horário (Ex: 09:30)" value={novoJogo.horario} onChange={e => setNovoJogo({...novoJogo, horario: e.target.value})} />
              <div style={{display:'flex', gap:'10px'}}>
                <input style={inputStyle} placeholder="Time 1" value={novoJogo.time1} onChange={e => setNovoJogo({...novoJogo, time1: e.target.value})} />
                <input style={inputStyle} placeholder="Time 2" value={novoJogo.time2} onChange={e => setNovoJogo({...novoJogo, time2: e.target.value})} />
              </div>
              <button onClick={async () => { await addDoc(collection(db, 'jogos'), {...novoJogo, dia: diaAtivo, placar1:0, placar2:0}); alert('Jogo Salvo!'); }} style={{...btnStyle, width:'100%', background:'#3b82f6', color:'white'}}>Criar Jogo</button>
            </div>

            <div style={cardStyle}>
              <h3 style={{marginBottom:'20px'}}>Atividade</h3>
              <input style={inputStyle} placeholder="Nome" value={novaAtividade.nome} onChange={e => setNovaAtividade({...novaAtividade, nome: e.target.value})} />
              <input style={inputStyle} placeholder="Horário (Ex: 10:00)" value={novaAtividade.horario} onChange={e => setNovaAtividade({...novaAtividade, horario: e.target.value})} />
              <input style={inputStyle} placeholder="Local" value={novaAtividade.local} onChange={e => setNovaAtividade({...novaAtividade, local: e.target.value})} />
              <button onClick={async () => { await addDoc(collection(db, 'atividades'), {...novaAtividade, dia: diaAtivo}); alert('Atividade Salva!'); }} style={{...btnStyle, width:'100%', background:'#a855f7', color:'white'}}>Criar Atividade</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}