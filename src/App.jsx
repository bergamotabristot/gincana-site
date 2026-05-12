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

const SENHA_EDITOR = 'gincana2026';

export default function GincanaSite() {
  const [modoEditor, setModoEditor] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [diaAtivo, setDiaAtivo] = useState('Dia 1');

  const [novoJogo, setNovoJogo] = useState({
    esporte: '', horario: '', time1: '', placar1: '-', placar2: '-', time2: '', dia: 'Dia 1',
  });

  const [novaAtividade, setNovaAtividade] = useState({
    nome: '', horario: '', local: '', dia: 'Dia 1',
  });

  useEffect(() => {
    const unsubRanking = onSnapshot(collection(db, 'ranking'), (snapshot) => {
      setRanking(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubJogos = onSnapshot(collection(db, 'jogos'), (snapshot) => {
      setJogos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubAtividades = onSnapshot(collection(db, 'atividades'), (snapshot) => {
      setAtividades(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubRanking(); unsubJogos(); unsubAtividades(); };
  }, []);

  const normalizarHorario = (horario) => {
    if (!horario) return '00:00';
    let h = horario.toString().replace(':', '');
    if (h.length === 1) h = `0${h}00`;
    if (h.length === 2) return `${h}:00`;
    if (h.length === 3) h = `0${h}`;
    return `${h.slice(0, 2)}:${h.slice(2, 4)}`;
  };

  const adicionarEquipe = async () => {
    const nome = prompt('Nome da equipe (Ex: Meu Time)');
    if (!nome) return;
    await addDoc(collection(db, 'ranking'), { equipe: nome, pontos: 0 });
  };

  const somarPontos = async (id, pontosAtuais, incremento) => {
    await updateDoc(doc(db, 'ranking', id), {
      pontos: Number(pontosAtuais) + incremento,
    });
  };

  const resetarPontos = async (id) => {
    if(confirm("Zerar pontuação?")) {
        await updateDoc(doc(db, 'ranking', id), { pontos: 0 });
    }
  };

  const adicionarJogo = async () => {
    if (!novoJogo.time1 || !novoJogo.time2) return;
    await addDoc(collection(db, 'jogos'), {
      ...novoJogo,
      horario: normalizarHorario(novoJogo.horario),
    });
    setNovoJogo({ esporte: '', horario: '', time1: '', placar1: '-', placar2: '-', time2: '', dia: 'Dia 1' });
  };

  const adicionarAtividade = async () => {
    if (!novaAtividade.nome) return;
    await addDoc(collection(db, 'atividades'), {
      ...novaAtividade,
      horario: normalizarHorario(novaAtividade.horario),
    });
    setNovaAtividade({ nome: '', horario: '', local: '', dia: 'Dia 1' });
  };

  const removerDocumento = async (colecao, id) => {
    if(confirm("Excluir item?")) await deleteDoc(doc(db, colecao, id));
  };

  const atualizarPlacar = async (id, campo, valor) => {
    const v = valor === '' ? '-' : Number(valor);
    await updateDoc(doc(db, 'jogos', id), { [campo]: v });
  };

  // UNIÃO DE JOGOS E ATIVIDADES PARA O CRONOGRAMA
  const cronogramaCompleto = [...jogos, ...atividades]
    .map((item) => ({ ...item, horario: normalizarHorario(item.horario) }))
    .sort((a, b) => a.horario.localeCompare(b.horario));

  const containerStyle = { background: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'Arial, sans-serif', padding: '20px' };
  const cardStyle = { background: '#1e293b', padding: '25px', borderRadius: '15px', width: '100%', boxSizing: 'border-box', marginBottom: '25px' };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER / MODO EDITOR */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button onClick={() => {
            if(!modoEditor) {
                const senha = prompt('Senha:');
                if(senha === SENHA_EDITOR) setModoEditor(true);
            } else { setModoEditor(false); }
          }} style={{ background: modoEditor ? '#ef4444' : '#f59e0b', border: 'none', padding: '10px 18px', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            {modoEditor ? 'Sair do Modo Editor' : '🔒 Entrar no Modo Editor'}
          </button>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '48px', marginBottom: '30px' }}>GINCANA 2026</h1>
        
        {/* GRID PRINCIPAL: RANKING E JOGOS RÁPIDOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          
          <div style={cardStyle}>
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
    <h2>🏆 Pontuação</h2>
    {modoEditor && ranking.length === 0 && (
      <button onClick={adicionarEquipe} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px', borderRadius: '5px' }}>
        + Criar Time
      </button>
    )}
  </div>
  
  {ranking.map((time) => (
    <div key={time.id} style={{ textAlign: 'center', padding: '15px 0', borderBottom: ranking.length > 1 ? '1px solid #334155' : 'none' }}>
      <h3 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#f8fafc' }}>{time.equipe}</h3>
      
      {/* Pontuação com margem para não grudar */}
      <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: '#4ade80', margin: '20px 0' }}>
        {time.pontos} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>pts</span>
      </div>

      {modoEditor && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          {/* Botões de +100 e -100 */}
          <button onClick={() => somarPontos(time.id, time.pontos, 100)} style={{ padding: '10px 15px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            +100
          </button>
          
          <button onClick={() => somarPontos(time.id, time.pontos, -100)} style={{ padding: '10px 15px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            -100
          </button>

          {/* Outras opções */}
        
          
          <button onClick={() => resetarPontos(time.id)} style={{ padding: '10px 15px', background: '#450a0a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Zerar
          </button>
          
          <button onClick={() => removerDocumento('ranking', time.id)} style={{ padding: '10px', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
            🗑️
          </button>
        </div>
      )}
    </div>
  ))}
</div>

          <div style={cardStyle}>
            <h2> Placar em Tempo Real</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <tbody>
                {jogos.slice(-4).map((jogo) => ( // Mostra apenas os 4 últimos jogos aqui
                  <tr key={jogo.id} style={{ textAlign: 'center', borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '10px', fontSize: '0.9rem' }}>{jogo.esporte}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span>{jogo.time1}</span>
                        <strong style={{ color: '#60a5fa' }}>{jogo.placar1} x {jogo.placar2}</strong>
                        <span>{jogo.time2}</span>
                      </div>
                    </td>
                    {modoEditor && (
                      <td style={{display: 'flex', gap: '2px'}}>
                        <input type="number" style={{ width: '30px', background: '#0f172a', color: 'white', border: '1px solid #334155' }} onChange={(e) => atualizarPlacar(jogo.id, 'placar1', e.target.value)} />
                        <input type="number" style={{ width: '30px', background: '#0f172a', color: 'white', border: '1px solid #334155' }} onChange={(e) => atualizarPlacar(jogo.id, 'placar2', e.target.value)} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO DE CRONOGRAMA (ONDE A VARIÁVEL É USADA) */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>📅 Cronograma de Eventos</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Dia 1', 'Dia 2', 'Dia 3'].map(dia => (
                <button key={dia} onClick={() => setDiaAtivo(dia)} style={{ background: diaAtivo === dia ? '#3b82f6' : '#334155', border: 'none', padding: '5px 12px', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>{dia}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: '10px' }}>Hora</th>
                  <th>Evento</th>
                  <th>Detalhes</th>
                  {modoEditor && <th>Ação</th>}
                </tr>
              </thead>
              <tbody>
                {cronogramaCompleto.filter(item => item.dia === diaAtivo).map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px 10px' }}>{item.horario}</td>
                    <td style={{ fontWeight: 'bold' }}>{item.esporte || item.nome}</td>
                    <td style={{ color: '#94a3b8' }}>
                      {item.time1 ? `${item.time1} vs ${item.time2}` : item.local}
                    </td>
                    {modoEditor && (
                      <td>
                        <button onClick={() => removerDocumento(item.esporte ? 'jogos' : 'atividades', item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ÁREA DO EDITOR: FORMULÁRIOS */}
        {modoEditor && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
            <div style={cardStyle}>
                <h3>➕ Novo Jogo</h3>
                <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Esporte (Futsal, etc)" value={novoJogo.esporte} onChange={e => setNovoJogo({...novoJogo, esporte: e.target.value})} />
                <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Horário (ex: 09:00)" value={novoJogo.horario} onChange={e => setNovoJogo({...novoJogo, horario: e.target.value})} />
                <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Time 1" value={novoJogo.time1} onChange={e => setNovoJogo({...novoJogo, time1: e.target.value})} />
                <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Time 2" value={novoJogo.time2} onChange={e => setNovoJogo({...novoJogo, time2: e.target.value})} />
                <select style={{width: '100%', marginBottom: '10px', padding: '8px'}} value={novoJogo.dia} onChange={e => setNovoJogo({...novoJogo, dia: e.target.value})}>
                  <option>Dia 1</option><option>Dia 2</option><option>Dia 3</option>
                </select>
                <button onClick={adicionarJogo} style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' }}>Salvar Jogo</button>
            </div>

            <div style={cardStyle}>
                <h3>➕ Atividade / Aviso</h3>
                <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Evento (Almoço, Abertura...)" value={novaAtividade.nome} onChange={e => setNovaAtividade({...novaAtividade, nome: e.target.value})} />
                <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Horário" value={novaAtividade.horario} onChange={e => setNovaAtividade({...novaAtividade, horario: e.target.value})} />
                <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Local" value={novaAtividade.local} onChange={e => setNovaAtividade({...novaAtividade, local: e.target.value})} />
                <select style={{width: '100%', marginBottom: '10px', padding: '8px'}} value={novaAtividade.dia} onChange={e => setNovaAtividade({...novaAtividade, dia: e.target.value})}>
                  <option>Dia 1</option><option>Dia 2</option><option>Dia 3</option>
                </select>
                <button onClick={adicionarAtividade} style={{ width: '100%', padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px' }}>Salvar Atividade</button>
            </div>
           </div>
        )}
      </div>
    </div>
  );
}