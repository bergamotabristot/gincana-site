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

  // Estados para novos cadastros
  const [novoJogo, setNovoJogo] = useState({
    esporte: '',
    horario: '',
    time1: '',
    placar1: '-',
    placar2: '-',
    time2: '',
    dia: 'Dia 1',
  });

  const [novaAtividade, setNovaAtividade] = useState({
    nome: '',
    horario: '',
    local: '',
    dia: 'Dia 1',
  });

  // Carregar dados em tempo real do Firebase
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

    return () => {
      unsubRanking();
      unsubJogos();
      unsubAtividades();
    };
  }, []);

  const normalizarHorario = (horario) => {
    if (!horario) return '00:00';
    let h = horario.toString().replace(':', '');
    if (h.length === 1) h = `0${h}00`;
    if (h.length === 2) return `${h}:00`;
    if (h.length === 3) h = `0${h}`;
    return `${h.slice(0, 2)}:${h.slice(2, 4)}`;
  };

  const entrarModoEditor = () => {
    const senha = prompt('Digite a senha');
    if (senha === SENHA_EDITOR) setModoEditor(true);
    else alert('Senha incorreta');
  };

  const adicionarEquipe = async () => {
    const nome = prompt('Nome da equipe');
    const pontos = prompt('Pontuação');
    if (!nome) return;
    await addDoc(collection(db, 'ranking'), {
      equipe: nome,
      pontos: Number(pontos),
    });
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
    if(confirm("Tem certeza que deseja excluir?")) {
        await deleteDoc(doc(db, colecao, id));
    }
  };

  const atualizarPlacar = async (id, campo, valor) => {
    const v = valor === '' ? '-' : Number(valor);
    await updateDoc(doc(db, 'jogos', id), { [campo]: v });
  };

  const cronogramaCompleto = [...jogos, ...atividades]
    .map((item) => ({
      ...item,
      horario: normalizarHorario(item.horario),
    }))
    .sort((a, b) => a.horario.localeCompare(b.horario));

  const containerStyle = {
    background: '#0f172a',
    minHeight: '100vh',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  };

  const cardStyle = {
    background: '#1e293b',
    padding: '25px',
    borderRadius: '15px',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '25px'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header e Botão Editor */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            onClick={() => setModoEditor(!modoEditor)}
            style={{
              background: modoEditor ? '#ef4444' : '#f59e0b',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {modoEditor ? 'Sair do Modo Editor' : '🔒 Entrar no Modo Editor'}
          </button>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '48px', marginBottom: '10px' }}>GINCANA 2026</h1>
        <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: '40px' }}>Painel de Jogos e Avisos</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          
          {/* Tabela de Ranking */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>🏆 Classificação</h2>
              {modoEditor && <button onClick={adicionarEquipe} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>+ Equipe</button>}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#334155' }}>
                  <th style={{ padding: '12px' }}>#</th>
                  <th>Equipe</th>
                  <th>Pontos</th>
                  {modoEditor && <th>Ação</th>}
                </tr>
              </thead>
              <tbody>
                {ranking.sort((a, b) => b.pontos - a.pontos).map((time, index) => (
                  <tr key={time.id} style={{ textAlign: 'center', borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px' }}>{index + 1}</td>
                    <td>{time.equipe}</td>
                    <td style={{ color: '#4ade80', fontWeight: 'bold' }}>{time.pontos}</td>
                    {modoEditor && (
                      <td>
                        <button onClick={() => removerDocumento('ranking', time.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Jogos Atuais */}
          <div style={cardStyle}>
            <h2> Últimos Jogos</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#334155' }}>
                  <th style={{ padding: '10px' }}>Modalidade</th>
                  <th>Placar</th>
                  {modoEditor && <th>Gerenciar</th>}
                </tr>
              </thead>
              <tbody>
                {jogos.map((jogo) => (
                  <tr key={jogo.id} style={{ textAlign: 'center', borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '10px' }}>{jogo.esporte}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span>{jogo.time1}</span>
                        <strong style={{ color: '#60a5fa', fontSize: '1.2rem' }}>{jogo.placar1} x {jogo.placar2}</strong>
                        <span>{jogo.time2}</span>
                      </div>
                    </td>
                    {modoEditor && (
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input type="number" placeholder="P1" style={{ width: '35px' }} onChange={(e) => atualizarPlacar(jogo.id, 'placar1', e.target.value)} />
                          <input type="number" placeholder="P2" style={{ width: '35px' }} onChange={(e) => atualizarPlacar(jogo.id, 'placar2', e.target.value)} />
                          <button onClick={() => removerDocumento('jogos', jogo.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>X</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulários do Editor */}
        {modoEditor && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginTop: '20px' }}>
            <div style={cardStyle}>
              <h3>➕ Novo Jogo</h3>
              <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Esporte" value={novoJogo.esporte} onChange={e => setNovoJogo({...novoJogo, esporte: e.target.value})} />
              <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Horário (ex: 14:00)" value={novoJogo.horario} onChange={e => setNovoJogo({...novoJogo, horario: e.target.value})} />
              <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Time 1" value={novoJogo.time1} onChange={e => setNovoJogo({...novoJogo, time1: e.target.value})} />
              <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Time 2" value={novoJogo.time2} onChange={e => setNovoJogo({...novoJogo, time2: e.target.value})} />
              <select style={{width: '100%', marginBottom: '10px', padding: '8px'}} value={novoJogo.dia} onChange={e => setNovoJogo({...novoJogo, dia: e.target.value})}>
                <option>Dia 1</option><option>Dia 2</option><option>Dia 3</option>
              </select>
              <button onClick={adicionarJogo} style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Salvar Jogo</button>
            </div>

            <div style={cardStyle}>
              <h3>🎯 Novo Evento/Aviso</h3>
              <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Nome do evento" value={novaAtividade.nome} onChange={e => setNovaAtividade({...novaAtividade, nome: e.target.value})} />
              <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Horário" value={novaAtividade.horario} onChange={e => setNovaAtividade({...novaAtividade, horario: e.target.value})} />
              <input style={{width: '100%', marginBottom: '10px', padding: '8px'}} placeholder="Local" value={novaAtividade.local} onChange={e => setNovaAtividade({...novaAtividade, local: e.target.value})} />
              <select style={{width: '100%', marginBottom: '10px', padding: '8px'}} value={novaAtividade.dia} onChange={e => setNovaAtividade({...novaAtividade, dia: e.target.value})}>
                <option>Dia 1</option><option>Dia 2</option><option>Dia 3</option>
              </select>
              <button onClick={adicionarAtividade} style={{ width: '100%', padding: '10px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Salvar Evento</button>
            </div>
          </div>
        )}

        {/* Cronograma Final */}
        <div style={cardStyle}>
          <h2>📅 Cronograma Completo</h2>
          {['Dia 1', 'Dia 2', 'Dia 3'].map((dia) => (
            <div key={dia} style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#60a5fa', borderBottom: '1px solid #334155', paddingBottom: '5px' }}>{dia}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {cronogramaCompleto.filter(i => i.dia === dia).map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '10px', width: '100px', color: '#94a3b8' }}>{item.horario}</td>
                      <td style={{ fontWeight: 'bold' }}>{'esporte' in item ? item.esporte : item.nome}</td>
                      <td style={{ textAlign: 'right', color: '#cbd5e1' }}>
                        {'esporte' in item ? `${item.time1} x ${item.time2}` : item.local}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}