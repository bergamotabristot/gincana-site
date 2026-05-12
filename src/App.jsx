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

  // Função Universal para atualizar placar (Garante que não dê NaN)
  const mudarPlacar = async (id, timeNum, valorAtual, incremento) => {
    const campo = timeNum === 1 ? 'placar1' : 'placar2';
    await updateDoc(doc(db, 'jogos', id), { 
      [campo]: (Number(valorAtual) || 0) + incremento,
      ptsVolei1: 0, 
      ptsVolei2: 0  
    });
  };

  const mudarPontoVolei = async (id, timeNum, ptsAtuais, incremento) => {
    const campo = timeNum === 1 ? 'ptsVolei1' : 'ptsVolei2';
    await updateDoc(doc(db, 'jogos', id), { 
      [campo]: (Number(ptsAtuais) || 0) + incremento 
    });
  };

  const finalizarJogo = async (jogo) => {
    if (!confirm("Deseja encerrar esta partida?")) return;
    const p1 = Number(jogo.placar1) || 0;
    const p2 = Number(jogo.placar2) || 0;
    const vencedor = p1 > p2 ? jogo.time1 : p2 > p1 ? jogo.time2 : "Empate";

    await updateDoc(doc(db, 'jogos', jogo.id), {
      finalizado: true,
      vencedor: vencedor,
      placarFinal: `${p1} x ${p2}`
    });
  };

  const cardStyle = { background: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '20px' };
  const btnStyle = { padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

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

        {/* RANKING */}
        <div style={cardStyle}>
          <h2 style={{fontSize:'1.1rem', color:'#94a3b8', textAlign:'center', marginBottom:'20px'}}>🏆 PONTUAÇÃO GERAL</h2>
          {ranking.sort((a,b) => b.pontos - a.pontos).map((time) => (
            <div key={time.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155', gap: '5px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{time.equipe}</span>
              <span style={{ fontSize: '3.5rem', color: '#4ade80', fontWeight: 'bold', lineHeight: '1' }}>{Number(time.pontos) || 0}</span>
              {modoEditor && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button onClick={() => updateDoc(doc(db, 'ranking', time.id), { pontos: (Number(time.pontos) || 0) + 100 })} style={{...btnStyle, background: '#16a34a', color: 'white'}}>+100</button>
                  <button onClick={() => updateDoc(doc(db, 'ranking', time.id), { pontos: (Number(time.pontos) || 0) - 100 })} style={{...btnStyle, background: '#991b1b', color: 'white'}}>-100</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AO VIVO (COM LÓGICA DE BASQUETE) */}
        <div style={cardStyle}>
          <h2 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '15px' }}>AO VIVO</h2>git
          {jogos.filter(j => !j.finalizado).map((jogo) => {
            const nomeEsporte = (jogo.esporte || "").toLowerCase();
            const isVolei = nomeEsporte.includes('vô') || nomeEsporte.includes('vo');
            const isBasquete = nomeEsporte.includes('basq');

            return (
              <div key={jogo.id} style={{ background: '#020617', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #334155' }}>
                <div style={{textAlign:'center', fontSize:'11px', color:'#3b82f6', textTransform:'uppercase', marginBottom:'15px'}}>{jogo.esporte}</div>
                <div style={{display:'flex', justifyContent:'space-around', alignItems:'center', marginBottom: '20px'}}>
                    <div style={{textAlign:'center', flex: 1}}>
                        <div style={{fontSize:'14px', marginBottom: '10px'}}>{jogo.time1}</div>
                        <div style={{fontSize:'3rem', fontWeight:'bold', color: '#4ade80', lineHeight: '1'}}>{Number(jogo.placar1) || 0}</div>
                        {isVolei && <div style={{fontSize:'14px', color:'#60a5fa', marginTop: '10px'}}>{Number(jogo.ptsVolei1) || 0} pts</div>}
                    </div>
                    <div style={{fontWeight:'bold', color:'#1e293b'}}>VS</div>
                    <div style={{textAlign:'center', flex: 1}}>
                        <div style={{fontSize:'14px', marginBottom: '10px'}}>{jogo.time2}</div>
                        <div style={{fontSize:'3rem', fontWeight:'bold', color: '#4ade80', lineHeight: '1'}}>{Number(jogo.placar2) || 0}</div>
                        {isVolei && <div style={{fontSize:'14px', color:'#60a5fa', marginTop: '10px'}}>{Number(jogo.ptsVolei2) || 0} pts</div>}
                    </div>
                </div>

                {modoEditor && (
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    
                    {/* SE FOR BASQUETE: Mostra +1, +2, +3 */}
                    {isBasquete ? (
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                            <button onClick={() => mudarPlacar(jogo.id, 1, jogo.placar1, 1)} style={{...btnStyle, background:'#334155', color:'white', fontSize:'11px'}}>Esq +1</button>
                            <button onClick={() => mudarPlacar(jogo.id, 1, jogo.placar1, 2)} style={{...btnStyle, background:'#16a34a', color:'white'}}>Esq +2</button>
                            <button onClick={() => mudarPlacar(jogo.id, 1, jogo.placar1, 3)} style={{...btnStyle, background:'#1e3a8a', color:'white'}}>Esq +3</button>
                        </div>
                        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                            <button onClick={() => mudarPlacar(jogo.id, 2, jogo.placar2, 1)} style={{...btnStyle, background:'#334155', color:'white', fontSize:'11px'}}>Dir +1</button>
                            <button onClick={() => mudarPlacar(jogo.id, 2, jogo.placar2, 2)} style={{...btnStyle, background:'#16a34a', color:'white'}}>Dir +2</button>
                            <button onClick={() => mudarPlacar(jogo.id, 2, jogo.placar2, 3)} style={{...btnStyle, background:'#1e3a8a', color:'white'}}>Dir +3</button>
                        </div>
                      </div>
                    ) : (
                      /* SE FOR OUTROS (FUTSAL/VOLEI): Mostra botão padrão */
                      <div style={{display:'flex', gap:'8px'}}>
                        <button onClick={() => mudarPlacar(jogo.id, 1, jogo.placar1, 1)} style={{...btnStyle, background:'#16a34a', color:'white', flex:1}}>{isVolei ? '+1 Set Esq' : '+1 Gol Esq'}</button>
                        <button onClick={() => mudarPlacar(jogo.id, 2, jogo.placar2, 1)} style={{...btnStyle, background:'#16a34a', color:'white', flex:1}}>{isVolei ? '+1 Set Dir' : '+1 Gol Dir'}</button>
                      </div>
                    )}

                    {/* BOTÕES ESPECÍFICOS DE VÔLEI */}
                    {isVolei && (
                      <div style={{display:'flex', gap:'8px'}}>
                        <button onClick={() => mudarPontoVolei(jogo.id, 1, jogo.ptsVolei1, 1)} style={{...btnStyle, background:'#1e3a8a', color:'white', fontSize:'11px', flex:1}}>+ Ponto Esq</button>
                        <button onClick={() => mudarPontoVolei(jogo.id, 2, jogo.ptsVolei2, 1)} style={{...btnStyle, background:'#1e3a8a', color:'white', fontSize:'11px', flex:1}}>+ Ponto Dir</button>
                      </div>
                    )}
                    
                    <button onClick={() => finalizarJogo(jogo)} style={{...btnStyle, background:'#3b82f6', color:'white', width:'100%', marginTop:'5px'}}>Finalizar Partida</button>
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
            <div style={{ display: 'flex', gap: '5px' }}>
              {['Dia 1', 'Dia 2', 'Dia 3'].map(d => (
                <button key={d} onClick={() => setDiaAtivo(d)} style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '5px', border: 'none', background: diaAtivo === d ? '#3b82f6' : '#334155', color: 'white' }}>{d}</button>
              ))}
            </div>
          </div>
          {jogos.concat(atividades).filter(i => i.dia === diaAtivo).sort((a,b) => (a.horario || "").localeCompare(b.horario || "")).map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1.2fr', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155', fontSize: '14px' }}>
              <div style={{ color: '#94a3b8' }}>{item.horario}h</div>
              <div style={{ fontWeight: 'bold' }}>{item.esporte || item.nome}</div>
              <div style={{ textAlign: 'right' }}>
                {item.finalizado ? (
                  <span style={{ color: '#4ade80' }}>🏆 {item.vencedor} <br/>({item.placarFinal})</span>
                ) : (
                  <span style={{ color: '#64748b' }}>{item.time1 ? `${item.time1} vs ${item.time2}` : item.local}</span>
                )}
                {modoEditor && <button onClick={() => deleteDoc(doc(db, item.esporte ? 'jogos' : 'atividades', item.id))} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor:'pointer' }}>🗑️</button>}
              </div>
            </div>
          ))}
        </div>

        {/* FORMULÁRIO NOVO JOGO */}
        {modoEditor && (
          <div style={cardStyle}>
            <h3 style={{marginBottom:'15px'}}>➕ Novo Jogo</h3>
            <input style={{width:'100%', padding:'12px', marginBottom:'10px', background:'#0f172a', border:'1px solid #334155', color:'white', borderRadius:'8px'}} placeholder="Esporte (ex: Basquete)" value={novoJogo.esporte} onChange={e => setNovoJogo({...novoJogo, esporte: e.target.value})} />
            <input style={{width:'100%', padding:'12px', marginBottom:'10px', background:'#0f172a', border:'1px solid #334155', color:'white', borderRadius:'8px'}} placeholder="Horário (ex: 14:30)" value={novoJogo.horario} onChange={e => setNovoJogo({...novoJogo, horario: e.target.value})} />
            <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                <input style={{flex:1, padding:'12px', background:'#0f172a', border:'1px solid #334155', color:'white', borderRadius:'8px'}} placeholder="Time 1" value={novoJogo.time1} onChange={e => setNovoJogo({...novoJogo, time1: e.target.value})} />
                <input style={{flex:1, padding:'12px', background:'#0f172a', border:'1px solid #334155', color:'white', borderRadius:'8px'}} placeholder="Time 2" value={novoJogo.time2} onChange={e => setNovoJogo({...novoJogo, time2: e.target.value})} />
            </div>
            <button onClick={async () => { 
                if(novoJogo.time1 && novoJogo.time2) { 
                    await addDoc(collection(db, 'jogos'), {...novoJogo, placar1:0, placar2:0, ptsVolei1:0, ptsVolei2:0, dia: diaAtivo}); 
                    setNovoJogo({esporte: '', horario: '', time1: '', time2: '', dia: diaAtivo, placar1: 0, placar2: 0, ptsVolei1: 0, ptsVolei2: 0, finalizado: false});
                    alert('Jogo Criado!'); 
                } 
            }} style={{...btnStyle, width:'100%', background:'#3b82f6', color:'white', fontSize:'16px'}}>Salvar Jogo</button>
          </div>
        )}
      </div>
    </div>
  );
}