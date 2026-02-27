// src/pages/Home.jsx
import { useState } from 'react';
import itens from '../datasets/Carrosel';
import produtosDataSet from '../datasets/Produto';
import MeuCarrosel from '../components/MeuCarrosel';

const Home = () => {
  let [produtos, setProdutos] = useState([...produtosDataSet]);

  return (
    <>
      <MeuCarrosel itens={itens} />

    </>
  );
};

export default Home;