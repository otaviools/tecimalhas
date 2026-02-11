// Script para envio do formulário de contato
document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.querySelector("form");

  if (formulario) {
    formulario.addEventListener("submit", async (e) => {
      e.preventDefault();

      const botao = formulario.querySelector('button[type="submit"]');
      const textoOriginal = botao.textContent;

      // Coleta os dados do formulário
      const dados = {
        nome: formulario.querySelector('input[id="nome"]').value,
        telefone: formulario.querySelector('input[id="telefone"]').value,
        email: formulario.querySelector('input[id="email"]').value,
        mensagem: formulario.querySelector('textarea[id="mensagem"]').value,
      };

      // Desabilita o botão durante o envio
      botao.disabled = true;
      botao.textContent = "Enviando...";

      try {
        const resposta = await fetch("http://localhost:3000/api/contato", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          botao.classList.add("sucesso");
          botao.textContent = "Enviado!";
          formulario.reset();

          setTimeout(() => {
            botao.classList.remove("sucesso");
            botao.textContent = textoOriginal;
            botao.disabled = false;
          }, 4000);
        } else {
          botao.classList.add("erro");
          botao.textContent = resultado.erro || "Erro ao enviar";

          setTimeout(() => {
            botao.classList.remove("erro");
            botao.textContent = textoOriginal;
            botao.disabled = false;
          }, 3000);
        }
      } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao enviar mensagem. Verifique se o servidor está rodando.");
        botao.disabled = false;
        botao.textContent = textoOriginal;
      }
    });
  }
});
