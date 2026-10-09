// Dados padrão para inicialização do sistema
const dadosIniciais = {
  config: { 
    nome: 'AutoFix Oficina', 
    cnpj: '00.123.456/0001-00', 
    telefone: '(11) 99999-8888', 
    endereco: 'Rua das Oficinas, 100 - Centro' 
  },
  agendamentos: [
    { nome: 'Mariana Lima', veiculo: 'HB20 (KLP1234)', tipo: 'Pastilhas de freio', data: '15/10/2026 - 14:00' }
  ],
  ordens: [
    { id: 1001, cliente: 'Carlos Santos (Civic - ABC1D23)', serviço: 'Troca de óleo sintético 5W30, filtro de óleo e alinhamento.', emissor: 'AutoFix Oficina | (11) 99999-8888', status: 'Concluído' },
    { id: 1002, cliente: 'Mariana Lima (HB20 - KLP1234)', serviço: 'Substituição das pastilhas de freio dianteiras.', emissor: 'AutoFix Oficina | (11) 99999-8888', status: 'Agendado' },
    { id: 1003, cliente: 'Roberto Alves (Corolla - XYZ9876)', serviço: 'Troca de correia dentada e revisão.', emissor: 'AutoFix Oficina | (11) 99999-8888', status: 'Cancelado' }
  ],
  estoque: [
    { id: 1, nome: 'Óleo 5W30 Sintético', qtd: 45 },
    { id: 2, nome: 'Pastilha de Freio HB20', qtd: 2 }
  ],
  contadorOS: 1004
};

// Leitura Segura do LocalStorage
let AppData;
try {
  const dadosSalvos = localStorage.getItem('autofix_db');
  AppData = dadosSalvos ? JSON.parse(dadosSalvos) : dadosIniciais;
} catch (e) {
  console.error('Erro ao ler do localStorage, carregando dados iniciais:', e);
  AppData = dadosIniciais;
}

// Salvamento Seguro no LocalStorage
function salvarBD() {
  try {
    localStorage.setItem('autofix_db', JSON.stringify(AppData));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
    alert('Atenção: Não foi possível salvar os dados na memória do navegador.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarTudo();
});

function renderizarTudo() {
  renderizarDashboard();
  renderizarConfig();
  renderizarAgendamentos();
  renderizarOS();
  renderizarEstoque();
  renderizarItensAgendamento();
}

// --- DASHBOARD AUTOMÁTICO ---
function renderizarDashboard() {
  const agendaEl = document.getElementById('dash-qtd-agenda');
  const totalOsEl = document.getElementById('dash-total-os');
  const alertaEl = document.getElementById('dash-pecas-alerta');
  const concluidasEl = document.getElementById('dash-os-concluidas');

  if (agendaEl) agendaEl.innerText = AppData.agendamentos.filter(ag => {
    const ordem = ag.osId && AppData.ordens.find(os => os.id === ag.osId);
    return !ordem || ordem.status === 'Agendado';
  }).length;
  if (totalOsEl) totalOsEl.innerText = AppData.ordens.length;

  const pecasAlerta = AppData.estoque.filter(item => item.qtd < 5).length;
  if (alertaEl) alertaEl.innerText = pecasAlerta;

  const qtdConcluidos = AppData.ordens.filter(os => os.status === 'Concluído').length;
  if (concluidasEl) concluidasEl.innerText = qtdConcluidos;

  const totalOS = AppData.ordens.length;
  if (totalOS === 0) {
    atualizarBarras(0, 0, 0);
    return;
  }

  const qtdAgendados = AppData.ordens.filter(os => os.status === 'Agendado').length;
  const qtdCancelados = AppData.ordens.filter(os => os.status === 'Cancelado').length;

  const pctOk = Math.round((qtdConcluidos / totalOS) * 100);
  const pctExec = Math.round((qtdAgendados / totalOS) * 100);
  const pctErro = Math.round((qtdCancelados / totalOS) * 100);

  atualizarBarras(pctOk, pctExec, pctErro);
}

function atualizarBarras(ok, exec, erro) {
  const txtOk = document.getElementById('txt-pct-ok');
  const txtExec = document.getElementById('txt-pct-exec');
  const txtErro = document.getElementById('txt-pct-erro');

  const barOk = document.getElementById('bar-prog-ok');
  const barExec = document.getElementById('bar-prog-exec');
  const barErro = document.getElementById('bar-prog-erro');

  if (txtOk) txtOk.innerText = `${ok}%`;
  if (txtExec) txtExec.innerText = `${exec}%`;
  if (txtErro) txtErro.innerText = `${erro}%`;

  if (barOk) barOk.style.width = `${ok}%`;
  if (barExec) barExec.style.width = `${exec}%`;
  if (barErro) barErro.style.width = `${erro}%`;
}

// --- CONFIGURAÇÕES ---
function renderizarConfig() {
  const cfgNome = document.getElementById('cfgNome');
  const cfgCnpj = document.getElementById('cfgCnpj');
  const cfgTelefone = document.getElementById('cfgTelefone');
  const cfgEndereco = document.getElementById('cfgEndereco');
  const logoEmpresa = document.getElementById('logo-empresa');

  if (cfgNome) cfgNome.value = AppData.config.nome || '';
  if (cfgCnpj) cfgCnpj.value = AppData.config.cnpj || '';
  if (cfgTelefone) cfgTelefone.value = AppData.config.telefone || '';
  if (cfgEndereco) cfgEndereco.value = AppData.config.endereco || '';
  if (logoEmpresa) logoEmpresa.innerText = AppData.config.nome || 'AutoFix';
}

function salvarConfiguracoes(e) {
  e.preventDefault();
  AppData.config = {
    nome: document.getElementById('cfgNome').value,
    cnpj: document.getElementById('cfgCnpj').value,
    telefone: document.getElementById('cfgTelefone').value,
    endereco: document.getElementById('cfgEndereco').value
  };
  
  const emissorFormatado = AppData.config.telefone ? `${AppData.config.nome} | ${AppData.config.telefone}` : AppData.config.nome;
  AppData.ordens.forEach(os => os.emissor = emissorFormatado);

  salvarBD();
  renderizarTudo();
  alert("Configurações atualizadas!");
}

// --- AGENDAMENTOS ---
function renderizarAgendamentos() {
  const container = document.getElementById('lista-agendamentos');
  if (!container) return;
  container.innerHTML = '';
  
  AppData.agendamentos.forEach((ag, indice) => {
    const ordem = ag.osId ? AppData.ordens.find(os => os.id === ag.osId) : null;
    if (ordem && ordem.status !== 'Agendado') return;
    container.innerHTML += `
      <div class="card-agenda">
        <div class="agenda-topo">
          <b>${ag.nome}</b>
          <span class="badge exec">Agendado</span>
        </div>
        <p>🚗 ${ag.veiculo} - ${ag.tipo}</p>
        <small>📅 ${ag.data}</small>
        <button class="btn-deletar" onclick="retirarAgendamento(${indice})">Cancelar agendamento</button>
      </div>
    `;
  });
}

function salvarAgendamento(e) {
  e.preventDefault();
  const nome = document.getElementById('agNome').value;
  const veiculo = document.getElementById('agVeiculo').value;
  const dataHora = document.getElementById('agData').value;
  const tipo = document.getElementById('agTipo').value;
  const defeito = document.getElementById('agDefeito').value;
  
  const dataFormatada = new Date(dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  const emissorFormatado = AppData.config.telefone ? `${AppData.config.nome} | ${AppData.config.telefone}` : AppData.config.nome;
  const itens = [...document.querySelectorAll('.item-agenda-check:checked')].map(check => ({
    estoqueId: Number(check.value),
    quantidade: Number(document.querySelector(`.item-agenda-qtd[data-item-id="${check.value}"]`).value)
  }));
  for (const item of itens) {
    const estoque = AppData.estoque.find(registro => registro.id === item.estoqueId);
    if (!estoque || !Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > estoque.qtd) {
      alert('Confira as quantidades dos itens selecionados.');
      return;
    }
  }
  const idOS = AppData.contadorOS++;

  AppData.agendamentos.unshift({ nome, veiculo, tipo, data: dataFormatada, osId: idOS });

  AppData.ordens.unshift({
    id: idOS,
    cliente: `${nome} (${veiculo})`,
    serviço: `[${tipo}] ${defeito}`,
    emissor: emissorFormatado,
    status: 'Agendado',
    itensEstoque: itens,
    estoqueBaixado: false
  });

  salvarBD();
  renderizarTudo();

  document.getElementById('agNome').value = '';
  document.getElementById('agVeiculo').value = '';
  document.getElementById('agData').value = '';
  document.getElementById('agTipo').value = '';
  document.getElementById('agDefeito').value = '';

  alert('Agendamento salvo com sucesso!');
}

// --- ORDENS DE SERVIÇO ---
function renderizarOS() {
  const corpo = document.getElementById('corpo-tabela-os');
  if (!corpo) return;
  corpo.innerHTML = '';
  
  AppData.ordens.forEach(os => {
    const classeCor = os.status === 'Concluído' ? 'ok' : os.status === 'Agendado' ? 'exec' : 'erro';
    
    corpo.innerHTML += `
      <tr data-status="${os.status}">
        <td>#${os.id}</td>
        <td>${os.cliente}</td>
        <td>${os.serviço}${os.itensEstoque?.length ? `<br><small>Itens: ${os.itensEstoque.map(item => `${AppData.estoque.find(reg => reg.id === item.estoqueId)?.nome || 'Item removido'} × ${item.quantidade}`).join(', ')}</small>` : ''}</td>
        <td>${os.emissor}</td>
        <td>
          <select class="select-status ${classeCor}" onchange="alterarStatusOS(${os.id}, this)" ${os.status === 'Concluído' ? 'disabled' : ''}>
            <option value="Concluído" ${os.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
            <option value="Agendado" ${os.status === 'Agendado' ? 'selected' : ''}>Agendado</option>
            <option value="Cancelado" ${os.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </td>
      </tr>
    `;
  });
}

function alterarStatusOS(id, selectElement) {
  const novoStatus = selectElement.value;
  const os = AppData.ordens.find(o => o.id === id);
  
  if (os) {
    if (novoStatus === 'Concluído' && !os.estoqueBaixado) {
      for (const item of os.itensEstoque || []) {
        const estoque = AppData.estoque.find(registro => registro.id === item.estoqueId);
        if (!estoque || estoque.qtd < item.quantidade) {
          alert(`Estoque insuficiente para concluir a OS. Confira ${estoque?.nome || 'um dos itens vinculados'}.`);
          renderizarOS();
          return;
        }
      }
      (os.itensEstoque || []).forEach(item => {
        AppData.estoque.find(registro => registro.id === item.estoqueId).qtd -= item.quantidade;
      });
      os.estoqueBaixado = true;
    }
    os.status = novoStatus;
    salvarBD();
    renderizarTudo();
  }
}

function filtrarOS(status, btn) {
  document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const linhas = document.querySelectorAll('#tabela-os tbody tr');
  linhas.forEach(linha => {
    if (status === 'todos' || linha.getAttribute('data-status') === status) {
      linha.style.display = '';
    } else {
      linha.style.display = 'none';
    }
  });
}

// --- ESTOQUE ---
function renderizarEstoque() {
  const grid = document.getElementById('lista-estoque');
  if (!grid) return;
  grid.innerHTML = '';

  AppData.estoque.forEach(item => {
    const badgeClass = item.qtd < 5 ? 'badge erro' : 'badge ok';
    const badgeTexto = item.qtd < 5 ? 'Repor Estoque' : 'Estoque Normal';

    grid.innerHTML += `
      <div class="card-item">
        <b>${item.nome}</b>
        <p style="margin: 8px 0; font-size: 0.85rem;">Quantidade: <strong>${item.qtd}</strong></p>
        <span class="${badgeClass}">${badgeTexto}</span>
        <button class="btn-deletar" onclick="deletarEstoque(${item.id})">Deletar</button>
      </div>
    `;
  });
}

function adicionarEstoque(e) {
  e.preventDefault();
  const nome = document.getElementById('nomeItem').value;
  const qtd = parseInt(document.getElementById('qtdItem').value);

  AppData.estoque.push({ id: Date.now(), nome, qtd });
  
  salvarBD();
  renderizarTudo();

  document.getElementById('nomeItem').value = '';
  document.getElementById('qtdItem').value = '';
}

function deletarEstoque(id) {
  AppData.estoque = AppData.estoque.filter(item => item.id !== id);
  salvarBD();
  renderizarTudo();
}

// Navegação entre abas
function mudar(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar a, .menu a').forEach(a => a.classList.remove('active'));
  
  const paginaAlvo = document.getElementById(id);
  if (paginaAlvo) {
    paginaAlvo.classList.add('active');
  }
  
  if (el) {
    el.classList.add('active');
  }
}

function retirarAgendamento(indice) {
  const agendamento = AppData.agendamentos[indice];
  if (!agendamento || !confirm(`Cancelar o agendamento de ${agendamento.nome}?`)) return;
  const ordem = agendamento.osId && AppData.ordens.find(os => os.id === agendamento.osId);
  if (ordem && ordem.status === 'Agendado') ordem.status = 'Cancelado';
  AppData.agendamentos.splice(indice, 1);
  salvarBD();
  renderizarTudo();
}

function renderizarItensAgendamento() {
  const container = document.getElementById('itens-disponiveis-agenda');
  if (!container) return;
  if (!AppData.estoque.length) {
    container.innerHTML = '<small>Nenhum item cadastrado no estoque.</small>';
    return;
  }
  container.innerHTML = AppData.estoque.map(item => `
    <label class="item-selecao">
      <span><input type="checkbox" class="item-agenda-check" value="${item.id}"> ${item.nome} (disponível: ${item.qtd})</span>
      <input type="number" class="item-agenda-qtd" data-item-id="${item.id}" min="1" max="${item.qtd}" value="1" aria-label="Quantidade de ${item.nome}">
    </label>
  `).join('');
}
