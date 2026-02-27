// src/templates/Layout.jsx
import { Container } from 'react-bootstrap';
import { Header } from '../components/Header'; // Usar import nomeado
import { Footer } from '../components/Footer'; // Importação nomeada
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Header /> {/* Usar como componente nomeado */}
      <Container>
        <main>
          <Outlet />
        </main>
      </Container>
      <Footer />
    </>
  );
};

export default Layout;