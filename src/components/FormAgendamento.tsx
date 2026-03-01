import React, { useState, useEffect, useCallback } from "react";
import { 
  Calendar, 
  User, 
  Car, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle, 
  Eye,
  AlertCircle,
  Loader2,
  XCircle
} from "lucide-react";

// ========== CONFIGURAÇÃO ==========
// URL fixa para desenvolvimento - sem dependência de process.env
const API_BASE_URL = 'http://localhost:5000';

// ========== TIPOS ==========
interface FormData {
  nome: string;
  telefone: string;
  email: string;
  veiculo: string;
  servico: string;
  dataPreferencial: string;
  horarioPreferencial: string;
  mensagem: string;
}

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

interface HorarioDisponivel {
  horario: string;
  disponivel: boolean;
  vagas_restantes?: number;
}

// ========== CONSTANTES ==========
const SERVICOS = [
  { id: 'detalhamento', label: 'Detalhamento Completo' },
  { id: 'ppf', label: 'Proteção PPF (Película)' },
  { id: 'ceramic', label: 'Ceramic Coating' },
  { id: 'personalizacao', label: 'Personalização' },
  { id: 'performance', label: 'Performance' },
  { id: 'outro', label: 'Outro' }
] as const;

const HORARIOS_FIXOS = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00"
] as const;

// ========== COMPONENTE PRINCIPAL ==========
export const FormAgendamento: React.FC = () => {
  // Estados
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    telefone: "",
    email: "",
    veiculo: "",
    servico: "",
    dataPreferencial: "",
    horarioPreferencial: "",
    mensagem: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState<Agendamento | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [mostrarLista, setMostrarLista] = useState(false);
  const [listaAgendamentos, setListaAgendamentos] = useState<Agendamento[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(false);
  
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<HorarioDisponivel[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  // ========== FUNÇÕES UTILITÁRIAS ==========
  const getMinDate = useCallback((): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const getMaxDate = useCallback((): string => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  }, []);

  const formatarTelefone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatarData = (dataISO: string): string => {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // ========== VALIDAÇÕES ==========
  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarTelefone = (telefone: string): boolean => {
    const numbers = telefone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (!validarTelefone(formData.telefone)) {
      newErrors.telefone = "Telefone inválido";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validarEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!formData.veiculo.trim()) newErrors.veiculo = "Veículo é obrigatório";
    if (!formData.servico) newErrors.servico = "Serviço é obrigatório";
    if (!formData.dataPreferencial) newErrors.dataPreferencial = "Data é obrigatória";
    if (!formData.horarioPreferencial) newErrors.horarioPreferencial = "Horário é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ========== REQUISIÇÕES API ==========
  const buscarHorariosDisponiveis = useCallback(async (data: string) => {
    if (!data) return;
    
    setCarregandoHorarios(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/horarios-disponiveis/${data}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const horarios: HorarioDisponivel[] = await response.json();
      setHorariosDisponiveis(horarios);

      // Limpar horário selecionado se não estiver mais disponível
      if (formData.horarioPreferencial) {
        const horarioSelecionado = horarios.find(h => h.horario === formData.horarioPreferencial);
        if (!horarioSelecionado?.disponivel) {
          setFormData(prev => ({ ...prev, horarioPreferencial: "" }));
        }
      }
    } catch (error) {
      console.warn("Erro ao buscar horários, usando dados mockados:", error);
      // Fallback para dados mockados
      setHorariosDisponiveis(
        HORARIOS_FIXOS.map(horario => ({
          horario,
          disponivel: true,
          vagas_restantes: 3
        }))
      );
    } finally {
      setCarregandoHorarios(false);
    }
  }, [formData.horarioPreferencial]);

  const carregarAgendamentos = async () => {
    setCarregandoLista(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agendamentos/`);
      if (response.ok) {
        const data = await response.json();
        setListaAgendamentos(data.agendamentos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setCarregandoLista(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const dadosParaEnvio = {
        ...formData,
        mensagem: formData.mensagem || ""
      };

      console.log("📤 Enviando:", dadosParaEnvio);
      
      const response = await fetch(`${API_BASE_URL}/agendamentos/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnvio),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Erro ${response.status}`);
      }

      console.log("✅ Resposta:", responseData);
      setApiResponse(responseData.agendamento);
      setSubmitSuccess(true);
      
    } catch (error) {
      console.error("❌ Erro:", error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setErrorMessage('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:5000');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("Erro inesperado ao processar agendamento");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== HANDLERS ==========
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formatação especial para telefone
    const processedValue = name === 'telefone' ? formatarTelefone(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Buscar horários quando data for selecionada
    if (name === 'dataPreferencial' && value) {
      buscarHorariosDisponiveis(value);
    }

    // Limpar erro do campo
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Limpar mensagem de erro geral
    setErrorMessage("");
  };

  const handleHorarioSelect = (horario: string) => {
    setFormData(prev => ({ ...prev, horarioPreferencial: horario }));
    setErrors(prev => ({ ...prev, horarioPreferencial: undefined }));
  };

  const handleNovoAgendamento = () => {
    setSubmitSuccess(false);
    setApiResponse(null);
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      veiculo: "",
      servico: "",
      dataPreferencial: "",
      horarioPreferencial: "",
      mensagem: ""
    });
    setHorariosDisponiveis([]);
    setErrors({});
  };

  const toggleLista = async () => {
    const novoEstado = !mostrarLista;
    setMostrarLista(novoEstado);
    if (novoEstado && listaAgendamentos.length === 0) {
      await carregarAgendamentos();
    }
  };

  // ========== EFEITOS ==========
  useEffect(() => {
    // Adicionar estilos globais
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
      }

      .fade-in {
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // ========== RENDERIZAÇÃO ==========
  if (submitSuccess && apiResponse) {
    return (
      <div style={styles.container}>
        <div style={styles.successMessage} className="fade-in">
          <div style={styles.successIcon}>
            <CheckCircle size={48} />
          </div>
          <h4 style={styles.successTitle}>Agendamento Confirmado!</h4>
          
          <div style={styles.successCard}>
            <p style={styles.successText}>
              Seu agendamento foi registrado com sucesso! Em breve entraremos em contato.
            </p>
            
            <div style={styles.detailsCard}>
              <h5 style={styles.detailsTitle}>📋 Detalhes do Agendamento</h5>
              
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>ID:</span>
                  <span style={styles.detailValue}>{apiResponse.id}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Status:</span>
                  <span style={styles.statusBadge}>{apiResponse.status}</span>
                </div>
                
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Nome:</span>
                  <span style={styles.detailValue}>{apiResponse.nome}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Telefone:</span>
                  <span style={styles.detailValue}>{apiResponse.telefone}</span>
                </div>
                
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Email:</span>
                  <span style={styles.detailValue}>{apiResponse.email}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Veículo:</span>
                  <span style={styles.detailValue}>{apiResponse.veiculo}</span>
                </div>
                
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Serviço:</span>
                  <span style={styles.detailValue}>{apiResponse.servico}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Data/Hora:</span>
                  <span style={styles.detailValue}>
                    {apiResponse.dataFormatada} às {apiResponse.horarioPreferencial}
                  </span>
                </div>
                
                {apiResponse.mensagem && (
                  <div style={styles.detailItemFull}>
                    <span style={styles.detailLabel}>Mensagem:</span>
                    <span style={styles.detailValue}>{apiResponse.mensagem}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              style={styles.successButton}
              onClick={handleNovoAgendamento}
            >
              Novo Agendamento
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={toggleLista}
            style={{
              ...styles.toggleListaButton,
              backgroundColor: mostrarLista ? '#dc2626' : '#F1C232',
              color: mostrarLista ? '#fff' : '#000'
            }}
          >
            <Eye size={20} />
            <span>
              {mostrarLista ? 'Ocultar Lista de Agendamentos' : 'Ver Lista de Agendamentos'}
            </span>
          </button>

          {mostrarLista && (
            <div style={{ marginTop: '1rem' }} className="fade-in">
              {carregandoLista ? (
                <div style={styles.carregandoContainer}>
                  <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  <p>Carregando agendamentos...</p>
                </div>
              ) : (
                <ListaAgendamentoComponent 
                  agendamentos={listaAgendamentos}
                  onRefresh={carregarAgendamentos}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <Calendar size={24} color="#F1C232" />
          SOLICITAR AGENDAMENTO
        </h3>
        <p style={styles.subtitle}>
          Preencha o formulário abaixo e entraremos em contato para confirmar o agendamento.
        </p>
      </div>

      {errorMessage && (
        <div style={styles.apiError} className="fade-in">
          <AlertCircle size={20} />
          <span style={{ flex: 1 }}>
            <strong>Erro:</strong> {errorMessage}
          </span>
          <button 
            onClick={() => setErrorMessage("")}
            style={styles.closeButton}
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          {/* Nome */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User size={16} color="#F1C232" />
              Nome Completo *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.nome ? '#dc2626' : '#333'
              }}
              placeholder="Seu nome completo"
            />
            {errors.nome && <span style={styles.error}>{errors.nome}</span>}
          </div>

          {/* Telefone */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              📞 Telefone *
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.telefone ? '#dc2626' : '#333'
              }}
              placeholder="(83) 99999-9999"
              maxLength={15}
            />
            {errors.telefone && <span style={styles.error}>{errors.telefone}</span>}
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              ✉️ Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.email ? '#dc2626' : '#333'
              }}
              placeholder="seu@email.com"
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          {/* Veículo */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Car size={16} color="#F1C232" />
              Veículo *
            </label>
            <input
              type="text"
              name="veiculo"
              value={formData.veiculo}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.veiculo ? '#dc2626' : '#333'
              }}
              placeholder="Ex: BMW M4, Porsche 911..."
            />
            {errors.veiculo && <span style={styles.error}>{errors.veiculo}</span>}
          </div>

          {/* Serviço */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              🛠️ Serviço Desejado *
            </label>
            <select
              name="servico"
              value={formData.servico}
              onChange={handleChange}
              style={{
                ...styles.select,
                borderColor: errors.servico ? '#dc2626' : '#333'
              }}
            >
              <option value="">Selecione um serviço</option>
              {SERVICOS.map(servico => (
                <option key={servico.id} value={servico.label}>
                  {servico.label}
                </option>
              ))}
            </select>
            {errors.servico && <span style={styles.error}>{errors.servico}</span>}
          </div>

          {/* Data */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              📅 Data Preferencial *
            </label>
            <input
              type="date"
              name="dataPreferencial"
              value={formData.dataPreferencial}
              onChange={handleChange}
              min={getMinDate()}
              max={getMaxDate()}
              style={{
                ...styles.input,
                borderColor: errors.dataPreferencial ? '#dc2626' : '#333'
              }}
            />
            {errors.dataPreferencial && <span style={styles.error}>{errors.dataPreferencial}</span>}
          </div>
        </div>

        {/* Horários Disponíveis */}
        {formData.dataPreferencial && (
          <div style={styles.horariosSection}>
            <label style={styles.label}>
              <Clock size={16} color="#F1C232" />
              Horários Disponíveis para {formatarData(formData.dataPreferencial)}
            </label>
            
            {carregandoHorarios ? (
              <div style={styles.carregandoContainer}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Carregando horários...</p>
              </div>
            ) : (
              <>
                <div style={styles.horariosGrid}>
                  {horariosDisponiveis.map((horario, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => horario.disponivel && handleHorarioSelect(horario.horario)}
                      style={{
                        ...styles.horarioButton,
                        backgroundColor: formData.horarioPreferencial === horario.horario
                          ? '#F1C232'
                          : horario.disponivel
                            ? '#1a1a1a'
                            : '#0a0a0a',
                        color: formData.horarioPreferencial === horario.horario
                          ? '#000'
                          : horario.disponivel ? '#fff' : '#666',
                        cursor: horario.disponivel ? 'pointer' : 'not-allowed',
                        opacity: horario.disponivel ? 1 : 0.5,
                        transform: formData.horarioPreferencial === horario.horario ? 'scale(1.02)' : 'scale(1)'
                      }}
                      disabled={!horario.disponivel}
                    >
                      {horario.horario}
                      {!horario.disponivel && (
                        <span style={styles.esgotadoLabel}>Esgotado</span>
                      )}
                      {horario.disponivel && horario.vagas_restantes && horario.vagas_restantes > 0 && (
                        <span style={styles.vagasLabel}>
                          {horario.vagas_restantes} {horario.vagas_restantes === 1 ? 'vaga' : 'vagas'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {errors.horarioPreferencial && (
                  <span style={styles.error}>{errors.horarioPreferencial}</span>
                )}
              </>
            )}
          </div>
        )}

        {/* Mensagem */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <MessageSquare size={16} color="#F1C232" />
            Mensagem / Observações
          </label>
          <textarea
            name="mensagem"
            value={formData.mensagem}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="Descreva qualquer necessidade especial ou observação importante..."
            rows={4}
          />
        </div>

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.horarioPreferencial}
          style={{
            ...styles.submitButton,
            backgroundColor: isSubmitting || !formData.horarioPreferencial ? '#666' : '#F1C232',
            cursor: isSubmitting || !formData.horarioPreferencial ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || !formData.horarioPreferencial ? 0.7 : 1
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Salvando agendamento...
            </>
          ) : (
            <>
              <Send size={20} />
              Confirmar Agendamento
            </>
          )}
        </button>
      </form>

      {/* Botão Ver Lista */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={toggleLista}
          style={{
            ...styles.toggleListaButton,
            backgroundColor: mostrarLista ? '#dc2626' : '#F1C232',
            color: mostrarLista ? '#fff' : '#000'
          }}
        >
          <Eye size={20} />
          <span>
            {mostrarLista ? 'Ocultar Lista de Agendamentos' : 'Ver Lista de Agendamentos'}
          </span>
        </button>

        {mostrarLista && (
          <div style={{ marginTop: '1rem' }} className="fade-in">
            {carregandoLista ? (
              <div style={styles.carregandoContainer}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Carregando agendamentos...</p>
              </div>
            ) : (
              <ListaAgendamentoComponent 
                agendamentos={listaAgendamentos}
                onRefresh={carregarAgendamentos}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ========== COMPONENTE LISTA DE AGENDAMENTOS ==========
interface ListaAgendamentoProps {
  agendamentos: Agendamento[];
  onRefresh: () => Promise<void>;
}

const ListaAgendamentoComponent: React.FC<ListaAgendamentoProps> = ({ agendamentos, onRefresh }) => {
  const [atualizando, setAtualizando] = useState(false);

  const handleRefresh = async () => {
    setAtualizando(true);
    await onRefresh();
    setAtualizando(false);
  };

  if (agendamentos.length === 0) {
    return (
      <div style={styles.listaVazia}>
        <p>Nenhum agendamento encontrado.</p>
        <button onClick={handleRefresh} style={styles.refreshButton}>
          {atualizando ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '↻ Atualizar'}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.listaContainer}>
      <div style={styles.listaHeader}>
        <h4 style={styles.listaTitle}>Agendamentos Recentes</h4>
        <button onClick={handleRefresh} style={styles.refreshButton} disabled={atualizando}>
          {atualizando ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '↻'}
        </button>
      </div>
      
      <div style={styles.listaGrid}>
        {agendamentos.map((agendamento) => (
          <div key={agendamento.id} style={styles.listaItem}>
            <div style={styles.listaItemHeader}>
              <span style={styles.listaItemNome}>{agendamento.nome}</span>
              <span style={styles.listaItemStatus}>{agendamento.status}</span>
            </div>
            <div style={styles.listaItemDetalhes}>
              <div><strong>Veículo:</strong> {agendamento.veiculo}</div>
              <div><strong>Serviço:</strong> {agendamento.servico}</div>
              <div><strong>Data:</strong> {agendamento.dataFormatada} às {agendamento.horarioPreferencial}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========== ESTILOS ==========
const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: '0.5rem',
    padding: '2rem',
    border: '1px solid #333',
    color: '#fff',
    maxWidth: '800px',
    margin: '0 auto'
  } as React.CSSProperties,

  header: {
    marginBottom: '2rem'
  } as React.CSSProperties,

  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#F1C232'
  } as React.CSSProperties,

  subtitle: {
    color: '#a0a0a0',
    fontSize: '0.95rem',
    lineHeight: 1.5
  } as React.CSSProperties,

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  } as React.CSSProperties,

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem'
  } as React.CSSProperties,

  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  } as React.CSSProperties,

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#fff'
  } as React.CSSProperties,

  input: {
    padding: '0.75rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease'
  } as React.CSSProperties,

  select: {
    padding: '0.75rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit'
  } as React.CSSProperties,

  textarea: {
    padding: '0.75rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    minHeight: '100px'
  } as React.CSSProperties,

  horariosSection: {
    marginTop: '1rem',
    padding: '1.5rem',
    backgroundColor: '#0a0a0a',
    borderRadius: '0.5rem'
  } as React.CSSProperties,

  horariosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
    marginTop: '1rem'
  } as React.CSSProperties,

  horarioButton: {
    padding: '0.75rem',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem',
    width: '100%',
    transition: 'all 0.2s ease'
  } as React.CSSProperties,

  esgotadoLabel: {
    fontSize: '0.7rem',
    color: '#666'
  } as React.CSSProperties,

  vagasLabel: {
    fontSize: '0.7rem',
    color: '#10B981'
  } as React.CSSProperties,

  carregandoContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1rem',
    color: '#a0a0a0'
  } as React.CSSProperties,

  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem 2rem',
    color: '#000',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '1rem',
    transition: 'all 0.2s ease'
  } as React.CSSProperties,

  error: {
    color: '#dc2626',
    fontSize: '0.75rem',
    marginTop: '0.25rem'
  } as React.CSSProperties,

  apiError: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid #dc2626',
    color: '#fca5a5',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    position: 'relative' as const
  } as React.CSSProperties,

  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#fca5a5',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as React.CSSProperties,

  successMessage: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '1rem'
  } as React.CSSProperties,

  successIcon: {
    width: '4rem',
    height: '4rem',
    color: '#10B981',
    marginBottom: '1.5rem'
  } as React.CSSProperties,

  successTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#10B981',
    marginBottom: '1rem'
  } as React.CSSProperties,

  successCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: '0.5rem',
    padding: '2rem',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto'
  } as React.CSSProperties,

  successText: {
    color: '#a0a0a0',
    marginBottom: '1.5rem',
    fontSize: '1rem',
    textAlign: 'center' as const
  } as React.CSSProperties,

  detailsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    border: '1px solid #333'
  } as React.CSSProperties,

  detailsTitle: {
    color: '#F1C232',
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #333'
  } as React.CSSProperties,

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem'
  } as React.CSSProperties,

  detailItem: {
    fontSize: '0.95rem',
    lineHeight: 1.6
  } as React.CSSProperties,

  detailItemFull: {
    gridColumn: 'span 2',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    marginTop: '0.5rem',
    padding: '1rem',
    backgroundColor: '#0a0a0a',
    borderRadius: '0.375rem',
    border: '1px solid #333'
  } as React.CSSProperties,

  detailLabel: {
    color: '#9ca3af',
    marginRight: '0.5rem'
  } as React.CSSProperties,

  detailValue: {
    color: '#fff',
    fontWeight: 500
  } as React.CSSProperties,

  statusBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#f59e0b',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginLeft: '0.5rem'
  } as React.CSSProperties,

  successButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#1a1a1a',
    color: '#F1C232',
    border: '1px solid #F1C232',
    borderRadius: '0.375rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s ease'
  } as React.CSSProperties,

  toggleListaButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '1rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  } as React.CSSProperties,

  // Estilos da lista
  listaContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    border: '1px solid #333'
  } as React.CSSProperties,

  listaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  } as React.CSSProperties,

  listaTitle: {
    color: '#F1C232',
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: 0
  } as React.CSSProperties,

  refreshButton: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease'
  } as React.CSSProperties,

  listaVazia: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666'
  } as React.CSSProperties,

  listaGrid: {
    display: 'grid',
    gap: '1rem'
  } as React.CSSProperties,

  listaItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: '0.375rem',
    padding: '1rem',
    border: '1px solid #333'
  } as React.CSSProperties,

  listaItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  } as React.CSSProperties,

  listaItemNome: {
    fontWeight: 600,
    color: '#F1C232'
  } as React.CSSProperties,

  listaItemStatus: {
    fontSize: '0.8rem',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#f59e0b',
    color: 'white'
  } as React.CSSProperties,

  listaItemDetalhes: {
    fontSize: '0.9rem',
    color: '#ccc',
    display: 'grid',
    gap: '0.25rem'
  } as React.CSSProperties
};

export default FormAgendamento;