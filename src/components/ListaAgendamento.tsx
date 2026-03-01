import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  User, 
  Car, 
  Phone, 
  Mail, 
  Wrench, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Trash2,
  CheckCircle,
  Filter,
  Search
} from "lucide-react";

interface Agendamento {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  veiculo: string;
  servico: string;
  dataPreferencial: string;
  dataFormatada: string;
  horarioPreferencial: string;
  mensagem: string;
  status: string;
}

export const ListaAgendamento = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroBusca, setFiltroBusca] = useState<string>("");
  const [filtroData, setFiltroData] = useState<string>("");
  
  const [ordenarPor, setOrdenarPor] = useState<string>("data");
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  const API_BASE_URL = "http://localhost:5000";

  // Buscar agendamentos da API
  const buscarAgendamentos = async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      console.log("📥 Buscando agendamentos da API...");
      const response = await fetch(`${API_BASE_URL}/agendamentos/`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📦 Dados recebidos da API:", data);
      
      if (Array.isArray(data)) {
        const ordenados = data.sort((a: Agendamento, b: Agendamento) => b.id - a.id);
        setAgendamentos(ordenados);
      } else {
        console.error("Dados recebidos não são um array:", data);
        setAgendamentos([]);
      }
      
    } catch (error) {
      console.error("❌ Erro ao carregar agendamentos:", error);
      setErro("Erro ao carregar agendamentos. Verifique se o servidor está rodando.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarAgendamentos();
  }, []);

  // ✅ FUNÇÃO DE FILTRO CORRIGIDA - aplica sempre que as dependências mudam
  useEffect(() => {
    console.log("🔍 Aplicando filtros...");
    console.log("📋 Total de agendamentos:", agendamentos.length);
    console.log("🔎 Termo de busca:", filtroBusca);
    console.log("📋 Status filtro:", filtroStatus);
    console.log("📅 Data filtro:", filtroData);
    
    if (agendamentos.length === 0) {
      setAgendamentosFiltrados([]);
      return;
    }

    let resultado = [...agendamentos];

    // Filtrar por status
    if (filtroStatus !== "todos") {
      resultado = resultado.filter(ag => ag.status === filtroStatus);
      console.log(`✅ Filtro por status: ${resultado.length} resultados`);
    }

    // Filtrar por busca (nome, email, veículo, serviço, ID)
    if (filtroBusca.trim()) {
      const termo = filtroBusca.toLowerCase().trim();
      console.log("🔎 Termo de busca em minúsculas:", termo);
      
      resultado = resultado.filter(ag => {
        // Log para debug
        console.log(`Verificando agendamento ID ${ag.id}:`, {
          nome: ag.nome,
          nomeMatch: ag.nome?.toLowerCase().includes(termo),
          email: ag.email,
          emailMatch: ag.email?.toLowerCase().includes(termo),
          veiculo: ag.veiculo,
          veiculoMatch: ag.veiculo?.toLowerCase().includes(termo)
        });

        // Verificar se o termo é um número (possível ID)
        const termoNumero = parseInt(termo);
        const matchesId = !isNaN(termoNumero) && ag.id === termoNumero;
        
        const matchesNome = ag.nome?.toLowerCase().includes(termo) || false;
        const matchesEmail = ag.email?.toLowerCase().includes(termo) || false;
        const matchesVeiculo = ag.veiculo?.toLowerCase().includes(termo) || false;
        const matchesServico = ag.servico?.toLowerCase().includes(termo) || false;
        const matchesTelefone = ag.telefone?.includes(termo) || false;
        
        return matchesId || matchesNome || matchesEmail || matchesVeiculo || matchesServico || matchesTelefone;
      });
      
      console.log(`✅ Filtro por busca: ${resultado.length} resultados`);
    }

    // Filtrar por data específica
    if (filtroData) {
      resultado = resultado.filter(ag => ag.dataPreferencial === filtroData);
      console.log(`✅ Filtro por data: ${resultado.length} resultados`);
    }

    // Ordenar
    resultado.sort((a, b) => {
      let comparacao = 0;
      
      switch (ordenarPor) {
        case "data":
          comparacao = (a.dataPreferencial || "").localeCompare(b.dataPreferencial || "");
          break;
        case "nome":
          comparacao = (a.nome || "").localeCompare(b.nome || "");
          break;
        case "status":
          comparacao = (a.status || "").localeCompare(b.status || "");
          break;
        case "id":
          comparacao = a.id - b.id;
          break;
        default:
          comparacao = 0;
      }
      
      return ordemAscendente ? comparacao : -comparacao;
    });

    console.log("📊 Total após filtros:", resultado.length);
    setAgendamentosFiltrados(resultado);
  }, [agendamentos, filtroStatus, filtroBusca, filtroData, ordenarPor, ordemAscendente]);

  // ✅ FUNÇÃO DELETE
  const excluirAgendamento = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;
    
    setExcluindo(id);
    setMensagemSucesso(null);
    setErro(null);
    
    try {
      console.log("🗑️ Tentando excluir agendamento ID:", id);
      
      const url = `${API_BASE_URL}/agendamentos/${id}`;
      console.log("🔍 URL completa:", url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("📥 Status da resposta DELETE:", response.status);

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = { message: await response.text() };
      }
      
      console.log("📦 Resposta da API:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Erro ${response.status} ao excluir`);
      }

      console.log("✅ Agendamento excluído com sucesso!");
      
      // Atualizar lista
      const novaLista = agendamentos.filter(ag => ag.id !== id);
      setAgendamentos(novaLista);
      setMensagemSucesso(`Agendamento #${id} excluído com sucesso!`);
      
      setTimeout(() => setMensagemSucesso(null), 3000);
      
    } catch (error) {
      console.error("❌ Erro detalhado ao excluir:", error);
      
      if (error instanceof Error && error.message.includes("404")) {
        const novaLista = agendamentos.filter(ag => ag.id !== id);
        setAgendamentos(novaLista);
        setMensagemSucesso(`Agendamento #${id} já foi excluído anteriormente.`);
        setTimeout(() => setMensagemSucesso(null), 3000);
      } else {
        setErro(error instanceof Error ? error.message : 'Erro ao excluir agendamento');
      }
      
    } finally {
      setExcluindo(null);
    }
  };

  const testarDelete = async () => {
    const idTeste = prompt("Digite o ID do agendamento para testar exclusão:");
    if (idTeste) {
      const id = parseInt(idTeste);
      if (!isNaN(id)) {
        await excluirAgendamento(id);
      }
    }
  };

  const verificarIds = () => {
    const ids = agendamentos.map(ag => ag.id);
    console.log("📋 IDs na lista atual:", ids);
    alert(`IDs disponíveis: ${ids.join(', ')}`);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente': return '#f59e0b';
      case 'confirmado': return '#10B981';
      case 'concluído': return '#3b82f6';
      case 'cancelado': return '#ef4444';
      default: return '#6B7280';
    }
  };

  const limparFiltros = () => {
    setFiltroStatus("todos");
    setFiltroBusca("");
    setFiltroData("");
    setOrdenarPor("data");
    setOrdemAscendente(true);
  };

  const formatarDataHora = (dataFormatada: string, horario: string) => {
    if (!dataFormatada) return "Data não informada";
    return `${dataFormatada} às ${horario || "00:00"}`;
  };

  return (
    <div style={styles.container}>
      {/* Cabeçalho */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Calendar style={styles.headerIcon} />
          <h3 style={styles.title}>LISTA DE AGENDAMENTOS</h3>
        </div>
        <div style={styles.headerRight}>
          <button 
            onClick={buscarAgendamentos} 
            style={styles.refreshButton}
            title="Atualizar lista"
            disabled={carregando}
          >
            <RefreshCw size={18} className={carregando ? "spin" : ""} />
          </button>
          
          <button 
            onClick={verificarIds}
            style={styles.infoButton}
            title="Verificar IDs disponíveis"
          >
            <span style={{ fontSize: '1rem' }}>🔍</span>
          </button>
          
          <button 
            onClick={testarDelete}
            style={styles.testButton}
            title="Testar delete com ID específico"
          >
            <Trash2 size={16} />
            <span style={{ fontSize: '0.8rem' }}>Teste</span>
          </button>
          
          <span style={styles.totalBadge}>
            {agendamentosFiltrados.length} de {agendamentos.length}
          </span>
        </div>
      </div>

      {/* Mensagens */}
      {mensagemSucesso && (
        <div style={styles.sucessoContainer}>
          <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
          <p style={styles.sucessoTexto}>{mensagemSucesso}</p>
        </div>
      )}

      {erro && (
        <div style={styles.erroContainer}>
          <AlertCircle size={20} style={{ marginRight: '0.5rem' }} />
          <p style={styles.erroTexto}>{erro}</p>
          <button onClick={() => setErro(null)} style={styles.erroFechar}>×</button>
        </div>
      )}

      {/* Filtros */}
      <div style={styles.filtrosContainer}>
        <div style={styles.filtrosRow}>
          {/* Busca */}
          <div style={styles.buscaContainer}>
            <Search size={16} style={styles.buscaIcon} />
            <input
              type="text"
              placeholder="Buscar por nome, email, veículo, ID..."
              value={filtroBusca}
              onChange={(e) => {
                console.log("📝 Input mudou:", e.target.value);
                setFiltroBusca(e.target.value);
              }}
              style={styles.buscaInput}
            />
          </div>

          {/* Filtro por status */}
          <select 
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={styles.filtroSelect}
          >
            <option value="todos">Todos os status</option>
            <option value="pendente">Pendentes</option>
            <option value="confirmado">Confirmados</option>
            <option value="concluído">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </select>

          {/* Filtro por data */}
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            style={styles.dataInput}
            placeholder="Filtrar por data"
          />

          {/* Botão limpar filtros */}
          <button 
            onClick={limparFiltros}
            style={styles.limparFiltrosButton}
            title="Limpar filtros"
          >
            <Filter size={16} />
            <span>Limpar</span>
          </button>
        </div>

        {/* Ordenação */}
        <div style={styles.ordenacaoContainer}>
          <span style={styles.ordenacaoLabel}>Ordenar por:</span>
          <select 
            value={ordenarPor} 
            onChange={(e) => setOrdenarPor(e.target.value)}
            style={styles.ordenacaoSelect}
          >
            <option value="data">Data</option>
            <option value="nome">Nome</option>
            <option value="status">Status</option>
            <option value="id">ID</option>
          </select>
          
          <button 
            onClick={() => setOrdemAscendente(!ordemAscendente)}
            style={styles.ordemButton}
            title={ordemAscendente ? "Ordem crescente" : "Ordem decrescente"}
          >
            {ordemAscendente ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {carregando && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p>Carregando agendamentos...</p>
        </div>
      )}

      {/* Lista vazia */}
      {!carregando && agendamentosFiltrados.length === 0 && (
        <div style={styles.vazioContainer}>
          <Calendar size={48} style={{ color: '#666', marginBottom: '1rem' }} />
          <p style={styles.vazioTexto}>Nenhum agendamento encontrado</p>
          {(filtroStatus !== "todos" || filtroBusca || filtroData) && (
            <button onClick={limparFiltros} style={styles.limparButton}>
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Lista de Agendamentos */}
      {!carregando && agendamentosFiltrados.length > 0 && (
        <div style={styles.listaContainer}>
          {agendamentosFiltrados.map((agendamento) => (
            <div key={agendamento.id} style={styles.card}>
              {/* Cabeçalho do Card */}
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderInfo}>
                  <span style={styles.cardId}>#{agendamento.id}</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(agendamento.status)
                  }}>
                    {agendamento.status || "pendente"}
                  </span>
                </div>
                <button
                  onClick={() => excluirAgendamento(agendamento.id)}
                  disabled={excluindo === agendamento.id}
                  style={{
                    ...styles.excluirButton,
                    opacity: excluindo === agendamento.id ? 0.5 : 1,
                    cursor: excluindo === agendamento.id ? 'not-allowed' : 'pointer'
                  }}
                  title="Excluir agendamento"
                >
                  {excluindo === agendamento.id ? (
                    <div style={styles.spinnerPequeno} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>

              {/* Corpo do Card */}
              <div style={styles.cardBody}>
                <div style={styles.cardRow}>
                  <div style={styles.cardItem}>
                    <User size={14} style={styles.cardIcon} />
                    <span style={styles.cardLabel}>Nome:</span>
                    <span style={styles.cardValue}>{agendamento.nome || "—"}</span>
                  </div>
                  <div style={styles.cardItem}>
                    <Phone size={14} style={styles.cardIcon} />
                    <span style={styles.cardLabel}>Telefone:</span>
                    <span style={styles.cardValue}>{agendamento.telefone || "—"}</span>
                  </div>
                </div>

                <div style={styles.cardRow}>
                  <div style={styles.cardItem}>
                    <Mail size={14} style={styles.cardIcon} />
                    <span style={styles.cardLabel}>Email:</span>
                    <span style={styles.cardValue}>{agendamento.email || "—"}</span>
                  </div>
                  <div style={styles.cardItem}>
                    <Car size={14} style={styles.cardIcon} />
                    <span style={styles.cardLabel}>Veículo:</span>
                    <span style={styles.cardValue}>{agendamento.veiculo || "—"}</span>
                  </div>
                </div>

                <div style={styles.cardRow}>
                  <div style={styles.cardItem}>
                    <Wrench size={14} style={styles.cardIcon} />
                    <span style={styles.cardLabel}>Serviço:</span>
                    <span style={styles.cardValue}>{agendamento.servico || "—"}</span>
                  </div>
                  <div style={styles.cardItem}>
                    <Clock size={14} style={styles.cardIcon} />
                    <span style={styles.cardLabel}>Data/Hora:</span>
                    <span style={styles.cardValue}>
                      {formatarDataHora(agendamento.dataFormatada, agendamento.horarioPreferencial)}
                    </span>
                  </div>
                </div>

                {agendamento.mensagem && (
                  <div style={styles.cardMensagem}>
                    <span style={styles.cardLabel}>Mensagem:</span>
                    <p style={styles.cardMensagemTexto}>{agendamento.mensagem}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Estilos (mantidos iguais)
const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    border: '1px solid #333',
    color: '#fff'
  } as React.CSSProperties,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  } as React.CSSProperties,

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  } as React.CSSProperties,

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  } as React.CSSProperties,

  headerIcon: {
    width: '1.5rem',
    height: '1.5rem',
    color: '#F1C232'
  } as React.CSSProperties,

  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#F1C232'
  } as React.CSSProperties,

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    cursor: 'pointer'
  } as React.CSSProperties,

  infoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#F1C232',
    cursor: 'pointer'
  } as React.CSSProperties,

  testButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.9rem'
  } as React.CSSProperties,

  totalBadge: {
    backgroundColor: '#F1C232',
    color: '#000',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontSize: '0.9rem',
    fontWeight: 600
  } as React.CSSProperties,

  filtrosContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1.5rem'
  } as React.CSSProperties,

  filtrosRow: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap' as const
  } as React.CSSProperties,

  buscaContainer: {
    flex: 1,
    position: 'relative' as const,
    minWidth: '200px'
  } as React.CSSProperties,

  buscaIcon: {
    position: 'absolute' as const,
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666'
  } as React.CSSProperties,

  buscaInput: {
    width: '100%',
    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none'
  } as React.CSSProperties,

  filtroSelect: {
    padding: '0.75rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '150px'
  } as React.CSSProperties,

  dataInput: {
    padding: '0.75rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    minWidth: '140px'
  } as React.CSSProperties,

  limparFiltrosButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#F1C232',
    fontSize: '0.95rem',
    cursor: 'pointer'
  } as React.CSSProperties,

  ordenacaoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #333'
  } as React.CSSProperties,

  ordenacaoLabel: {
    color: '#9ca3af',
    fontSize: '0.9rem'
  } as React.CSSProperties,

  ordenacaoSelect: {
    padding: '0.5rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer'
  } as React.CSSProperties,

  ordemButton: {
    width: '2rem',
    height: '2rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer'
  } as React.CSSProperties,

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    gap: '1rem',
    color: '#a0a0a0'
  } as React.CSSProperties,

  vazioContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666'
  } as React.CSSProperties,

  vazioTexto: {
    fontSize: '1rem',
    marginBottom: '1rem'
  } as React.CSSProperties,

  limparButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#F1C232',
    color: '#000',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer'
  } as React.CSSProperties,

  listaContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    maxHeight: '500px',
    overflowY: 'auto' as const,
    paddingRight: '0.5rem'
  } as React.CSSProperties,

  card: {
    backgroundColor: '#0a0a0a',
    borderRadius: '0.5rem',
    border: '1px solid #333',
    overflow: 'hidden'
  } as React.CSSProperties,

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    borderBottom: '1px solid #333'
  } as React.CSSProperties,

  cardHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  } as React.CSSProperties,

  cardId: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#F1C232'
  } as React.CSSProperties,

  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#fff'
  } as React.CSSProperties,

  excluirButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.375rem'
  } as React.CSSProperties,

  cardBody: {
    padding: '1rem'
  } as React.CSSProperties,

  cardRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '0.75rem'
  } as React.CSSProperties,

  cardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  } as React.CSSProperties,

  cardIcon: {
    color: '#F1C232',
    flexShrink: 0
  } as React.CSSProperties,

  cardLabel: {
    color: '#9ca3af',
    marginRight: '0.25rem'
  } as React.CSSProperties,

  cardValue: {
    color: '#fff',
    wordBreak: 'break-all' as const
  } as React.CSSProperties,

  cardMensagem: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '0.375rem',
    border: '1px solid #333'
  } as React.CSSProperties,

  cardMensagemTexto: {
    color: '#d1d5db',
    fontSize: '0.9rem',
    marginTop: '0.25rem',
    lineHeight: 1.5
  } as React.CSSProperties,

  sucessoContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#10B981',
    color: '#fff',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem'
  } as React.CSSProperties,

  sucessoTexto: {
    flex: 1
  } as React.CSSProperties,

  erroContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    color: '#fff',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    position: 'relative' as const
  } as React.CSSProperties,

  erroTexto: {
    flex: 1
  } as React.CSSProperties,

  erroFechar: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer'
  } as React.CSSProperties,

  spinner: {
    width: '2rem',
    height: '2rem',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid #F1C232',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  } as React.CSSProperties,

  spinnerPequeno: {
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #ef4444',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  } as React.CSSProperties
};

// Animação do spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spin {
      animation: spin 1s linear infinite;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ListaAgendamento;