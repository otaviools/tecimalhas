const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração do email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rota para enviar email
app.post("/api/contato", async (req, res) => {
  const { nome, telefone, email, mensagem } = req.body;

  // Validação
  if (!nome || !telefone || !email || !mensagem) {
    return res.status(400).json({
      erro: "Todos os campos são obrigatórios",
    });
  }

  // Configuração do email para a loja
  const mailOptionsLoja = {
    from: process.env.EMAIL_USER,
    to: "tecimalhas@gmail.com",
    subject: `Novo Contato - ${nome}`,
    html: `
            <h2>Novo contato recebido pelo Site</h2>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Telefone:</strong> ${telefone}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensagem:</strong></p>
            <p>${mensagem}</p>
            <hr>
            <p><small>Enviado em: ${new Date().toLocaleString("pt-BR")}</small></p>
        `,
  };

  // Email de confirmação para o cliente
  const mailOptionsCliente = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Recebemos seu contato - Tecimalhas",
    html: `
            <h2>Olá, ${nome} !</h2>
            <p>Recebemos sua mensagem e responderemos em até <strong>24 horas</strong>.</p>
            <p><strong>Sua mensagem:</strong></p>
            <p>${mensagem}</p>
            <hr>
            <p>Atenciosamente,<br><strong>Equipe Tecimalhas</strong></p>
            <p><strong>Endereço</strong>: Av.Fernando Vilela 379 - Martins, Uberlândia-MG</p>
            <p><strong>Telefone:</strong> 343210-1781</p>
        `,
  };

  try {
    // Envia email para a loja
    await transporter.sendMail(mailOptionsLoja);

    // Envia email de confirmação para o cliente
    await transporter.sendMail(mailOptionsCliente);

    res.status(200).json({
      sucesso: true,
      mensagem: "Mensagem enviada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao enviar email:", erro);
    res.status(500).json({
      erro: "Erro ao enviar mensagem. Tente novamente.",
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
