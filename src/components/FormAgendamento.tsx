import React, { useState } from "react";
import { Calendar, User, Car, MessageSquare, Send, Clock, CheckCircle } from "lucide-react";

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
  id: string;
  horario: string;
  disponivel: boolean;
  vagas_restantes?: number;
}

const servicos = [
  "Detalhamento Completo",
  "Proteção PPF (Película)",
  "Ceramic Coating",
  "Personalização",
  "Performance",
  "Outro"
];

// Horários disponíveis para seleção
const horariosDisponiveis = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00"
];

export const FormAgendamento = () => {
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
  
  // Estados para controle de disponibilidade
  const [horariosDisponiveisAPI, setHorariosDisponiveisAPI] = useState<HorarioDisponivel[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<string>("");

  // Buscar horários disponíveis quando a data mudar
  const buscarHorariosDisponiveis = async (data: string) => {
    if (!data) return;
    
    setCarregandoHorarios(true);
    setDataSelecionada(data);
    
    try {
      const API_URL = 'http://localhost:5000/agendamentos/horarios-disponiveis';
      const response = await fetch(`${API_URL}/${data}`);
      
      if (response.ok) {
        const horarios = await response.json();
        setHorariosDisponiveisAPI(horarios);
        
        // Se o horário selecionado não estiver mais disponível, limpar seleção
        if (formData.horarioPreferencial) {
          const horarioSelecionado = horarios.find((h: HorarioDisponivel) => 
            h.horario === formData.horarioPreferencial
          );
          if (!horarioSelecionado?.disponivel) {
            setFormData(prev => ({ ...prev, horarioPreferencial: "" }));
          }
        }
      }
    } catch (error) {
      console.warn("Erro ao buscar horários disponíveis:", error);
      // Fallback: todos os horários como disponíveis
      setHorariosDisponiveisAPI(
        horariosDisponiveis.map(horario => ({
          id: `${horario}-${data}`,
          horario,
          disponivel: true,
          vagas_restantes: 3
        }))
      );
    } finally {
      setCarregandoHorarios(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Se for mudança de data, buscar horários disponíveis
    if (name === 'dataPreferencial' && value) {
      buscarHorariosDisponiveis(value);
    }

    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setErrorMessage("");
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    } else if (formData.nome.length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (!/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}-?[0-9]{4}$/.test(formData.telefone.replace(/\D/g, ''))) {
      newErrors.telefone = "Telefone inválido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.veiculo.trim()) {
      newErrors.veiculo = "Veículo é obrigatório";
    }

    if (!formData.servico) {
      newErrors.servico = "Serviço é obrigatório";
    }

    if (formData.dataPreferencial) {
      const selectedDate = new Date(formData.dataPreferencial);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dataPreferencial = "Data não pode ser no passado";
      }
    }

    // Verificar se o horário selecionado está disponível
    if (formData.dataPreferencial && formData.horarioPreferencial) {
      const horarioSelecionado = horariosDisponiveisAPI.find(
        h => h.horario === formData.horarioPreferencial
      );
      if (horarioSelecionado && !horarioSelecionado.disponivel) {
        newErrors.horarioPreferencial = "Este horário não está mais disponível";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Preparar dados para a API
      const dadosParaEnvio: Agendamento = {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        veiculo: formData.veiculo,
        servico: formData.servico,
        dataPreferencial: formData.dataPreferencial,
        dataFormatada: formData.dataPreferencial 
          ? new Date(formData.dataPreferencial).toLocaleDateString('pt-BR')
          : "Não informada",
        horarioPreferencial: formData.horarioPreferencial,
        mensagem: formData.mensagem,
        timestamp: new Date().toISOString(),
        status: "pendente"
      };

      console.log("📤 Enviando para API:", dadosParaEnvio);
      
      // Enviar para o backend Flask
      const API_URL = 'http://localhost:5000/agendamentos/agendamentos';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnvio),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao salvar agendamento");
      }

      const responseData = await response.json();
      console.log("✅ Resposta da API:", responseData);
      
      // Armazenar resposta
      setApiResponse(responseData.agendamento || responseData);
      setSubmitSuccess(true);
      
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Erro ao conectar com o servidor. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
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
    setHorariosDisponiveisAPI([]);
    setDataSelecionada("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <Calendar style={styles.titleIcon} />
          SOLICITAR AGENDAMENTO
        </h3>
        <p style={styles.subtitle}>
          Preencha o formulário abaixo e entraremos em contato para confirmar o agendamento.
        </p>
      </div>

      {errorMessage && (
        <div style={styles.apiError}>
          <strong>❌ Erro:</strong> {errorMessage}
        </div>
      )}

      {submitSuccess ? (
        <div style={styles.successMessage}>
          <div style={styles.successIcon}>
            <CheckCircle size={48} />
          </div>
          <h4 style={styles.successTitle}>Agendamento Confirmado!</h4>
          
          <div style={styles.successDetails}>
            <p style={styles.successText}>
              Seu agendamento foi registrado com sucesso!
            </p>
            
            {/* Detalhes do agendamento */}
            {apiResponse && (
              <div style={styles.apiDetails}>
                <p style={styles.apiDetailsTitle}>
                  <strong>📋 Detalhes do Agendamento:</strong>
                </p>
                <div style={styles.apiDetailsContent}>
                  <div><strong>ID:</strong> {apiResponse.id}</div>
                  <div><strong>Status:</strong> 
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      fontSize: '0.8rem',
                      marginLeft: '5px',
                      fontWeight: 'bold'
                    }}>
                      {apiResponse.status}
                    </span>
                  </div>
                  <div><strong>Data/Hora:</strong> {new Date(apiResponse.timestamp).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            )}
            
            {/* Resumo do agendamento */}
            <div style={styles.successDetails}>
              <strong>📋 Resumo do seu agendamento:</strong><br />
              <div style={{marginTop: '0.5rem', lineHeight: 1.8}}>
                <div><strong>Nome:</strong> {apiResponse?.nome}</div>
                <div><strong>Telefone:</strong> {apiResponse?.telefone}</div>
                <div><strong>Email:</strong> {apiResponse?.email}</div>
                <div><strong>Veículo:</strong> {apiResponse?.veiculo}</div>
                <div><strong>Serviço:</strong> {apiResponse?.servico}</div>
                {apiResponse?.dataFormatada && apiResponse.dataFormatada !== "Não informada" && (
                  <div>
                    <strong>Data preferencial:</strong> {apiResponse.dataFormatada}
                    {apiResponse?.horarioPreferencial && ` às ${apiResponse.horarioPreferencial}`}
                  </div>
                )}
                {apiResponse?.mensagem && (
                  <div>
                    <strong>Mensagem:</strong> {apiResponse.mensagem}
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
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            {/* Nome */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User style={styles.labelIcon} />
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
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
                required
                style={{
                  ...styles.input,
                  borderColor: errors.telefone ? '#dc2626' : '#333'
                }}
                placeholder="(83) 99999-9999"
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
                required
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
                <Car style={styles.labelIcon} />
                Veículo *
              </label>
              <input
                type="text"
                name="veiculo"
                value={formData.veiculo}
                onChange={handleChange}
                required
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
                required
                style={{
                  ...styles.select,
                  borderColor: errors.servico ? '#dc2626' : '#333'
                }}
              >
                <option value="">Selecione um serviço</option>
                {servicos.map((servico, index) => (
                  <option key={index} value={servico}>{servico}</option>
                ))}
              </select>
              {errors.servico && <span style={styles.error}>{errors.servico}</span>}
            </div>

            {/* Data Preferencial */}
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
                required
                style={{
                  ...styles.input,
                  borderColor: errors.dataPreferencial ? '#dc2626' : '#333'
                }}
              />
              {errors.dataPreferencial && <span style={styles.error}>{errors.dataPreferencial}</span>}
            </div>
          </div>

          {/* Horários disponíveis - aparece apenas quando uma data é selecionada */}
          {formData.dataPreferencial && (
            <div style={styles.horariosSection}>
              <label style={styles.label}>
                <Clock style={styles.labelIcon} />
                Horários Disponíveis para {new Date(formData.dataPreferencial).toLocaleDateString('pt-BR')}
              </label>
              
              {carregandoHorarios ? (
                <div style={styles.carregandoContainer}>
                  <div style={styles.spinner} />
                  <p>Carregando horários...</p>
                </div>
              ) : (
                <div style={styles.horariosGrid}>
                  {horariosDisponiveisAPI.length > 0 ? (
                    horariosDisponiveisAPI.map((horario) => (
                      <button
                        key={horario.id}
                        type="button"
                        onClick={() => {
                          if (horario.disponivel) {
                            setFormData(prev => ({
                              ...prev,
                              horarioPreferencial: horario.horario
                            }));
                            setErrors(prev => ({ ...prev, horarioPreferencial: undefined }));
                          }
                        }}
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
                          borderColor: horario.disponivel ? '#333' : '#222'
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
                    ))
                  ) : (
                    <p style={styles.semHorarios}>Nenhum horário disponível para esta data.</p>
                  )}
                </div>
              )}
              {errors.horarioPreferencial && (
                <span style={styles.error}>{errors.horarioPreferencial}</span>
              )}
            </div>
          )}

          {/* Mensagem */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <MessageSquare style={styles.labelIcon} />
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

          {/* Botão de Enviar */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.horarioPreferencial}
            style={{
              ...styles.submitButton,
              backgroundColor: isSubmitting || !formData.horarioPreferencial ? '#666' : '#F1C232',
              cursor: isSubmitting || !formData.horarioPreferencial ? 'not-allowed' : 'pointer',
              opacity: !formData.horarioPreferencial ? 0.7 : 1
            }}
          >
            {isSubmitting ? (
              <>
                <div style={styles.spinner} />
                Salvando agendamento...
              </>
            ) : (
              <>
                <Send style={styles.buttonIcon} />
                {formData.horarioPreferencial 
                  ? `Confirmar Agendamento para ${formData.horarioPreferencial}`
                  : "Selecione um horário para continuar"
                }
              </>
            )}
          </button>

          <p style={styles.disclaimer}>
            * Campos obrigatórios. Selecione uma data e horário disponíveis.
          </p>
        </form>
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

  titleIcon: {
    width: '1.5rem',
    height: '1.5rem'
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

  labelIcon: {
    width: '1rem',
    height: '1rem',
    color: '#F1C232'
  } as React.CSSProperties,

  input: {
    padding: '0.75rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    fontFamily: 'inherit'
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
    transition: 'all 0.3s ease',
    width: '100%'
  } as React.CSSProperties,

  esgotadoLabel: {
    fontSize: '0.7rem',
    color: '#666'
  } as React.CSSProperties,

  vagasLabel: {
    fontSize: '0.7rem',
    color: '#10B981'
  } as React.CSSProperties,

  semHorarios: {
    gridColumn: 'span 4',
    textAlign: 'center' as const,
    color: '#666',
    padding: '1rem'
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
    backgroundColor: '#F1C232',
    color: '#000',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '1rem'
  } as React.CSSProperties,

  buttonIcon: {
    width: '1.25rem',
    height: '1.25rem'
  } as React.CSSProperties,

  spinner: {
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(0,0,0,0.3)',
    borderTop: '2px solid #000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  } as React.CSSProperties,

  error: {
    color: '#dc2626',
    fontSize: '0.75rem',
    marginTop: '0.25rem'
  } as React.CSSProperties,

  disclaimer: {
    fontSize: '0.8rem',
    color: '#666',
    textAlign: 'center' as const,
    marginTop: '1rem'
  } as React.CSSProperties,

  apiError: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid #dc2626',
    color: '#fca5a5',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem',
    fontSize: '0.9rem'
  } as React.CSSProperties,

  successMessage: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem'
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
    marginBottom: '0.75rem'
  } as React.CSSProperties,

  successText: {
    color: '#a0a0a0',
    marginBottom: '1rem',
    fontSize: '1rem'
  } as React.CSSProperties,

  successDetails: {
    color: '#d1d5db',
    backgroundColor: '#0a0a0a',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    marginBottom: '2rem',
    maxWidth: '500px',
    fontSize: '0.9rem',
    lineHeight: 1.8,
    textAlign: 'left' as const,
    width: '100%'
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
    transition: 'all 0.3s ease'
  } as React.CSSProperties,

  apiDetails: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid #3b82f6',
    color: '#93c5fd',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'left' as const
  } as React.CSSProperties,

  apiDetailsTitle: {
    color: '#3b82f6',
    marginBottom: '0.75rem',
    fontSize: '1rem'
  } as React.CSSProperties,

  apiDetailsContent: {
    fontSize: '0.9rem',
    lineHeight: 1.8
  } as React.CSSProperties
};

// Adicionar animação do spinner
if (typeof document !== 'undefined') {
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
    
    input[type="date"]::-webkit-datetime-edit {
      color: #fff;
    }
    
    input[type="date"]::-webkit-datetime-edit-fields-wrapper {
      color: #fff;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default FormAgendamento;