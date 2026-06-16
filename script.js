const menuButtons = document.querySelectorAll(".menu-btn");
const sections = document.querySelectorAll(".section");
const pageTitle = document.getElementById("pageTitle");

const formLancamento = document.getElementById("formLancamento");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

const editId = document.getElementById("editId");
const nome = document.getElementById("nome");
const nascimento = document.getElementById("nascimento");
const cpf = document.getElementById("cpf");
const telefone = document.getElementById("telefone");
const dataLancamento = document.getElementById("dataLancamento");
const statusPagamento = document.getElementById("statusPagamento");
const tipoExame = document.getElementById("tipoExame");
const valorPago = document.getElementById("valorPago");
const unidade = document.getElementById("unidade");
const quemLancou = document.getElementById("quemLancou");

const listaHojeLancamentos = document.getElementById("listaHojeLancamentos");
const listaRadiologiaHoje = document.getElementById("listaRadiologiaHoje");
const listaHistorico = document.getElementById("listaHistorico");
const resumoHistorico = document.getElementById("resumoHistorico");
const resumoDashboard = document.getElementById("resumoDashboard");

const mesDashboard = document.getElementById("mesDashboard");

const filtroDataInicio = document.getElementById("filtroDataInicio");
const filtroDataFim = document.getElementById("filtroDataFim");
const filtroRecepcionista = document.getElementById("filtroRecepcionista");
const filtroTipo = document.getElementById("filtroTipo");
const filtroUnidade = document.getElementById("filtroUnidade");
const filtroPagamento = document.getElementById("filtroPagamento");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");

const btnHub = document.getElementById("btn-hub");

// URL do seu Hub (ajuste aqui se for outro endereço)
const HUB_URL = "https://amorsaudemaringa.com/hub.html"; // 🔁 TROCAR SE PRECISAR
if (btnHub) {
  btnHub.addEventListener("click", () => {
    window.location.href = HUB_URL;
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  definirDataAtual();
  definirDataPadrao();
  configurarMenu();
  configurarEventos();
  controlarCampoValor();
  await renderizarTudo();

  setInterval(async () => {
    await renderLancamentosHoje();
    await renderRadiologia();
    await renderDashboard();
    await renderHistorico();
  }, 5000);
});

function configurarEventos() {
  formLancamento.addEventListener("submit", salvarLancamento);
  btnCancelarEdicao.addEventListener("click", cancelarEdicao);

  statusPagamento.addEventListener("change", controlarCampoValor);
  mesDashboard.addEventListener("change", renderDashboard);

  btnFiltrar.addEventListener("click", renderHistorico);
  btnLimparFiltros.addEventListener("click", limparFiltros);
}

function configurarMenu() {
  menuButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      menuButtons.forEach((btn) => btn.classList.remove("active"));
      sections.forEach((section) => section.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(button.dataset.section).classList.add("active");
      pageTitle.textContent = button.textContent;

      if (button.dataset.section === "dashboard") await renderDashboard();
      if (button.dataset.section === "lancamentos") await renderLancamentosHoje();
      if (button.dataset.section === "radiologia") await renderRadiologia();
      if (button.dataset.section === "historico") await renderHistorico();
    });
  });
}

function definirDataAtual() {
  const hoje = new Date();
  const formatada = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  document.getElementById("dataAtual").textContent = formatada;
}

function definirDataPadrao() {
  const hoje = getHoje();
  dataLancamento.value = hoje;
  mesDashboard.value = hoje.slice(0, 7);
}

function controlarCampoValor() {
  if (statusPagamento.value === "Bonificado") {
    valorPago.value = "";
    valorPago.disabled = true;
    valorPago.required = false;
  } else if (statusPagamento.value === "Pago") {
    valorPago.disabled = false;
    valorPago.required = true;
  } else {
    valorPago.value = "";
    valorPago.disabled = false;
    valorPago.required = false;
  }
}

function getHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

async function getLancamentos() {
  try {
    const response = await fetch(`php/listar_lancamentos.php?t=${Date.now()}`, {
      method: "GET",
      cache: "no-store"
    });

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
    return [];
  }
}

async function salvarLancamento(e) {
  e.preventDefault();

  const valorFinal = statusPagamento.value === "Bonificado"
    ? 0
    : (Number(valorPago.value) || 0);

  if (statusPagamento.value === "Pago" && valorFinal <= 0) {
    alert("Informe o valor pago para este lançamento.");
    return;
  }

  const formData = new FormData();
  formData.append("nome", nome.value.trim());
  formData.append("nascimento", nascimento.value);
  formData.append("cpf", cpf.value.trim());
  formData.append("telefone", telefone.value.trim());
  formData.append("status_pagamento", statusPagamento.value);
  formData.append("tipo_exame", tipoExame.value);
  formData.append("valor_pago", valorFinal);
  formData.append("unidade", unidade.value);
  formData.append("quem_lancou", quemLancou.value);
  formData.append("data_lancamento", getHoje());

  try {
    let response;
    let data;

    if (editId.value) {
      formData.append("id", editId.value);
      response = await fetch("php/editar_lancamento.php", {
        method: "POST",
        body: formData
      });
    } else {
      response = await fetch("php/salvar_lancamento.php", {
        method: "POST",
        body: formData
      });
    }

    data = await response.json();

    if (data.success) {
  const estavaEditando = !!editId.value;

  formLancamento.reset();
  editId.value = "";
  dataLancamento.value = getHoje();
  controlarCampoValor();

  await renderizarTudo();

  // força atualização extra das abas do dia
  await renderLancamentosHoje();
  await renderRadiologia();
  await renderHistorico();
  await renderDashboard();

  alert(estavaEditando ? "Lançamento atualizado com sucesso!" : "Lançamento salvo com sucesso!");
} else  {
      alert(data.message || "Erro ao salvar lançamento.");
    }
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert("Erro de conexão ao salvar lançamento.");
  }
}

function cancelarEdicao() {
  formLancamento.reset();
  editId.value = "";
  dataLancamento.value = getHoje();
  controlarCampoValor();
}

async function editarLancamento(id) {
  const lancamentos = await getLancamentos();
  const lancamento = lancamentos.find(item => String(item.id) === String(id));
  if (!lancamento) return;

  editId.value = lancamento.id;
  nome.value = lancamento.nome || "";
  nascimento.value = lancamento.nascimento || "";
  cpf.value = lancamento.cpf || "";
  telefone.value = lancamento.telefone || "";
  dataLancamento.value = getHoje();
  statusPagamento.value = lancamento.status_pagamento || "";
  tipoExame.value = lancamento.tipo_exame || "";
  valorPago.value = Number(lancamento.valor_pago) > 0 ? lancamento.valor_pago : "";
  unidade.value = lancamento.unidade || "";
  quemLancou.value = lancamento.quem_lancou || "";

  controlarCampoValor();

  document.querySelector('[data-section="lancamentos"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirLancamento(id) {
  if (!confirm("Deseja realmente excluir este lançamento?")) return;

  const formData = new FormData();
  formData.append("id", id);

  try {
    const response = await fetch("php/excluir_lancamento.php", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      await renderizarTudo();
      alert("Lançamento excluído com sucesso!");
    } else {
      alert(data.message || "Erro ao excluir lançamento.");
    }
  } catch (error) {
    console.error("Erro ao excluir:", error);
    alert("Erro de conexão ao excluir lançamento.");
  }
}

async function atualizarStatusRealizado(id, valor) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("realizado", valor);

  try {
    const response = await fetch("php/atualizar_radiologia.php", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      await renderRadiologia();
      await renderHistorico();
    } else {
      alert(data.message || "Erro ao atualizar status.");
    }
  } catch (error) {
    console.error("Erro ao atualizar radiologia:", error);
    alert("Erro de conexão ao atualizar status.");
  }
}

async function renderizarTudo() {
  await renderDashboard();
  await renderLancamentosHoje();
  await renderRadiologia();
  await renderHistorico();
  dataLancamento.value = getHoje();
}

async function renderDashboard() {
  const lancamentos = await getLancamentos();
  const mesSelecionado = mesDashboard.value;

  const filtrados = lancamentos.filter(item => {
    const data = item.data_lancamento || item.dataLancamento || "";
    return data.startsWith(mesSelecionado);
  });

  const panoramicas = filtrados.filter(item => (item.tipo_exame || item.tipoExame) === "Panorâmica");
  const documentacoes = filtrados.filter(item => (item.tipo_exame || item.tipoExame) === "Documentação");

  const bonificados = filtrados.filter(item => (item.status_pagamento || item.statusPagamento) === "Bonificado");
  const pagos = filtrados.filter(item => (item.status_pagamento || item.statusPagamento) === "Pago");

  const totalPanoramica = panoramicas
    .filter(item => (item.status_pagamento || item.statusPagamento) === "Pago")
    .reduce((acc, item) => acc + Number(item.valor_pago || item.valorPago || 0), 0);

  const totalDocumentacao = documentacoes
    .filter(item => (item.status_pagamento || item.statusPagamento) === "Pago")
    .reduce((acc, item) => acc + Number(item.valor_pago || item.valorPago || 0), 0);

  const maringa = filtrados.filter(item => (item.unidade || "") === "Maringá").length;
  const sarandi = filtrados.filter(item => (item.unidade || "") === "Sarandi").length;
  const mandacaru = filtrados.filter(item => (item.unidade || "") === "Mandacaru").length;

  document.getElementById("dashPanoramicas").textContent = panoramicas.length;
  document.getElementById("dashDocumentacoes").textContent = documentacoes.length;
  document.getElementById("dashBonificados").textContent = bonificados.length;
  document.getElementById("dashPagos").textContent = pagos.length;
  document.getElementById("dashValorPanoramica").textContent = formatarMoeda(totalPanoramica);
  document.getElementById("dashValorDocumentacao").textContent = formatarMoeda(totalDocumentacao);
  document.getElementById("dashMaringa").textContent = maringa;
  document.getElementById("dashSarandi").textContent = sarandi;
  document.getElementById("dashMandacaru").textContent = mandacaru;

  const totalGeral = filtrados
    .filter(item => (item.status_pagamento || item.statusPagamento) === "Pago")
    .reduce((acc, item) => acc + Number(item.valor_pago || item.valorPago || 0), 0);

  resumoDashboard.innerHTML = `
    <div class="resumo-item">
      <strong>Total de lançamentos</strong>
      <span>${filtrados.length}</span>
    </div>
    <div class="resumo-item">
      <strong>Total recebido no mês</strong>
      <span>${formatarMoeda(totalGeral)}</span>
    </div>
    <div class="resumo-item">
      <strong>Panorâmicas bonificadas</strong>
      <span>${filtrados.filter(i => (i.tipo_exame || i.tipoExame) === "Panorâmica" && (i.status_pagamento || i.statusPagamento) === "Bonificado").length}</span>
    </div>
    <div class="resumo-item">
      <strong>Documentações bonificadas</strong>
      <span>${filtrados.filter(i => (i.tipo_exame || i.tipoExame) === "Documentação" && (i.status_pagamento || i.statusPagamento) === "Bonificado").length}</span>
    </div>
  `;
}

async function renderLancamentosHoje() {
  const hoje = getHoje();
  const lancamentos = await getLancamentos();

  const lista = lancamentos.filter(item => {
    const data = item.data_lancamento || item.dataLancamento || "";
    return data === hoje;
  });

  if (!lista.length) {
    listaHojeLancamentos.innerHTML = `<p>Nenhum lançamento feito hoje.</p>`;
    return;
  }

  listaHojeLancamentos.innerHTML = montarTabelaLancamentos(lista, true);
}

async function renderRadiologia() {
  const hoje = getHoje();
  const lancamentos = await getLancamentos();

  const lista = lancamentos.filter(item => {
    const data = item.data_lancamento || item.dataLancamento || "";
    return data === hoje;
  });

  if (!lista.length) {
    listaRadiologiaHoje.innerHTML = `<p>Nenhum lançamento encontrado para hoje.</p>`;
    return;
  }

  listaRadiologiaHoje.innerHTML = `
    <table>
      <thead>
        <tr>
                  <th>Data</th>
<th>Horário</th>
<th>Paciente</th>
          <th>Nascimento</th>
          <th>CPF</th>
          <th>Telefone</th>
          <th>Exame</th>
          <th>Unidade</th>
          <th>Pagamento</th>
          <th>Quem lançou</th>
          <th>Feito?</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(item => `
          <tr>
                      <td>${formatarDataBR(item.data_lancamento || item.dataLancamento)}</td>
          <td>${formatarHora(item.horario_lancamento)}</td>
            <td>${item.nome}</td>
            <td>${formatarDataBR(item.nascimento)}</td>
            <td>${item.cpf}</td>
            <td>${item.telefone}</td>
            <td>${item.tipo_exame || item.tipoExame}</td>
            <td>${item.unidade}</td>
            <td>
              <span class="status-badge ${(item.status_pagamento || item.statusPagamento) === "Pago" ? "pago" : "bonificado"}">
                ${item.status_pagamento || item.statusPagamento}
              </span>
            </td>
            <td>${item.quem_lancou || item.quemLancou}</td>
            <td>
              <select onchange="atualizarStatusRealizado('${item.id}', this.value)">
                <option value="Não" ${(item.realizado || "Não") === "Não" ? "selected" : ""}>Não</option>
                <option value="Sim" ${(item.realizado || "Não") === "Sim" ? "selected" : ""}>Sim</option>
              </select>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function renderHistorico() {
  const lancamentos = await getLancamentos();
  const lista = aplicarFiltros(lancamentos);

  if (!lista.length) {
    resumoHistorico.innerHTML = "";
    listaHistorico.innerHTML = `<p>Nenhum lançamento encontrado.</p>`;
    return;
  }

  const totalRecebido = lista
    .filter(item => (item.status_pagamento || item.statusPagamento) === "Pago")
    .reduce((acc, item) => acc + Number(item.valor_pago || item.valorPago || 0), 0);

  const totalPago = lista.filter(item => (item.status_pagamento || item.statusPagamento) === "Pago").length;
  const totalBonificado = lista.filter(item => (item.status_pagamento || item.statusPagamento) === "Bonificado").length;

  resumoHistorico.innerHTML = `
    <div class="resumo-item">
      <strong>Total filtrado</strong>
      <span>${lista.length}</span>
    </div>
    <div class="resumo-item">
      <strong>Pagos</strong>
      <span>${totalPago}</span>
    </div>
    <div class="resumo-item">
      <strong>Bonificados</strong>
      <span>${totalBonificado}</span>
    </div>
    <div class="resumo-item">
      <strong>Total recebido</strong>
      <span>${formatarMoeda(totalRecebido)}</span>
    </div>
  `;

  listaHistorico.innerHTML = montarTabelaHistorico(lista);
}

function aplicarFiltros(lista) {
  return lista.filter(item => {
    const dataItem = item.data_lancamento || item.dataLancamento || "";
    const recepcionistaItem = item.quem_lancou || item.quemLancou || "";
    const tipoItem = item.tipo_exame || item.tipoExame || "";
    const unidadeItem = item.unidade || "";
    const pagamentoItem = item.status_pagamento || item.statusPagamento || "";

    const inicio = filtroDataInicio.value;
    const fim = filtroDataFim.value;
    const recepcionista = filtroRecepcionista.value;
    const tipo = filtroTipo.value;
    const un = filtroUnidade.value;
    const pagamento = filtroPagamento.value;

    const passouDataInicio = !inicio || dataItem >= inicio;
    const passouDataFim = !fim || dataItem <= fim;
    const passouRecepcionista = !recepcionista || recepcionistaItem === recepcionista;
    const passouTipo = !tipo || tipoItem === tipo;
    const passouUnidade = !un || unidadeItem === un;
    const passouPagamento = !pagamento || pagamentoItem === pagamento;

    return (
      passouDataInicio &&
      passouDataFim &&
      passouRecepcionista &&
      passouTipo &&
      passouUnidade &&
      passouPagamento
    );
  });
}

async function limparFiltros() {
  filtroDataInicio.value = "";
  filtroDataFim.value = "";
  filtroRecepcionista.value = "";
  filtroTipo.value = "";
  filtroUnidade.value = "";
  filtroPagamento.value = "";
  await renderHistorico();
}

function montarTabelaLancamentos(lista, comAcoes = false) {
  return `
    <table>
      <thead>
        <tr>
          <th>Data</th>
        <th>Horário</th>
          <th>Paciente</th>
          <th>CPF</th>
          <th>Telefone</th>
          <th>Exame</th>
          <th>Valor</th>
          <th>Pagamento</th>
          <th>Unidade</th>
          <th>Quem lançou</th>
          ${comAcoes ? "<th>Ações</th>" : ""}
        </tr>
      </thead>
      <tbody>
        ${lista.map(item => `
          <tr>
            <td>${formatarDataBR(item.data_lancamento || item.dataLancamento)}</td>
            <td>${formatarHora(item.horario_lancamento)}</td>
            <td>${item.nome}</td>
            <td>${item.cpf}</td>
            <td>${item.telefone}</td>
            <td>${item.tipo_exame || item.tipoExame}</td>
            <td>${formatarMoeda(item.valor_pago || item.valorPago || 0)}</td>
            <td>
              <span class="status-badge ${(item.status_pagamento || item.statusPagamento) === "Pago" ? "pago" : "bonificado"}">
                ${item.status_pagamento || item.statusPagamento}
              </span>
            </td>
            <td>${item.unidade}</td>
            <td>${item.quem_lancou || item.quemLancou}</td>
            ${
              comAcoes
                ? `
                <td>
                  <button class="btn edit" onclick="editarLancamento('${item.id}')">Editar</button>
                  <button class="btn delete" onclick="excluirLancamento('${item.id}')">Excluir</button>
                </td>
              `
                : ""
            }
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function montarTabelaHistorico(lista) {
  return `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Paciente</th>
          <th>Nascimento</th>
          <th>CPF</th>
          <th>Telefone</th>
          <th>Exame</th>
          <th>Valor</th>
          <th>Pagamento</th>
          <th>Unidade</th>
          <th>Quem lançou</th>
          <th>Radiologia</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(item => `
          <tr>
            <td>${formatarDataBR(item.data_lancamento || item.dataLancamento)}</td>
            <td>${item.nome}</td>
            <td>${formatarDataBR(item.nascimento)}</td>
            <td>${item.cpf}</td>
            <td>${item.telefone}</td>
            <td>${item.tipo_exame || item.tipoExame}</td>
            <td>${formatarMoeda(item.valor_pago || item.valorPago || 0)}</td>
            <td>
              <span class="status-badge ${(item.status_pagamento || item.statusPagamento) === "Pago" ? "pago" : "bonificado"}">
                ${item.status_pagamento || item.statusPagamento}
              </span>
            </td>
            <td>${item.unidade}</td>
            <td>${item.quem_lancou || item.quemLancou}</td>
            <td>
              <span class="status-badge ${(item.realizado || "Não") === "Sim" ? "realizado" : "nao-realizado"}">
                ${(item.realizado || "Não") === "Sim" ? "Feito" : "Não feito"}
              </span>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarDataBR(data) {
  if (!data) return "";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarHora(hora) {
  if (!hora) return "";

  // Se vier como "14:35:22"
  if (hora.includes(":")) {
    return hora.substring(0, 5);
  }

  return hora;
}

window.editarLancamento = editarLancamento;
window.excluirLancamento = excluirLancamento;
window.atualizarStatusRealizado = atualizarStatusRealizado;