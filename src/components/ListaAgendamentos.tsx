import React, { useState, useEffect } from "react";
import { Calendar, User, Car, MessageSquare, Phone, Mail, Clock, Filter, RefreshCw, Trash2 } from "lucide-react";

interface Agendamento {
  id?: string;
  nome: string;
  telefone: string;
  email: string;
  veiculo: string;
  servico: string;
  dataPreferencial: string;
  dataFormatada: string;
  horarioPreferencial: string;
  mensagem: string;
  timestamp: string;
  status: string;
}

export const ListaAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroServico, setFiltroServico] = useState<string>("todos");

  const carregarAgendamentos = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Tentar carregar da API
      const API_URL = 'http://localhost:3030/agendamentos';
      const response = await fetch(API_URL);
      
      if (response.ok) {
        const dadosAPI = await response.json();
        setAgendamentos(dadosAPI);
      } else {
        // Se a API falhar, carregar do LocalStorage
        throw new Error("API não disponível");
      }
    } catch (error) {
      // Carregar do LocalStorage
      const dadosLocal = JSON.parse(localStorage.getItem('agendamentos') || '[]');
      setAgendamentos(dadosLocal);
      
      if (dadosLocal.length === 0) {
        setError("Nenhum agendamento encontrado. A API não está disponível e não há dados locais.");
      } else {
        setError("API não disponível. Mostrando dados salvos localmente.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const deletarAgendamento = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) {
      return;
    }

    try {
      if (id.startsWith('local-')) {
        // Remover do LocalStorage
        const dadosAtualizados = agendamentos.filter(ag => ag.id !== id);
        localStorage.setItem('agendamentos', JSON.stringify(dadosAtualizados));
        setAgendamentos(dadosAtualizados);
      } else {
        // Remover da API
        await fetch(`http://localhost:3030/agendamentos/${id}`, {
          method: 'DELETE'
        });
        carregarAgendamentos();
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const atualizarStatus = async (id: string, novoStatus: string) => {
    try {
      if (id.startsWith('local-')) {
        // Atualizar no LocalStorage
        const dadosAtualizados = agendamentos.map(ag => 
          ag.id === id ? { ...ag, status: novoStatus } : ag
        );
        localStorage.setItem('agendamentos', JSON.stringify(dadosAtualizados));
        setAgendamentos(dadosAtualizados);
      } else {
        // Atualizar na API
        await fetch(`http://localhost:3030/agendamentos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: novoStatus })
        });
        carregarAgendamentos();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const agendamentosFiltrados = agendamentos.filter(ag => {
    const passaStatus = filtroStatus === "todos" || ag.status === filtroStatus;
    const passaServico = filtroServico === "todos" || ag.servico === filtroServico;
    return passaStatus && passaServico;
  });

  const servicosUnicos = Array.from(new Set(agendamentos.map(ag => ag.servico)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "#f59e0b";
      case "confirmado": return "#10b981";
      case "cancelado": return "#ef4444";
      case "concluido": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendente": return "Pendente";
      case "confirmado": return "Confirmado";
      case "cancelado": return "Cancelado";
      case "concluido": return "Concluído";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Calendar style={styles.titleIcon} />
          LISTA DE AGENDAMENTOS
        </h2>
        
        <div style={styles.headerInfo}>
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{agendamentos.length}</span>
              <span style={styles.statLabel}>Total</span>
            </div>
            <div style={styles.statItem}>
              <span style={{...styles.statNumber, color: '#f59e0b'}}>
                {agendamentos.filter(a => a.status === 'pendente').length}
              </span>
              <span style={styles.statLabel}>Pendentes</span>
            </div>
          </div>
          
          <button 
            onClick={carregarAgendamentos}
            style={styles.refreshButton}
          >
            <RefreshCw style={styles.refreshIcon} />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.warning}>
          ⚠️ {error}
        </div>
      )}

      {/* Filtros */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <Filter style={styles.filterIcon} />
          <select 
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="todos">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <select 
            value={filtroServico}
            onChange={(e) => setFiltroServico(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="todos">Todos os serviços</option>
            {servicosUnicos.map((servico, idx) => (
              <option key={idx} value={servico}>{servico}</option>
            ))}
          </select>
        </div>
      </div>

      {agendamentosFiltrados.length === 0 ? (
        <div style={styles.emptyState}>
          <Calendar style={styles.emptyIcon} />
          <h3>Nenhum agendamento encontrado</h3>
          <p>Tente ajustar os filtros ou criar um novo agendamento.</p>
        </div>
      ) : (
        <div style={styles.agendamentosGrid}>
          {agendamentosFiltrados.map((agendamento) => (
            <div key={agendamento.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <User style={styles.cardIcon} />
                  <h4 style={styles.cardName}>{agendamento.nome}</h4>
                </div>
                
                <div style={styles.cardActions}>
                  <select
                    value={agendamento.status}
                    onChange={(e) => agendamento.id && atualizarStatus(agendamento.id, e.target.value)}
                    style={{
                      ...styles.statusSelect,
                      backgroundColor: getStatusColor(agendamento.status) + '20',
                      color: getStatusColor(agendamento.status),
                      borderColor: getStatusColor(agendamento.status)
                    }}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="concluido">Concluído</option>
                  </select>
                  
                  <button 
                    onClick={() => agendamento.id && deletarAgendamento(agendamento.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={styles.cardContent}>
                <div style={styles.infoRow}>
                  <Phone size={14} />
                  <span>{agendamento.telefone}</span>
                </div>
                
                <div style={styles.infoRow}>
                  <Mail size={14} />
                  <span>{agendamento.email}</span>
                </div>
                
                <div style={styles.infoRow}>
                  <Car size={14} />
                  <span><strong>Veículo:</strong> {agendamento.veiculo}</span>
                </div>
                
                <div style={styles.infoRow}>
                  <span><strong>Serviço:</strong> {agendamento.servico}</span>
                </div>
                
                {(agendamento.dataFormatada && agendamento.dataFormatada !== "Não informada") && (
                  <div style={styles.infoRow}>
                    <Calendar size={14} />
                    <span><strong>Data:</strong> {agendamento.dataFormatada}</span>
                    {agendamento.horarioPreferencial && (
                      <span style={styles.time}>
                        <Clock size={12} /> {agendamento.horarioPreferencial}
                      </span>
                    )}
                  </div>
                )}
                
                {agendamento.mensagem && (
                  <div style={styles.messageRow}>
                    <MessageSquare size={14} />
                    <div style={styles.message}>{agendamento.mensagem}</div>
                  </div>
                )}
                
                <div style={styles.metaInfo}>
                  <div>
                    <small style={styles.meta}>
                      ID: {agendamento.id}
                    </small>
                  </div>
                  <div>
                    <small style={styles.meta}>
                      Criado em: {new Date(agendamento.timestamp).toLocaleString('pt-BR')}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: '0.5rem',
    padding: '2rem',
    border: '1px solid #333',
    color: '#fff'
  } as React.CSSProperties,

  header: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  } as React.CSSProperties,

  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
    color: '#F1C232'
  } as React.CSSProperties,

  titleIcon: {
    width: '1.5rem',
    height: '1.5rem'
  } as React.CSSProperties,

  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  } as React.CSSProperties,

  stats: {
    display: 'flex',
    gap: '1.5rem'
  } as React.CSSProperties,

  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  } as React.CSSProperties,

  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#F1C232'
  } as React.CSSProperties,

  statLabel: {
    fontSize: '0.75rem',
    color: '#a0a0a0'
  } as React.CSSProperties,

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: '#F1C232',
    border: '1px solid #F1C232',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease'
  } as React.CSSProperties,

  refreshIcon: {
    width: '1rem',
    height: '1rem'
  } as React.CSSProperties,

  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid #f59e0b',
    color: '#fcd34d',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem',
    fontSize: '0.9rem'
  } as React.CSSProperties,

  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const
  } as React.CSSProperties,

  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  } as React.CSSProperties,

  filterIcon: {
    width: '1rem',
    height: '1rem',
    color: '#F1C232'
  } as React.CSSProperties,

  filterSelect: {
    padding: '0.5rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '0.25rem',
    color: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer'
  } as React.CSSProperties,

  agendamentosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  } as React.CSSProperties,

  card: {
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '0.5rem',
    overflow: 'hidden'
  } as React.CSSProperties,

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #333',
    backgroundColor: '#111'
  } as React.CSSProperties,

  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  } as React.CSSProperties,

  cardIcon: {
    width: '1rem',
    height: '1rem',
    color: '#F1C232'
  } as React.CSSProperties,

  cardName: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600
  } as React.CSSProperties,

  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  } as React.CSSProperties,

  statusSelect: {
    padding: '0.25rem 0.5rem',
    border: '1px solid',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer'
  } as React.CSSProperties,

  deleteButton: {
    background: 'transparent',
    border: '1px solid #dc2626',
    color: '#dc2626',
    borderRadius: '0.25rem',
    padding: '0.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as React.CSSProperties,

  cardContent: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  } as React.CSSProperties,

  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#d1d5db'
  } as React.CSSProperties,

  time: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginLeft: '0.5rem',
    padding: '0.125rem 0.375rem',
    backgroundColor: 'rgba(241, 194, 50, 0.1)',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    color: '#F1C232'
  } as React.CSSProperties,

  messageRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #333'
  } as React.CSSProperties,

  message: {
    fontSize: '0.875rem',
    color: '#a0a0a0',
    fontStyle: 'italic',
    lineHeight: 1.4
  } as React.CSSProperties,

  metaInfo: {
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between'
  } as React.CSSProperties,

  meta: {
    color: '#6b7280',
    fontSize: '0.75rem'
  } as React.CSSProperties,

  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem'
  } as React.CSSProperties,

  spinner: {
    width: '3rem',
    height: '3rem',
    border: '3px solid rgba(241, 194, 50, 0.3)',
    borderTop: '3px solid #F1C232',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  } as React.CSSProperties,

  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem',
    textAlign: 'center' as const,
    color: '#6b7280'
  } as React.CSSProperties,

  emptyIcon: {
    width: '4rem',
    height: '4rem',
    color: '#333'
  } as React.CSSProperties
};