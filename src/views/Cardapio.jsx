import { useState } from 'react';
import produtosDataSet from '../datasets/Produto';
import ComprasTable from '../components/ComprasTable';
import { Alert, Button, Form, Modal } from 'react-bootstrap';

const Cardapio = () => {
  let [produtos, setProdutos] = useState([...produtosDataSet]);

  const [show, setShow] = useState(false);

  const [errorsForm, setErrorsForm] = useState({});

  const handleShow = () => setShow(!show);

  let [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor: '',
    imagemUrl: '',
  });

  const handleChangeFormData = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setFormData({ ...formData, [name]: value });
  };

  const validateValues = () => {
    let errors = {};
    if (formData.titulo === null) {
      errors.titulo = 'Título não válido';
    } else if (
      formData.titulo.trim().length < 1 ||
      formData.titulo.trim().length > 10
    ) {
      errors.titulo = 'Título não válido';
    }

    if (formData.descricao === null) {
      errors.descricao = 'Descrição inválida';
    } else if (
      formData.descricao.trim().length < 1 ||
      formData.descricao.trim().length > 20
    ) {
      errors.descricao = 'Descrição inválida';
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar os dados.
    const errors = validateValues();
    setErrorsForm(errors);

    let qtdErrors = Object.keys(errors).length;

    if (qtdErrors === 0) {
      // Enviar dados para a tabela.
      let novoProduto = { ...formData };
      setProdutos([...produtos, novoProduto]);

      // Fechar modal.
      setShow(false);
    }
  };

  return (
    <>
      <Button className="m-2" variant="primary" onClick={handleShow}>
        +
      </Button>

      <ComprasTable produtos={produtos}></ComprasTable>

      <Modal show={show} onHide={handleShow}>
        <Modal.Header closeButton>
          <Modal.Title>Produto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Título */}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Título</Form.Label>
              <Form.Control
                onChange={handleChangeFormData}
                value={formData.titulo}
                type="text"
                placeholder="Digite o título"
                name="titulo"
              />

              {errorsForm && errorsForm.titulo}
            </Form.Group>
            {/* Decrição */}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                onChange={handleChangeFormData}
                value={formData.descricao}
                type="text"
                placeholder="Digite a descrição"
                name="descricao"
              />
              {errorsForm && errorsForm.descricao}
            </Form.Group>
            {/* Valor */}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Valor</Form.Label>
              <Form.Control
                onChange={handleChangeFormData}
                value={formData.valor}
                type="text"
                placeholder="Digite o valor"
                name="valor"
              />
            </Form.Group>
            {/* Imagem */}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Imagem</Form.Label>
              <Form.Control
                onChange={handleChangeFormData}
                value={formData.imagemUrl}
                type="text"
                placeholder="Digite o endereço da imagem."
                name="imagemUrl"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleShow} type="button">
              Fechar
            </Button>
            <Button variant="primary" type="submit">
              Salvar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Cardapio;
