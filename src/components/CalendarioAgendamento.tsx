import React, { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle } from "lucide-react";

interface HorarioDisponivel {
  id: string;
  horario: string;
  disponivel: boolean;
  vagas_restantes?: number;
}

interface DiaAgendamento {
  data: Date;
  dataStr: string;
  dia: string;
  diaNumero: string;
  mes: string;
  disponivel: boolean;
  horarios: HorarioDisponivel[];
}

interface FormData {
  nome: string;
  telefone: string;
  email: string;
  veiculo: string;
  servico: string;
  mensagem: string;
}

export const CalendarioAgendamento = () => {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [agendando, setAgendando] = useState(false);
  const [agendadoComSucesso, setAgendadoComSucesso] = useState(false);
  const [dias, setDias] = useState<DiaAgendamento[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    telefone: "",
    email: "",
    veiculo: "",
    servico: "",
    mensagem: ""
  });

  // URL base da API (ajuste se necessário)
  const API_BASE_URL = "http://localhost:5000";

  // Buscar horários disponíveis quando uma data é selecionada
  useEffect(() => {
    if (dataSelecionada) {
      buscarHorariosDisponiveis(dataSelecionada);
    }
  }, [dataSelecionada]);

  const buscarHorariosDisponiveis = async (data: Date) => {
    setCarregandoHorarios(true);
    setErro(null);
    
    try {
      const dataStr = data.toISOString().split('T')[0]; // YYYY-MM-DD
      console.log("Buscando horários para:", dataStr);
      
      const response = await fetch(`${API_BASE_URL}/agendamentos/horarios-disponiveis/${dataStr}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const horarios = await response.json();
      console.log("Horários recebidos:", horarios);
      
      // Atualizar os dias com os horários reais da API
      setDias(diasAtuais => 
        diasAtuais.map(dia => {
          if (dia.dataStr === dataStr) {
            return {
              ...dia,
              horarios: horarios
            };
          }
          return dia;
        })
      );
    } catch (error) {
      setErro("Não foi possível carregar os horários. Tente novamente.");
      console.error("Erro ao buscar horários:", error);
    } finally {
      setCarregandoHorarios(false);
    }
  };

  // Gerar dias do mês
  const gerarDiasDoMes = (): DiaAgendamento[] => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dias: DiaAgendamento[] = [];

    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(ano, mes, dia);
      const isPassado = data < hoje;
      const isFimDeSemana = data.getDay() === 0 || data.getDay() === 6;
      
      dias.push({
        data,
        dataStr: data.toISOString().split('T')[0],
        dia: diasDaSemana[data.getDay()],
        diaNumero: dia.toString().padStart(2, '0'),
        mes: meses[mes],
        disponivel: !isPassado && !isFimDeSemana,
        horarios: [] // Inicia vazio, será preenchido quando a data for selecionada
      });
    }

    return dias;
  };

  useEffect(() => {
    setDias(gerarDiasDoMes());
  }, [mesAtual]);

  const avancarMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const retrocederMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const selecionarData = (dia: DiaAgendamento) => {
    if (dia.disponivel) {
      setDataSelecionada(dia.data);
      setHorarioSelecionado(null);
    }
  };

  const validarFormulario = (): boolean => {
    if (!formData.nome.trim()) {
      setErro("Por favor, preencha seu nome.");
      return false;
    }
    if (!formData.telefone.trim()) {
      setErro("Por favor, preencha seu telefone.");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErro("Por favor, preencha um email válido.");
      return false;
    }
    if (!formData.veiculo.trim()) {
      setErro("Por favor, informe o veículo.");
      return false;
    }
    if (!formData.servico.trim()) {
      setErro("Por favor, informe o serviço desejado.");
      return false;
    }
    return true;
  };

    const confirmarAgendamento = async () => {
    console.log("🔍 Iniciando confirmação de agendamento");
    
    if (!dataSelecionada || !horarioSelecionado) {
      console.log("❌ Data ou horário não selecionado");
      setErro("Selecione uma data e horário.");
      return;
    }

    if (!validarFormulario()) {
      console.log("❌ Formulário inválido");
      return;
    }

    setAgendando(true);
    setErro(null);
    
    try {
      const dataStr = dataSelecionada.toISOString().split('T')[0];
      console.log("📅 Data formatada:", dataStr);
      
      const payload = {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        veiculo: formData.veiculo,
        servico: formData.servico,
        dataPreferencial: dataStr,
        horarioPreferencial: horarioSelecionado,
        mensagem: formData.mensagem || ""
      };
      
      console.log("📤 Payload a ser enviado:", payload);
      console.log("🌐 URL da API:", `${API_BASE_URL}/agendamentos/`);
      
      const response = await fetch(`${API_BASE_URL}/agendamentos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Status da resposta:", response.status);
      
      const result = await response.json();
      console.log("📦 Dados da resposta:", result);

      if (!response.ok) {
        throw new Error(result.message || `Erro HTTP: ${response.status}`);
      }

      console.log("✅ Agendamento criado com sucesso! ID:", result.agendamento?.id);
      
      // PRIMEIRO: Mostrar sucesso
      setSucesso("Agendamento realizado com sucesso!");
      setAgendadoComSucesso(true);
      
      // SEGUNDO: Buscar horários atualizados (mantendo os dados)
      await buscarHorariosDisponiveis(dataSelecionada);
      
      // TERCEIRO: Reset após 5 segundos (apenas se ainda estiver na tela de sucesso)
      setTimeout(() => {
        // Verificar se ainda está na tela de sucesso antes de resetar
        setAgendadoComSucesso(false);
        setSucesso(null);
        setDataSelecionada(null);
        setHorarioSelecionado(null);
        setFormData({
          nome: "",
          telefone: "",
          email: "",
          veiculo: "",
          servico: "",
          mensagem: ""
        });
      }, 5000);
      
    } catch (error) {
      console.error("❌ Erro detalhado:", error);
      setErro(error instanceof Error ? error.message : 'Erro ao confirmar agendamento');
    } finally {
      setAgendando(false);
    }
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const diaSelecionado = dataSelecionada 
    ? dias.find(d => d.dataStr === dataSelecionada.toISOString().split('T')[0])
    : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Calendar style={styles.headerIcon} />
        <h3 style={styles.title}>CALENDÁRIO DE AGENDAMENTOS</h3>
        <p style={styles.subtitle}>Selecione a data e horário disponíveis</p>
      </div>

      {/* Mensagens de erro/sucesso */}
      {erro && (
        <div style={styles.erroContainer}>
          <p style={styles.erroTexto}>{erro}</p>
          <button onClick={() => setErro(null)} style={styles.erroFechar}>×</button>
        </div>
      )}

      {sucesso && (
        <div style={styles.sucessoContainer}>
          <p style={styles.sucessoTexto}>{sucesso}</p>
        </div>
      )}

      {agendadoComSucesso ? (
        <div style={styles.successContainer}>
          <CheckCircle style={styles.successIcon} />
          <h4 style={styles.successTitle}>Agendamento Confirmado!</h4>
          <p style={styles.successText}>
            Seu agendamento para {dataSelecionada && formatarData(dataSelecionada)} 
            às {horarioSelecionado} foi confirmado.
          </p>
          <p style={styles.successNote}>
            Em breve entraremos em contato para confirmar.
          </p>
        </div>
      ) : (
        <>
          {/* Formulário de dados do cliente */}
          <div style={styles.formSection}>
            <h4 style={styles.formTitle}>Dados do Cliente</h4>
            <input
              type="text"
              placeholder="Nome completo *"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              style={styles.input}
              required
            />
            <input
              type="tel"
              placeholder="Telefone *"
              value={formData.telefone}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              style={styles.input}
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Veículo *"
              value={formData.veiculo}
              onChange={(e) => setFormData({...formData, veiculo: e.target.value})}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Serviço desejado *"
              value={formData.servico}
              onChange={(e) => setFormData({...formData, servico: e.target.value})}
              style={styles.input}
              required
            />
            <textarea
              placeholder="Mensagem (opcional)"
              value={formData.mensagem}
              onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
              style={styles.textarea}
              rows={3}
            />
          </div>

          {/* Controles do calendário */}
          <div style={styles.calendarHeader}>
            <button onClick={retrocederMes} style={styles.navButton}>
              <ChevronLeft />
            </button>
            <div style={styles.monthDisplay}>
              {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
            </div>
            <button onClick={avancarMes} style={styles.navButton}>
              <ChevronRight />
            </button>
          </div>

          {/* Grid de dias */}
          <div style={styles.daysGrid}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
              <div key={dia} style={styles.dayHeader}>
                {dia}
              </div>
            ))}
            
            {dias.map((dia, index) => (
              <button
                key={index}
                onClick={() => selecionarData(dia)}
                style={{
                  ...styles.dayButton,
                  backgroundColor: dataSelecionada?.getDate() === dia.data.getDate() &&
                                 dataSelecionada?.getMonth() === dia.data.getMonth()
                    ? '#F1C232' 
                    : 'transparent',
                  color: dataSelecionada?.getDate() === dia.data.getDate() &&
                         dataSelecionada?.getMonth() === dia.data.getMonth()
                    ? '#000' 
                    : dia.disponivel ? '#fff' : '#666',
                  cursor: dia.disponivel ? 'pointer' : 'not-allowed',
                  opacity: dia.disponivel ? 1 : 0.5
                }}
                disabled={!dia.disponivel}
              >
                <div style={styles.dayNumber}>{dia.diaNumero}</div>
                <div style={styles.dayName}>{dia.dia}</div>
              </button>
            ))}
          </div>

          {/* Horários disponíveis */}
          {dataSelecionada && (
            <div style={styles.horariosSection}>
              <div style={styles.horariosHeader}>
                <Clock style={styles.clockIcon} />
                <h4 style={styles.horariosTitle}>
                  Horários disponíveis para {formatarData(dataSelecionada)}
                </h4>
              </div>
              
              {carregandoHorarios ? (
                <div style={styles.carregandoContainer}>
                  <div style={styles.spinner} />
                  <p>Carregando horários...</p>
                </div>
              ) : (
                <div style={styles.horariosGrid}>
                  {diaSelecionado?.horarios && diaSelecionado.horarios.length > 0 ? (
                    diaSelecionado.horarios.map(horario => (
                      <button
                        key={horario.id}
                        onClick={() => setHorarioSelecionado(horario.horario)}
                        style={{
                          ...styles.horarioButton,
                          backgroundColor: horarioSelecionado === horario.horario 
                            ? '#F1C232' 
                            : horario.disponivel 
                              ? '#1a1a1a' 
                              : '#0a0a0a',
                          color: horarioSelecionado === horario.horario 
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

              {horarioSelecionado && (
                <button
                  onClick={confirmarAgendamento}
                  disabled={agendando || carregandoHorarios}
                  style={{
                    ...styles.confirmButton,
                    backgroundColor: agendando ? '#666' : '#10B981',
                    cursor: agendando ? 'not-allowed' : 'pointer'
                  }}
                >
                  {agendando ? (
                    <>
                      <div style={styles.spinner} />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle style={styles.checkIcon} />
                      Confirmar Agendamento para {horarioSelecionado}
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Legendas */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#F1C232'}} />
              <span>Selecionado</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#10B981'}} />
              <span>Disponível</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{...styles.legendColor, backgroundColor: '#666'}} />
              <span>Indisponível</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Estilos
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const
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

  subtitle: {
    color: '#a0a0a0',
    fontSize: '0.9rem',
    width: '100%'
  } as React.CSSProperties,

  formSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#0a0a0a',
    borderRadius: '0.5rem'
  } as React.CSSProperties,

  formTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#F1C232',
    marginBottom: '0.5rem'
  } as React.CSSProperties,

  input: {
    padding: '0.75rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.95rem',
    width: '100%'
  } as React.CSSProperties,

  textarea: {
    padding: '0.75rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    color: '#fff',
    fontSize: '0.95rem',
    width: '100%',
    resize: 'vertical' as const
  } as React.CSSProperties,

  erroContainer: {
    backgroundColor: '#dc2626',
    color: '#fff',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    position: 'relative' as const
  } as React.CSSProperties,

  erroTexto: {
    marginRight: '2rem'
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

  sucessoContainer: {
    backgroundColor: '#10B981',
    color: '#fff',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem'
  } as React.CSSProperties,

  sucessoTexto: {
    textAlign: 'center' as const
  } as React.CSSProperties,

  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem'
  } as React.CSSProperties,

  navButton: {
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    color: '#fff',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease'
  } as React.CSSProperties,

  monthDisplay: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff'
  } as React.CSSProperties,

  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
    marginBottom: '2rem'
  } as React.CSSProperties,

  dayHeader: {
    textAlign: 'center' as const,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#F1C232',
    padding: '0.5rem'
  } as React.CSSProperties,

  dayButton: {
    aspectRatio: '1',
    border: '1px solid #333',
    borderRadius: '0.375rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    width: '100%'
  } as React.CSSProperties,

  dayNumber: {
    fontSize: '1.1rem',
    fontWeight: 700
  } as React.CSSProperties,

  dayName: {
    fontSize: '0.75rem',
    opacity: 0.8
  } as React.CSSProperties,

  horariosSection: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #333'
  } as React.CSSProperties,

  horariosHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  } as React.CSSProperties,

  clockIcon: {
    width: '1.5rem',
    height: '1.5rem',
    color: '#F1C232'
  } as React.CSSProperties,

  horariosTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff'
  } as React.CSSProperties,

  horariosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
    marginBottom: '1.5rem'
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

  confirmButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '1rem',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    transition: 'background-color 0.3s ease',
    marginTop: '1rem'
  } as React.CSSProperties,

  checkIcon: {
    width: '1.25rem',
    height: '1.25rem'
  } as React.CSSProperties,

  spinner: {
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  } as React.CSSProperties,

  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #333',
    fontSize: '0.8rem',
    color: '#a0a0a0',
    flexWrap: 'wrap' as const
  } as React.CSSProperties,

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  } as React.CSSProperties,

  legendColor: {
    width: '1rem',
    height: '1rem',
    borderRadius: '0.25rem'
  } as React.CSSProperties,

  successContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    textAlign: 'center' as const
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
    marginBottom: '0.5rem',
    maxWidth: '400px'
  } as React.CSSProperties,

  successNote: {
    color: '#666',
    fontSize: '0.9rem'
  } as React.CSSProperties
};

export default CalendarioAgendamento;