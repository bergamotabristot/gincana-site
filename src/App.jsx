import { useState } from 'react';

const SENHA_EDITOR = 'gincana2026';

export default function GincanaSite() {
  const [modoEditor, setModoEditor] = useState(false);

  const [ranking, setRanking] = useState([
    { equipe: 'Equipe Azul', pontos: 120 },
    { equipe: 'Equipe Verde', pontos: 105 },
  ]);

  const [jogos, setJogos] = useState([
    {
      esporte: 'Vôlei',
      horario: '10:00',
      time1: '3 CGH',
      placar1: 3,
      placar2: 2,
      time2: '2 AF',
      dia: 'Dia 1',
    },
  ]);

  const [atividades, setAtividades] = useState([
    {
      nome: 'Caça ao Tesouro',
      horario: '14:00',
      local: 'Pátio',
      dia: 'Dia 2',
    },
  ]);

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

    if (senha === SENHA_EDITOR) {
      setModoEditor(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const adicionarEquipe = () => {
    const nome = prompt('Nome da equipe');
    const pontos = prompt('Pontuação');

    if (!nome) return;

    setRanking([
      ...ranking,
      {
        equipe: nome,
        pontos: Number(pontos),
      },
    ]);
  };

  const adicionarJogo = () => {
    if (!novoJogo.time1 || !novoJogo.time2) return;

    setJogos([
      ...jogos,
      {
        ...novoJogo,
        horario: normalizarHorario(novoJogo.horario),
      },
    ]);

    setNovoJogo({
      esporte: '',
      horario: '',
      time1: '',
      placar1: '-',
      placar2: '-',
      time2: '',
      dia: 'Dia 1',
    });
  };

  const adicionarAtividade = () => {
    if (!novaAtividade.nome) return;

    setAtividades([
      ...atividades,
      {
        ...novaAtividade,
        horario: normalizarHorario(novaAtividade.horario),
      },
    ]);

    setNovaAtividade({
      nome: '',
      horario: '',
      local: '',
      dia: 'Dia 1',
    });
  };

  const removerJogo = (index) => {
    setJogos(jogos.filter((_, i) => i !== index));
  };

  const removerAtividade = (index) => {
    setAtividades(atividades.filter((_, i) => i !== index));
  };

  const atualizarPlacar = (index, lado, valor) => {
    const novosJogos = [...jogos];

    if (lado === 1) {
      novosJogos[index].placar1 = valueOrDash(valor);
    } else {
      novosJogos[index].placar2 = valueOrDash(valor);
    }

    setJogos(novosJogos);
  };

  const valueOrDash = (v) => {
    if (v === '') return '-';
    return Number(v);
  };

  const cronogramaCompleto = [...jogos, ...atividades]
    .map((item) => ({
      ...item,
      horario: normalizarHorario(item.horario),
    }))
    .sort((a, b) => a.horario.localeCompare(b.horario));

  return (
    <div
      style={{
        background: '#0f172a',
        minHeight: '100vh',
        color: 'white',
        fontFamily: 'Arial',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px',
          }}
        >
          {!modoEditor ? (
            <button
              onClick={entrarModoEditor}
              style={{
                background: '#f59e0b',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              🔒 Entrar no Modo Editor
            </button>
          ) : (
            <button
              onClick={() => setModoEditor(false)}
              style={{
                background: '#ef4444',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Sair do Modo Editor
            </button>
          )}
        </div>

        <h1
          style={{
            textAlign: 'center',
            fontSize: window.innerWidth < 700 ? '36px' : '52px',
          }}
        >
          GINCANA 2026
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#cbd5e1',
            marginBottom: '40px',
          }}
        >
          Painel da gincana escolar
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              window.innerWidth < 900 ? '1fr' : '1fr 1fr',
            gap: '25px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              padding: window.innerWidth < 700 ? '15px' : '25px',
              borderRadius: '15px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2>🏆 Classificação</h2>

              {modoEditor && (
                <button
                  onClick={adicionarEquipe}
                  style={{
                    background: '#22c55e',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  + Equipe
                </button>
              )}
            </div>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ background: '#334155' }}>
                  <th style={{ padding: '12px' }}>#</th>
                  <th>Equipe</th>
                  <th>Pontos</th>
                </tr>
              </thead>

              <tbody>
                {ranking
                  .sort((a, b) => b.pontos - a.pontos)
                  .map((time, index) => (
                    <tr key={index} style={{ textAlign: 'center' }}>
                      <td style={{ padding: '12px' }}>{index + 1}</td>
                      <td>{time.equipe}</td>
                      <td style={{ color: '#4ade80' }}>
                        {time.pontos}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              background: '#1e293b',
              padding: window.innerWidth < 700 ? '15px' : '25px',
              borderRadius: '15px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <h2 style={{ marginBottom: '20px' }}>
              ⚽ Jogos Cadastrados
            </h2>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ background: '#334155' }}>
                  <th style={{ padding: '10px' }}>Modalidade</th>
                  <th>Partida</th>
                  <th>Dia</th>
                  {modoEditor && <th>Ações</th>}
                </tr>
              </thead>

              <tbody>
                {jogos.map((jogo, index) => (
                  <tr key={index} style={{ textAlign: 'center' }}>
                    <td style={{ padding: '10px' }}>{jogo.esporte}</td>

                    <td style={{ padding: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span>{jogo.time1}</span>
                        <strong
                          style={{
                            fontSize: '18px',
                            color: '#60a5fa',
                          }}
                        >
                          {jogo.placar1} x {jogo.placar2}
                        </strong>
                        <span>{jogo.time2}</span>
                      </div>
                    </td>

                    <td>{jogo.dia}</td>

                    {modoEditor && (
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '5px',
                            justifyContent: 'center',
                          }}
                        >
                          <input
                            type='number'
                            placeholder='P1'
                            style={{ width: '50px' }}
                            onChange={(e) =>
                              atualizarPlacar(index, 1, e.target.value)
                            }
                          />

                          <input
                            type='number'
                            placeholder='P2'
                            style={{ width: '50px' }}
                            onChange={(e) =>
                              atualizarPlacar(index, 2, e.target.value)
                            }
                          />

                          <button
                            onClick={() => removerJogo(index)}
                            style={{
                              background: '#ef4444',
                              border: 'none',
                              color: 'white',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            X
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modoEditor && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                window.innerWidth < 900 ? '1fr' : '1fr 1fr',
              gap: '25px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                background: '#1e293b',
                padding: window.innerWidth < 700 ? '15px' : '25px',
                borderRadius: '15px',
              width: '100%',
              boxSizing: 'border-box',
              }}
            >
              <h2 style={{ marginBottom: '20px' }}>
                ➕ Adicionar Novo Jogo
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    window.innerWidth < 700 ? '1fr' : '1fr 1fr',
                  gap: '10px',
                }}
              >
                <input
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  placeholder='Esporte'
                  value={novoJogo.esporte}
                  onChange={(e) =>
                    setNovoJogo({
                      ...novoJogo,
                      esporte: e.target.value,
                    })
                  }
                />

                <input
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  placeholder='Horário (09:00)'
                  value={novoJogo.horario}
                  onChange={(e) =>
                    setNovoJogo({
                      ...novoJogo,
                      horario: e.target.value,
                    })
                  }
                />

                <input
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  placeholder='Nome do Time 1'
                  value={novoJogo.time1}
                  onChange={(e) =>
                    setNovoJogo({
                      ...novoJogo,
                      time1: e.target.value,
                    })
                  }
                />

                <input
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  placeholder='Nome do Time 2'
                  value={novoJogo.time2}
                  onChange={(e) =>
                    setNovoJogo({
                      ...novoJogo,
                      time2: e.target.value,
                    })
                  }
                />

                <select
                  value={novoJogo.dia}
                  onChange={(e) =>
                    setNovoJogo({
                      ...novoJogo,
                      dia: e.target.value,
                    })
                  }
                >
                  <option>Dia 1</option>
                  <option>Dia 2</option>
                  <option>Dia 3</option>
                </select>
              </div>

              <button
                onClick={adicionarJogo}
                style={{
                  marginTop: '15px',
                  width: '100%',
                  background: '#3b82f6',
                  border: 'none',
                  padding: '14px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Adicionar ao Cronograma
              </button>
            </div>

            <div
              style={{
                background: '#1e293b',
                padding: window.innerWidth < 700 ? '15px' : '25px',
                borderRadius: '15px',
              width: '100%',
              boxSizing: 'border-box',
              }}
            >
              <h2 style={{ marginBottom: '20px' }}>
                🎯 Adicionar Evento
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    window.innerWidth < 700 ? '1fr' : '1fr 1fr',
                  gap: '10px',
                }}
              >
                <input
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  placeholder='Nome do evento'
                  value={novaAtividade.nome}
                  onChange={(e) =>
                    setNovaAtividade({
                      ...novaAtividade,
                      nome: e.target.value,
                    })
                  }
                />

                <input
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  placeholder='Horário (09:00)'
                  value={novaAtividade.horario}
                  onChange={(e) =>
                    setNovaAtividade({
                      ...novaAtividade,
                      horario: e.target.value,
                    })
                  }
                />

                <input
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  placeholder='Local'
                  value={novaAtividade.local}
                  onChange={(e) =>
                    setNovaAtividade({
                      ...novaAtividade,
                      local: e.target.value,
                    })
                  }
                />

                <select
                  value={novaAtividade.dia}
                  onChange={(e) =>
                    setNovaAtividade({
                      ...novaAtividade,
                      dia: e.target.value,
                    })
                  }
                >
                  <option>Dia 1</option>
                  <option>Dia 2</option>
                  <option>Dia 3</option>
                </select>
              </div>

              <button
                onClick={adicionarAtividade}
                style={{
                  marginTop: '15px',
                  width: '100%',
                  background: '#a855f7',
                  border: 'none',
                  padding: '14px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Adicionar Evento
              </button>

              <div style={{ marginTop: '20px' }}>
                {atividades.map((atividade, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: '#334155',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '10px',
                    }}
                  >
                    <span>
                      {atividade.nome} - {atividade.dia}
                    </span>

                    <button
                      onClick={() => removerAtividade(index)}
                      style={{
                        background: '#ef4444',
                        border: 'none',
                        color: 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            background: '#1e293b',
            padding: window.innerWidth < 700 ? '15px' : '25px',
            borderRadius: '15px',
              width: '100%',
              boxSizing: 'border-box',
          }}
        >
          <h2 style={{ marginBottom: '20px' }}>
            📅 Cronograma Oficial da Gincana
          </h2>

          {['Dia 1', 'Dia 2', 'Dia 3'].map((dia) => (
            <div key={dia} style={{ marginBottom: '35px' }}>
              <h3 style={{ color: '#60a5fa' }}>{dia}</h3>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr style={{ background: '#334155' }}>
                    <th style={{ padding: '10px' }}>Horário</th>
                    <th>Evento</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>

                <tbody>
                  {cronogramaCompleto
                    .filter((item) => item.dia === dia)
                    .map((item, index) => (
                      <tr key={index} style={{ textAlign: 'center' }}>
                        <td style={{ padding: '10px' }}>
                          {item.horario}
                        </td>

                        <td>
                          {'esporte' in item
                            ? item.esporte
                            : item.nome}
                        </td>

                        <td>
                          {'esporte' in item
                            ? `${item.time1} x ${item.time2}`
                            : item.local}
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
