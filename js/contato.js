// Formulário de contato
const formulario = document.querySelector(".form");

if (formulario) {
  const botao = formulario.querySelector('button[type="submit"]');
  const rotulo = botao.querySelector("[data-rotulo]");
  const textoOriginal = rotulo.textContent;
  const mensagem = formulario.querySelector("#mensagem");

  // Vindo de "Solicitar orçamento" na página de tecidos: já preenche o assunto
  const tecido = new URLSearchParams(location.search).get("tecido");
  if (tecido && !mensagem.value) {
    mensagem.value = `Olá! Gostaria de um orçamento de ${tecido.slice(0, 40)}.\nCor: \nMetragem: `;
  }

  function mostrarEstado(classe, texto, duracao) {
    botao.classList.add(classe);
    rotulo.textContent = texto;
    setTimeout(() => {
      botao.classList.remove(classe);
      rotulo.textContent = textoOriginal;
      botao.disabled = false;
    }, duracao);
  }

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: formulario.nome.value,
      telefone: formulario.telefone.value,
      email: formulario.email.value,
      mensagem: mensagem.value,
    };

    botao.disabled = true;
    rotulo.textContent = "Enviando...";

    try {
      const resposta = await fetch("http://localhost:3000/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const resultado = await resposta.json().catch(() => ({}));

      if (resposta.ok) {
        formulario.reset();
        mostrarEstado("sucesso", "Mensagem enviada", 4000);
      } else {
        mostrarEstado("erro", resultado.erro || "Erro ao enviar", 3000);
      }
    } catch (erro) {
      console.error("Erro:", erro);
      mostrarEstado("erro", "Servidor indisponível. Tente pelo telefone.", 4000);
    }
  });
}
