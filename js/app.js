/**
 * SGHSS - App Core (Router, Layout, Login, Dashboard, Pacientes, Prontuários, Prescrições, Exames)
 */
const pName=(id)=>{const p=Patients.getById(id);return p?p.name:'—'};
const prName=(id)=>{const p=Profs.getById(id);return p?p.name:'—'};
const uName=(id)=>{const u=Units.getById(id);return u?u.name:'—'};
const roleLabel={admin:'Administrador',medico:'Médico(a)',enfermeiro:'Enfermeiro(a)',tecnico:'Técnico(a)',paciente:'Paciente',recepcionista:'Recepcionista'};
const statusBadge=(s)=>{const m={agendado:'info',confirmado:'primary',em_atendimento:'warning',concluido:'success',cancelado:'danger',faltou:'dark',disponivel:'success',ocupado:'danger',manutencao:'secondary',reservado:'warning',ativa:'success',solicitado:'info',em_andamento:'warning',aguardando:'secondary',pendente:'warning',pago:'success',dispensada:'info',concluida:'success'};return`<span class="badge bg-${m[s]||'secondary'}">${(s||'').replace(/_/g,' ')}</span>`};

function toast(msg,type='success'){const c=document.getElementById('toast-container');const id='t'+Date.now();const icons={success:'bi-check-circle-fill',danger:'bi-x-circle-fill',warning:'bi-exclamation-triangle-fill',info:'bi-info-circle-fill'};c.insertAdjacentHTML('beforeend',`<div id="${id}" class="toast align-items-center text-bg-${type} border-0 show" role="alert"><div class="d-flex"><div class="toast-body"><i class="bi ${icons[type]||icons.info} me-2"></i>${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>`);setTimeout(()=>document.getElementById(id)?.remove(),4000)}
function showModal(id){new bootstrap.Modal(document.getElementById(id)).show()}
function hideModal(id){bootstrap.Modal.getInstance(document.getElementById(id))?.hide()}

// ============ ROUTER ============
let currentRoute='';
function navigate(path){window.location.hash=path}
function initRouter(){window.addEventListener('hashchange',resolve);resolve()}
function resolve(){
  const hash=window.location.hash.slice(1)||'/login';
  if(hash!=='/login'&&!Auth.loggedIn()){navigate('/login');return}
  if(hash==='/login'&&Auth.loggedIn()){navigate('/dashboard');return}
  currentRoute=hash;
  const routes={'/login':renderLogin,'/dashboard':renderDashboard,'/pacientes':renderPacientes,'/profissionais':renderProfissionais,'/agendamentos':renderAgendamentos,'/leitos':renderLeitos,'/suprimentos':renderSuprimentos,'/telemedicina':renderTelemedicina,'/financeiro':renderFinanceiro,'/relatorios':renderRelatorios,'/auditoria':renderAuditoria,'/usuarios':renderUsuarios,'/unidades':renderUnidades,'/prontuarios':renderProntuarios,'/prescricoes':renderPrescricoes,'/exames':renderExames,'/meus-agendamentos':renderMeusAgendamentos,'/meu-prontuario':renderMeuProntuario,'/minhas-prescricoes':renderMinhasPrescricoes,'/meus-exames':renderMeusExames};
  (routes[hash]||renderDashboard)();
}

// ============ LAYOUT ============
function showApp(){document.getElementById('app-login').classList.add('d-none');document.getElementById('app-main').classList.remove('d-none');updateNav();updateSidebar()}
function showLogin(){document.getElementById('app-login').classList.remove('d-none');document.getElementById('app-main').classList.add('d-none')}
function updateNav(){
  const u=Auth.user();if(!u)return;
  document.getElementById('nav-user-name').textContent=u.name;
  document.getElementById('nav-user-role').textContent=roleLabel[u.role]||u.role;
  const cnt=Notif.unreadCount(u.profileId||u.id);
  const b=document.getElementById('notif-badge');
  if(cnt>0){b.textContent=cnt>9?'9+':cnt;b.classList.remove('d-none')}else{b.classList.add('d-none')}
}
function updateSidebar(){
  const u=Auth.user();if(!u)return;
  document.getElementById('sidebar-menu').innerHTML=getMenu(u.role).map(i=>{
    if(i.div)return`<li class="sidebar-divider"><span>${i.label}</span></li>`;
    return`<li><a href="#${i.path}" class="sidebar-link ${currentRoute===i.path?'active':''}" onclick="onSidebarNav()"><i class="${i.icon}"></i><span>${i.label}</span></a></li>`
  }).join('');
}
function onSidebarNav(){if(window.innerWidth<992){document.getElementById('app-sidebar').classList.remove('mobile-open');const ov=document.querySelector('.sidebar-overlay');if(ov)ov.classList.remove('active')}}
function getMenu(role){
  const c=[{div:1,label:'Principal'},{path:'/dashboard',icon:'bi bi-grid-1x2-fill',label:'Dashboard'}];
  const m={
    admin:[...c,{div:1,label:'Cadastros'},{path:'/pacientes',icon:'bi bi-people-fill',label:'Pacientes'},{path:'/profissionais',icon:'bi bi-person-badge-fill',label:'Profissionais'},{path:'/unidades',icon:'bi bi-hospital-fill',label:'Unidades'},{div:1,label:'Operacional'},{path:'/agendamentos',icon:'bi bi-calendar-check-fill',label:'Agendamentos'},{path:'/leitos',icon:'bi bi-building-fill',label:'Leitos'},{path:'/suprimentos',icon:'bi bi-box-seam-fill',label:'Suprimentos'},{path:'/telemedicina',icon:'bi bi-camera-video-fill',label:'Telemedicina'},{div:1,label:'Gestão'},{path:'/financeiro',icon:'bi bi-currency-dollar',label:'Financeiro'},{path:'/relatorios',icon:'bi bi-graph-up',label:'Relatórios'},{path:'/auditoria',icon:'bi bi-shield-lock-fill',label:'Auditoria & LGPD'},{path:'/usuarios',icon:'bi bi-person-gear',label:'Usuários'}],
    medico:[...c,{div:1,label:'Atendimento'},{path:'/agendamentos',icon:'bi bi-calendar-check-fill',label:'Minha Agenda'},{path:'/pacientes',icon:'bi bi-people-fill',label:'Pacientes'},{path:'/prontuarios',icon:'bi bi-journal-medical',label:'Prontuários'},{path:'/prescricoes',icon:'bi bi-prescription2',label:'Prescrições'},{path:'/exames',icon:'bi bi-file-earmark-medical-fill',label:'Exames'},{path:'/telemedicina',icon:'bi bi-camera-video-fill',label:'Telemedicina'}],
    enfermeiro:[...c,{div:1,label:'Atendimento'},{path:'/agendamentos',icon:'bi bi-calendar-check-fill',label:'Agenda'},{path:'/pacientes',icon:'bi bi-people-fill',label:'Pacientes'},{path:'/leitos',icon:'bi bi-building-fill',label:'Leitos'},{path:'/prontuarios',icon:'bi bi-journal-medical',label:'Prontuários'},{path:'/suprimentos',icon:'bi bi-box-seam-fill',label:'Suprimentos'}],
    paciente:[...c,{div:1,label:'Minha Saúde'},{path:'/meus-agendamentos',icon:'bi bi-calendar-check-fill',label:'Minhas Consultas'},{path:'/meu-prontuario',icon:'bi bi-journal-medical',label:'Meu Prontuário'},{path:'/minhas-prescricoes',icon:'bi bi-prescription2',label:'Minhas Receitas'},{path:'/meus-exames',icon:'bi bi-file-earmark-medical-fill',label:'Meus Exames'},{path:'/telemedicina',icon:'bi bi-camera-video-fill',label:'Teleconsulta'}],
    recepcionista:[...c,{div:1,label:'Atendimento'},{path:'/pacientes',icon:'bi bi-people-fill',label:'Pacientes'},{path:'/agendamentos',icon:'bi bi-calendar-check-fill',label:'Agendamentos'},{path:'/leitos',icon:'bi bi-building-fill',label:'Leitos'}],
    tecnico:[...c,{div:1,label:'Operacional'},{path:'/pacientes',icon:'bi bi-people-fill',label:'Pacientes'},{path:'/leitos',icon:'bi bi-building-fill',label:'Leitos'},{path:'/suprimentos',icon:'bi bi-box-seam-fill',label:'Suprimentos'}]
  };return m[role]||c;
}

// ============ LOGIN ============
function renderLogin(){
  showLogin();
  document.getElementById('app-login').innerHTML=`
  <div class="login-container">
    <div class="login-card">
      <div class="login-header"><div class="login-logo"><i class="bi bi-heart-pulse-fill"></i></div><h1>SGHSS</h1><p>Sistema de Gestão Hospitalar e de Serviços de Saúde</p><span class="login-brand">VidaPlus</span></div>
      <form id="loginForm" autocomplete="off">
        <div class="form-floating mb-3"><input type="email" class="form-control" id="loginEmail" placeholder="Email" required><label><i class="bi bi-envelope me-2"></i>Email</label></div>
        <div class="form-floating mb-3"><input type="password" class="form-control" id="loginPassword" placeholder="Senha" required><label><i class="bi bi-lock me-2"></i>Senha</label></div>
        <button type="submit" class="btn btn-primary w-100 btn-lg login-btn"><i class="bi bi-box-arrow-in-right me-2"></i>Entrar</button>
        <div id="loginError" class="alert alert-danger mt-3 d-none"></div>
      </form>
      <div class="login-demo" style="margin-top:24px;text-align:center">
        <p><strong>Contas de demonstração:</strong></p>
        <div class="demo-grid">
          <button class="demo-btn" onclick="fillDemo('admin@vidaplus.com','admin123')"><i class="bi bi-person-gear"></i> Admin</button>
          <button class="demo-btn" onclick="fillDemo('ricardo@vidaplus.com','med123')"><i class="bi bi-heart-pulse"></i> Médico</button>
          <button class="demo-btn" onclick="fillDemo('luciana@vidaplus.com','enf123')"><i class="bi bi-bandaid"></i> Enfermeiro</button>
          <button class="demo-btn" onclick="fillDemo('maria@email.com','pac123')"><i class="bi bi-person"></i> Paciente</button>
          <button class="demo-btn" onclick="fillDemo('recepcao@vidaplus.com','rec123')"><i class="bi bi-telephone"></i> Recepção</button>
        </div>
      </div>
    </div>
  </div>`;
  document.getElementById('loginForm').onsubmit=async(e)=>{e.preventDefault();const r=await Auth.login(document.getElementById('loginEmail').value,document.getElementById('loginPassword').value);if(r.ok){showApp();navigate('/dashboard')}else{const el=document.getElementById('loginError');el.textContent=r.msg;el.classList.remove('d-none')}};
}
function fillDemo(e,p){document.getElementById('loginEmail').value=e;document.getElementById('loginPassword').value=p}
function doLogout(){Auth.logout();navigate('/login')}

// ============ DASHBOARD ============
function statCard(icon,label,value,color){return`<div class="col-6 col-md-4 col-xl-2"><div class="stat-card" style="--accent:${color}"><i class="bi ${icon}"></i><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div></div>`}
function startAppt(id){Appts.update(id,{status:'em_atendimento'});toast('Atendimento iniciado!');renderDashboard()}

function renderDashboard(){
  showApp();const u=Auth.user();const s=Reports.dashboard();const ta=Appts.today();
  document.getElementById('main-content').innerHTML=`
  <div class="page-header"><h2><i class="bi bi-grid-1x2-fill me-2"></i>Dashboard</h2><p class="text-muted">Bem-vindo(a), ${u.name}</p></div>
  <div class="row g-3 mb-4">
    ${statCard('bi-people-fill','Pacientes',s.patients,'var(--teal)')}
    ${statCard('bi-person-badge-fill','Profissionais',s.professionals,'var(--indigo)')}
    ${statCard('bi-calendar-check-fill','Consultas Hoje',s.apptsToday,'var(--blue)')}
    ${statCard('bi-building-fill','Leitos Ocupados',`${s.beds.occupied}/${s.beds.total}`,'var(--orange)')}
    ${statCard('bi-camera-video-fill','Teleconsultas',s.teleActive,'var(--purple)')}
    ${statCard('bi-exclamation-triangle-fill','Estoque Baixo',s.lowStock,s.lowStock>0?'var(--red)':'var(--green)')}
  </div>
  <div class="row g-3 mb-4">
    <div class="col-lg-8"><div class="card h-100"><div class="card-header d-flex justify-content-between align-items-center"><h5 class="mb-0"><i class="bi bi-calendar-day me-2"></i>Agenda de Hoje</h5><span class="badge bg-primary">${ta.length}</span></div>
    <div class="card-body p-0">${ta.length===0?'<div class="p-4 text-center text-muted">Nenhuma consulta hoje.</div>':`
    <div class="table-responsive"><table class="table table-hover mb-0"><thead><tr><th>Horário</th><th>Paciente</th><th>Profissional</th><th>Tipo</th><th>Status</th><th></th></tr></thead><tbody>
    ${ta.map(a=>`<tr><td><strong>${a.time}</strong></td><td>${pName(a.patientId)}</td><td>${prName(a.professionalId)}</td><td>${a.type}${a.isTelemedicine?' <i class="bi bi-camera-video text-info"></i>':''}</td><td>${statusBadge(a.status)}</td>
    <td>${a.status==='agendado'?`<button class="btn btn-sm btn-outline-success" onclick="startAppt('${a.id}')"><i class="bi bi-play-fill"></i></button>`:''}</td></tr>`).join('')}
    </tbody></table></div>`}</div></div></div>
    <div class="col-lg-4">
      <div class="card mb-3"><div class="card-header"><h5 class="mb-0"><i class="bi bi-hospital me-2"></i>Leitos</h5></div><div class="card-body">
        <div class="d-flex justify-content-around text-center mb-3">
          <div><div class="fs-3 fw-bold text-success">${s.beds.available}</div><small>Disponíveis</small></div>
          <div><div class="fs-3 fw-bold text-danger">${s.beds.occupied}</div><small>Ocupados</small></div>
          <div><div class="fs-3 fw-bold text-secondary">${s.beds.maintenance}</div><small>Manutenção</small></div>
        </div>
        <div class="progress" style="height:8px"><div class="progress-bar bg-danger" style="width:${s.beds.rate}%"></div></div>
        <small class="text-muted">Ocupação: ${s.beds.rate}%</small>
      </div></div>
      <div class="card"><div class="card-header"><h5 class="mb-0"><i class="bi bi-currency-dollar me-2"></i>Financeiro (Mês)</h5></div><div class="card-body">
        <div class="mb-2"><span class="text-success"><i class="bi bi-arrow-up-circle-fill me-1"></i>Receitas</span><strong class="float-end">${Utils.currency(s.financial.income)}</strong></div>
        <div class="mb-2"><span class="text-danger"><i class="bi bi-arrow-down-circle-fill me-1"></i>Despesas</span><strong class="float-end">${Utils.currency(s.financial.expense)}</strong></div>
        <hr><div><strong>Saldo</strong><strong class="float-end ${s.financial.balance>=0?'text-success':'text-danger'}">${Utils.currency(s.financial.balance)}</strong></div>
      </div></div>
    </div>
  </div>`;updateSidebar();
}

// ============ PACIENTES ============
function renderPacientes(){
  showApp();const ps=Patients.getAll();
  document.getElementById('main-content').innerHTML=`
  <div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-people-fill me-2"></i>Pacientes</h2><p class="text-muted">${ps.length} cadastrados</p></div><button class="btn btn-primary" onclick="formPaciente()"><i class="bi bi-plus-lg me-1"></i>Novo Paciente</button></div>
  <div class="card"><div class="card-body">
    <div class="input-group mb-3"><span class="input-group-text"><i class="bi bi-search"></i></span><input type="text" class="form-control" placeholder="Buscar nome, CPF ou email..." oninput="searchPat(this.value)"></div>
    <div class="table-responsive"><table class="table table-hover"><thead><tr><th>Nome</th><th>CPF</th><th>Nascimento</th><th>Telefone</th><th>Convênio</th><th>Ações</th></tr></thead><tbody id="patTbody">${patRows(ps)}</tbody></table></div>
  </div></div><div id="modalArea"></div>`;updateSidebar();
}
function patRows(ps){if(!ps.length)return'<tr><td colspan="6" class="text-center text-muted py-4">Nenhum paciente encontrado.</td></tr>';return ps.map(p=>`<tr><td><strong>${p.name}</strong></td><td>${Utils.cpfMask(p.cpf)}</td><td>${Utils.formatDate(p.birthDate)}</td><td>${Utils.phoneMask(p.phone)}</td><td>${p.healthInsurance||'—'}</td><td><div class="btn-group btn-group-sm"><button class="btn btn-outline-primary" onclick="viewPaciente('${p.id}')" title="Ver"><i class="bi bi-eye"></i></button><button class="btn btn-outline-secondary" onclick="formPaciente('${p.id}')" title="Editar"><i class="bi bi-pencil"></i></button><button class="btn btn-outline-info" onclick="viewProntuario('${p.id}')" title="Prontuário"><i class="bi bi-journal-medical"></i></button></div></td></tr>`).join('')}
function searchPat(v){document.getElementById('patTbody').innerHTML=patRows(v?Patients.search(v):Patients.getAll())}
function formPaciente(id){const p=id?Patients.getById(id):{};const e=!!id;
document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mPat" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
<div class="modal-header"><h5>${e?'Editar':'Novo'} Paciente</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form id="fPat" onsubmit="savePaciente(event,'${id||''}')"><div class="modal-body"><div class="row g-3">
<div class="col-md-8"><label class="form-label">Nome Completo *</label><input type="text" class="form-control" name="name" value="${p.name||''}" required></div>
<div class="col-md-4"><label class="form-label">CPF *</label><input type="text" class="form-control" name="cpf" value="${Utils.cpfMask(p.cpf)||''}" required maxlength="14"></div>
<div class="col-md-4"><label class="form-label">Nascimento *</label><input type="date" class="form-control" name="birthDate" value="${p.birthDate||''}" required></div>
<div class="col-md-4"><label class="form-label">Sexo *</label><select class="form-select" name="gender" required><option value="">Selecione</option><option value="M" ${p.gender==='M'?'selected':''}>Masculino</option><option value="F" ${p.gender==='F'?'selected':''}>Feminino</option><option value="O" ${p.gender==='O'?'selected':''}>Outro</option></select></div>
<div class="col-md-4"><label class="form-label">Tipo Sanguíneo</label><select class="form-select" name="bloodType"><option value="">Selecione</option>${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t=>`<option ${p.bloodType===t?'selected':''}>${t}</option>`).join('')}</select></div>
<div class="col-md-4"><label class="form-label">Telefone</label><input type="tel" class="form-control" name="phone" value="${Utils.phoneMask(p.phone)||''}"></div>
<div class="col-md-4"><label class="form-label">Email</label><input type="email" class="form-control" name="email" value="${p.email||''}"></div>
<div class="col-md-4"><label class="form-label">Convênio</label><input type="text" class="form-control" name="healthInsurance" value="${p.healthInsurance||''}"></div>
<div class="col-md-8"><label class="form-label">Endereço</label><input type="text" class="form-control" name="address" value="${p.address||''}"></div>
<div class="col-md-4"><label class="form-label">Cidade</label><input type="text" class="form-control" name="city" value="${p.city||''}"></div>
<div class="col-12"><label class="form-label">Alergias</label><textarea class="form-control" name="allergies" rows="2">${p.allergies||''}</textarea></div>
<div class="col-12"><div class="form-check"><input type="checkbox" class="form-check-input" name="consentLGPD" id="cLGPD" ${p.consentLGPD?'checked':''}><label class="form-check-label" for="cLGPD"><strong>Consentimento LGPD:</strong> Autorizo o tratamento dos meus dados pessoais conforme a LGPD.</label></div></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Salvar</button></div></form></div></div></div>`;showModal('mPat')}
function savePaciente(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.consentLGPD=e.target.querySelector('[name=consentLGPD]').checked;if(id){Patients.update(id,d);toast('Paciente atualizado!')}else{Patients.create(d);toast('Paciente cadastrado!')}hideModal('mPat');renderPacientes()}
function viewPaciente(id){const p=Patients.getById(id);if(!p)return;const h=Patients.history(id);
document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mView" tabindex="-1"><div class="modal-dialog modal-xl"><div class="modal-content">
<div class="modal-header"><h5><i class="bi bi-person-fill me-2"></i>${p.name}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<div class="modal-body">
<ul class="nav nav-tabs" role="tablist"><li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tDados">Dados</a></li><li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tHist">Prontuário (${h.records.length})</a></li><li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tAppts">Consultas (${h.appointments.length})</a></li><li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tExams">Exames (${h.exams.length})</a></li></ul>
<div class="tab-content pt-3">
<div class="tab-pane active" id="tDados"><div class="row g-2">
<div class="col-md-4"><strong>CPF:</strong> ${Utils.cpfMask(p.cpf)}</div><div class="col-md-4"><strong>Nascimento:</strong> ${Utils.formatDate(p.birthDate)}</div><div class="col-md-4"><strong>Sexo:</strong> ${p.gender==='M'?'Masculino':p.gender==='F'?'Feminino':'Outro'}</div>
<div class="col-md-4"><strong>Sangue:</strong> ${p.bloodType||'—'}</div><div class="col-md-4"><strong>Tel:</strong> ${Utils.phoneMask(p.phone)}</div><div class="col-md-4"><strong>Email:</strong> ${p.email||'—'}</div>
<div class="col-md-6"><strong>Convênio:</strong> ${p.healthInsurance||'—'}</div><div class="col-md-6"><strong>Endereço:</strong> ${p.address||'—'}</div>
${p.allergies?`<div class="col-12"><div class="alert alert-warning py-2 mb-0"><i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Alergias:</strong> ${p.allergies}</div></div>`:''}
</div></div>
<div class="tab-pane" id="tHist">${h.records.length?h.records.map(r=>`<div class="card mb-2"><div class="card-body py-2"><div class="d-flex justify-content-between"><strong>${r.diagnosis||r.type}</strong><small>${Utils.formatDateTime(r.date)}</small></div><small>${r.chiefComplaint||''} ${r.treatmentPlan?'| Conduta: '+r.treatmentPlan:''}</small><br><small class="text-muted">Por: ${prName(r.professionalId)}</small></div></div>`).join(''):'<p class="text-muted">Sem registros.</p>'}</div>
<div class="tab-pane" id="tAppts">${h.appointments.length?`<table class="table table-sm"><thead><tr><th>Data</th><th>Hora</th><th>Profissional</th><th>Tipo</th><th>Status</th></tr></thead><tbody>${h.appointments.map(a=>`<tr><td>${Utils.formatDate(a.date)}</td><td>${a.time}</td><td>${prName(a.professionalId)}</td><td>${a.type}</td><td>${statusBadge(a.status)}</td></tr>`).join('')}</tbody></table>`:'<p class="text-muted">Nenhuma consulta.</p>'}</div>
<div class="tab-pane" id="tExams">${h.exams.length?`<table class="table table-sm"><thead><tr><th>Exame</th><th>Data</th><th>Status</th><th>Resultado</th></tr></thead><tbody>${h.exams.map(e=>`<tr><td>${e.name}</td><td>${Utils.formatDate(e.date)}</td><td>${statusBadge(e.status)}</td><td>${e.results||'—'}</td></tr>`).join('')}</tbody></table>`:'<p class="text-muted">Nenhum exame.</p>'}</div>
</div></div></div></div></div>`;showModal('mView')}

// ============ PRONTUÁRIOS ============
function renderProntuarios(){showApp();const u=Auth.user();const recs=u.role==='medico'?S.records.query(r=>r.professionalId===u.profileId).sort((a,b)=>b.date.localeCompare(a.date)):S.records.getAll().sort((a,b)=>b.date.localeCompare(a.date));
document.getElementById('main-content').innerHTML=`
<div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-journal-medical me-2"></i>Prontuários</h2></div><button class="btn btn-primary" onclick="formProntuario()"><i class="bi bi-plus-lg me-1"></i>Novo Registro</button></div>
<div class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Data</th><th>Paciente</th><th>Tipo</th><th>Diagnóstico</th><th>Profissional</th></tr></thead><tbody>
${recs.map(r=>`<tr><td>${Utils.formatDateTime(r.date)}</td><td>${pName(r.patientId)}</td><td>${r.type}</td><td>${r.diagnosis||'—'}</td><td>${prName(r.professionalId)}</td></tr>`).join('')||'<tr><td colspan="5" class="text-center text-muted">Nenhum prontuário.</td></tr>'}
</tbody></table></div></div></div><div id="modalArea"></div>`;updateSidebar()}
function viewProntuario(pid){const recs=Records.byPatient(pid);const p=Patients.getById(pid);
document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mPront" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
<div class="modal-header"><h5><i class="bi bi-journal-medical me-2"></i>Prontuário — ${p?.name||'—'}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<div class="modal-body">${p?.allergies?`<div class="alert alert-warning py-2"><i class="bi bi-exclamation-triangle-fill me-1"></i><strong>Alergias:</strong> ${p.allergies}</div>`:''}
${recs.length?recs.map(r=>`<div class="card mb-3"><div class="card-body"><div class="d-flex justify-content-between mb-2"><span class="badge bg-primary">${r.type}</span><small>${Utils.formatDateTime(r.date)}</small></div>
${r.chiefComplaint?`<p><strong>QP:</strong> ${r.chiefComplaint}</p>`:''}
${r.diagnosis?`<p><strong>Diagnóstico:</strong> ${r.diagnosis} ${r.diagnosisCID?'(CID: '+r.diagnosisCID+')':''}</p>`:''}
${r.treatmentPlan?`<p><strong>Conduta:</strong> ${r.treatmentPlan}</p>`:''}
${r.vitalSigns&&Object.keys(r.vitalSigns).length?`<p><strong>Sinais Vitais:</strong> ${r.vitalSigns.pa?'PA:'+r.vitalSigns.pa+' ':''}${r.vitalSigns.fc?'FC:'+r.vitalSigns.fc+' ':''}${r.vitalSigns.temp?'T:'+r.vitalSigns.temp+'°C ':''}${r.vitalSigns.sat?'Sat:'+r.vitalSigns.sat+'%':''}</p>`:''}
<small class="text-muted">Por: ${prName(r.professionalId)}</small></div></div>`).join(''):'<p class="text-muted">Nenhum registro.</p>'}
<button class="btn btn-primary w-100" onclick="hideModal('mPront');formProntuario('${pid}')"><i class="bi bi-plus-lg me-1"></i>Novo Registro</button>
</div></div></div></div>`;showModal('mPront')}
function formProntuario(patId=''){const u=Auth.user();const ps=Patients.getAll();
document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mRec" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
<div class="modal-header"><h5>Novo Registro</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="saveRecord(event)"><div class="modal-body"><div class="row g-3">
<div class="col-md-8"><label class="form-label">Paciente *</label><select class="form-select" name="patientId" required>${ps.map(p=>`<option value="${p.id}" ${p.id===patId?'selected':''}>${p.name}</option>`).join('')}</select></div>
<div class="col-md-4"><label class="form-label">Tipo *</label><select class="form-select" name="type" required><option value="consulta">Consulta</option><option value="evolucao">Evolução</option><option value="internacao">Internação</option><option value="alta">Alta</option></select></div>
<div class="col-12"><label class="form-label">Queixa Principal</label><textarea class="form-control" name="chiefComplaint" rows="2"></textarea></div>
<div class="col-12"><label class="form-label">Exame Físico</label><textarea class="form-control" name="physicalExam" rows="2"></textarea></div>
<div class="col-md-8"><label class="form-label">Diagnóstico</label><input type="text" class="form-control" name="diagnosis"></div>
<div class="col-md-4"><label class="form-label">CID</label><input type="text" class="form-control" name="diagnosisCID"></div>
<div class="col-12"><label class="form-label">Conduta</label><textarea class="form-control" name="treatmentPlan" rows="2"></textarea></div>
<div class="col-3"><label class="form-label">PA</label><input class="form-control" name="vs_pa" placeholder="120/80"></div>
<div class="col-3"><label class="form-label">FC</label><input type="number" class="form-control" name="vs_fc"></div>
<div class="col-3"><label class="form-label">Temp°C</label><input type="number" class="form-control" name="vs_temp" step="0.1"></div>
<div class="col-3"><label class="form-label">SatO2%</label><input type="number" class="form-control" name="vs_sat"></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Salvar</button></div></form></div></div></div>`;showModal('mRec')}
function saveRecord(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const u=Auth.user();Records.create({patientId:d.patientId,professionalId:u.profileId||u.id,type:d.type,chiefComplaint:d.chiefComplaint,physicalExam:d.physicalExam,diagnosis:d.diagnosis,diagnosisCID:d.diagnosisCID,treatmentPlan:d.treatmentPlan,notes:d.notes,vitalSigns:{pa:d.vs_pa,fc:d.vs_fc,temp:d.vs_temp,sat:d.vs_sat}});hideModal('mRec');toast('Prontuário salvo!');renderProntuarios()}

// ============ PRESCRIÇÕES ============
function renderPrescricoes(){showApp();const u=Auth.user();const ps=u.role==='medico'?S.prescriptions.query(p=>p.professionalId===u.profileId).sort((a,b)=>b.date.localeCompare(a.date)):S.prescriptions.getAll().sort((a,b)=>b.date.localeCompare(a.date));
document.getElementById('main-content').innerHTML=`
<div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-prescription2 me-2"></i>Prescrições</h2></div><button class="btn btn-primary" onclick="formPrescricao()"><i class="bi bi-plus-lg me-1"></i>Nova Prescrição</button></div>
<div class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Data</th><th>Paciente</th><th>Itens</th><th>Status</th><th>Digital</th><th></th></tr></thead><tbody>
${ps.map(p=>`<tr><td>${Utils.formatDateTime(p.date)}</td><td>${pName(p.patientId)}</td><td>${p.items?.length||0} med.</td><td>${statusBadge(p.status)}</td><td>${p.isDigital?'<i class="bi bi-check-circle-fill text-success"></i>':'—'}</td><td><button class="btn btn-sm btn-outline-primary" onclick="viewPrescricao('${p.id}')"><i class="bi bi-eye"></i></button></td></tr>`).join('')||'<tr><td colspan="6" class="text-center text-muted">Nenhuma prescrição.</td></tr>'}
</tbody></table></div></div></div><div id="modalArea"></div>`;updateSidebar()}
function viewPrescricao(id){const p=Prescriptions.getById(id);if(!p)return;
document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mPresc" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
<div class="modal-header"><h5>Prescrição ${p.isDigital?'<span class="badge bg-success ms-2">Digital</span>':''}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<div class="modal-body">
<div class="row mb-3"><div class="col-6"><strong>Paciente:</strong> ${pName(p.patientId)}</div><div class="col-6"><strong>Médico:</strong> ${prName(p.professionalId)}</div><div class="col-6"><strong>Data:</strong> ${Utils.formatDateTime(p.date)}</div><div class="col-6"><strong>Status:</strong> ${statusBadge(p.status)}</div></div>
<h6>Medicamentos:</h6>
${(p.items||[]).map((it,i)=>`<div class="card mb-2"><div class="card-body py-2"><strong>${i+1}. ${it.medication}</strong><br><small>Dose: ${it.dosage} | Freq: ${it.frequency} | Duração: ${it.duration}</small></div></div>`).join('')}
<button class="btn btn-outline-primary mt-3" onclick="printPrescription('${id}')"><i class="bi bi-printer me-1"></i>Imprimir</button>
</div></div></div></div>`;showModal('mPresc')}
function printPrescription(id){const p=Prescriptions.getById(id);if(!p)return;const w=window.open('','_blank');w.document.write(`<html><head><title>Prescrição</title><style>body{font-family:Arial;padding:40px;max-width:800px;margin:auto}h1{color:#1a6bff;border-bottom:2px solid #1a6bff;padding-bottom:10px}.item{padding:10px;border:1px solid #ddd;margin:8px 0;border-radius:4px}.footer{margin-top:40px;border-top:1px solid #ccc;padding-top:20px;text-align:center}</style></head><body><h1>VidaPlus - Prescrição Médica</h1><p><strong>Paciente:</strong> ${pName(p.patientId)}<br><strong>Data:</strong> ${Utils.formatDateTime(p.date)}</p>${(p.items||[]).map((it,i)=>`<div class="item"><strong>${i+1}. ${it.medication}</strong><br>Dose: ${it.dosage} | Frequência: ${it.frequency} | Duração: ${it.duration}</div>`).join('')}<div class="footer"><p>${prName(p.professionalId)}</p><p>_________________________________<br>Assinatura / Carimbo</p></div></body></html>`);w.document.close();w.print()}
let prescItems=[];
function formPrescricao(){prescItems=[{medication:'',dosage:'',frequency:'',duration:'',notes:''}];const pats=Patients.getAll();
document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mNewPresc" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
<div class="modal-header"><h5>Nova Prescrição</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="savePresc(event)"><div class="modal-body">
<div class="mb-3"><label class="form-label">Paciente *</label><select class="form-select" name="patientId" required>${pats.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
<div class="mb-3"><div class="form-check"><input type="checkbox" class="form-check-input" name="isDigital" id="isDigPresc" checked><label class="form-check-label" for="isDigPresc">Receita Digital</label></div></div>
<h6>Medicamentos</h6><div id="prescItemsContainer"></div>
<button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="addPrescItem()"><i class="bi bi-plus"></i> Adicionar</button>
</div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Salvar</button></div></form></div></div></div>`;
renderPrescItems();showModal('mNewPresc')}
function renderPrescItems(){document.getElementById('prescItemsContainer').innerHTML=prescItems.map((it,i)=>`<div class="card mb-2"><div class="card-body py-2"><div class="row g-2"><div class="col-md-4"><input class="form-control form-control-sm" placeholder="Medicamento *" value="${it.medication}" onchange="prescItems[${i}].medication=this.value" required></div><div class="col-md-2"><input class="form-control form-control-sm" placeholder="Dose" value="${it.dosage}" onchange="prescItems[${i}].dosage=this.value"></div><div class="col-md-2"><input class="form-control form-control-sm" placeholder="Frequência" value="${it.frequency}" onchange="prescItems[${i}].frequency=this.value"></div><div class="col-md-2"><input class="form-control form-control-sm" placeholder="Duração" value="${it.duration}" onchange="prescItems[${i}].duration=this.value"></div><div class="col-md-2"><button type="button" class="btn btn-sm btn-outline-danger" onclick="prescItems.splice(${i},1);renderPrescItems()"><i class="bi bi-trash"></i></button></div></div></div></div>`).join('')}
function addPrescItem(){prescItems.push({medication:'',dosage:'',frequency:'',duration:'',notes:''});renderPrescItems()}
function savePresc(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const u=Auth.user();Prescriptions.create({patientId:d.patientId,professionalId:u.profileId||u.id,items:prescItems.filter(i=>i.medication),isDigital:e.target.querySelector('[name=isDigital]').checked});hideModal('mNewPresc');toast('Prescrição emitida!');renderPrescricoes()}

// ============ EXAMES ============
function renderExames(){showApp();const exs=Exams.getAll().sort((a,b)=>b.date.localeCompare(a.date));
document.getElementById('main-content').innerHTML=`
<div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-file-earmark-medical-fill me-2"></i>Exames</h2></div><button class="btn btn-primary" onclick="formExame()"><i class="bi bi-plus-lg me-1"></i>Solicitar Exame</button></div>
<div class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Data</th><th>Paciente</th><th>Exame</th><th>Tipo</th><th>Status</th><th>Resultado</th><th></th></tr></thead><tbody>
${exs.map(e=>`<tr><td>${Utils.formatDate(e.date)}</td><td>${pName(e.patientId)}</td><td>${e.name}</td><td>${e.type}</td><td>${statusBadge(e.status)}</td><td class="text-truncate" style="max-width:200px">${e.results||'—'}</td><td>${e.status==='solicitado'?`<button class="btn btn-sm btn-outline-success" onclick="completeExam('${e.id}')"><i class="bi bi-check-lg"></i></button>`:''}</td></tr>`).join('')||'<tr><td colspan="7" class="text-center text-muted">Nenhum exame.</td></tr>'}
</tbody></table></div></div></div><div id="modalArea"></div>`;updateSidebar()}
function formExame(){const pats=Patients.getAll();document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mExam" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
<div class="modal-header"><h5>Solicitar Exame</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="saveExam(event)"><div class="modal-body"><div class="row g-3">
<div class="col-12"><label class="form-label">Paciente *</label><select class="form-select" name="patientId" required>${pats.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
<div class="col-md-8"><label class="form-label">Exame *</label><input type="text" class="form-control" name="name" required></div>
<div class="col-md-4"><label class="form-label">Tipo</label><select class="form-select" name="type"><option value="laboratorial">Laboratorial</option><option value="imagem">Imagem</option><option value="outros">Outros</option></select></div>
<div class="col-12"><label class="form-label">Observações</label><textarea class="form-control" name="notes" rows="2"></textarea></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Solicitar</button></div></form></div></div></div>`;showModal('mExam')}
function saveExam(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const u=Auth.user();Exams.create({...d,professionalId:u.profileId||u.id});hideModal('mExam');toast('Exame solicitado!');renderExames()}
function completeExam(id){const result=prompt('Resultado do exame:');if(result!==null){Exams.update(id,{status:'concluido',results:result,resultDate:Utils.today()});toast('Exame concluído!');renderExames()}}

// ============ NOTIFICATIONS ============
function showNotifications(){const u=Auth.user();const notifs=Notif.byUser(u.profileId||u.id).slice(0,20);
const panel=document.getElementById('notif-panel');
panel.innerHTML=`<div class="notif-panel-header"><h6 class="mb-0">Notificações</h6><button class="btn btn-sm btn-link" onclick="Notif.markAllRead('${u.profileId||u.id}');updateNav();showNotifications()">Marcar lidas</button></div>
<div class="notif-panel-body">${notifs.length?notifs.map(n=>`<div class="notif-item ${n.read?'read':''}" onclick="Notif.markRead('${n.id}');updateNav()"><div class="notif-title">${n.title}</div><div class="notif-msg">${n.message}</div><small class="text-muted">${Utils.formatDateTime(n.createdAt)}</small></div>`).join(''):'<div class="p-3 text-center text-muted">Nenhuma notificação.</div>'}</div>`;
panel.classList.toggle('show')}

// ============ SIDEBAR TOGGLE ============
function toggleSidebar(){
  const sb=document.getElementById('app-sidebar');
  const ma=document.getElementById('main-area');
  const ov=document.querySelector('.sidebar-overlay');
  if(window.innerWidth<992){
    sb.classList.toggle('mobile-open');
    if(ov)ov.classList.toggle('active',sb.classList.contains('mobile-open'));
  }else{
    sb.classList.toggle('collapsed');
    ma.classList.toggle('expanded');
  }
}
function closeSidebar(){
  const sb=document.getElementById('app-sidebar');
  const ov=document.querySelector('.sidebar-overlay');
  if(window.innerWidth<992){
    sb.classList.remove('mobile-open');
    if(ov)ov.classList.remove('active');
  }else{
    sb.classList.add('collapsed');
    document.getElementById('main-area').classList.add('expanded');
  }
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded',async()=>{await seedData();initRouter()});
