// ============ PROFISSIONAIS (continuation) ============
function renderProfissionais(){showApp();const ps=Profs.getAll();
document.getElementById('main-content').innerHTML=`
<div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-person-badge-fill me-2"></i>Profissionais</h2><p class="text-muted">${ps.length} cadastrados</p></div><button class="btn btn-primary" onclick="formProf()"><i class="bi bi-plus-lg me-1"></i>Novo Profissional</button></div>
<div class="card"><div class="card-body">
<div class="input-group mb-3"><span class="input-group-text"><i class="bi bi-search"></i></span><input type="text" class="form-control" placeholder="Buscar nome, registro ou especialidade..." oninput="searchProf(this.value)"></div>
<div class="table-responsive"><table class="table table-hover"><thead><tr><th>Nome</th><th>Registro</th><th>Especialidade</th><th>Função</th><th>Unidade</th><th>Teleconsulta</th><th>Ações</th></tr></thead><tbody id="profTbody">${profRows(ps)}</tbody></table></div>
</div></div><div id="modalArea"></div>`;updateSidebar()}
function profRows(ps){if(!ps.length)return'<tr><td colspan="7" class="text-center text-muted py-4">Nenhum profissional.</td></tr>';return ps.map(p=>`<tr><td><strong>${p.name}</strong></td><td>${p.regNumber||'—'}</td><td>${p.specialty||'—'}</td><td>${roleLabel[p.role]||p.role}</td><td>${uName(p.unitId)}</td><td>${p.teleconsultEnabled?'<i class="bi bi-check-circle-fill text-success"></i>':'—'}</td><td><div class="btn-group btn-group-sm"><button class="btn btn-outline-secondary" onclick="formProf('${p.id}')"><i class="bi bi-pencil"></i></button></div></td></tr>`).join('')}
function searchProf(v){document.getElementById('profTbody').innerHTML=profRows(v?Profs.search(v):Profs.getAll())}
function formProf(id){const p=id?Profs.getById(id):{};const e=!!id;const us=Units.getAll();
document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mProf" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
<div class="modal-header"><h5>${e?'Editar':'Novo'} Profissional</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="saveProf(event,'${id||''}')"><div class="modal-body"><div class="row g-3">
<div class="col-md-6"><label class="form-label">Nome *</label><input type="text" class="form-control" name="name" value="${p.name||''}" required></div>
<div class="col-md-3"><label class="form-label">CPF</label><input type="text" class="form-control" name="cpf" value="${Utils.cpfMask(p.cpf)||''}" maxlength="14"></div>
<div class="col-md-3"><label class="form-label">Função *</label><select class="form-select" name="role" required><option value="medico" ${p.role==='medico'?'selected':''}>Médico</option><option value="enfermeiro" ${p.role==='enfermeiro'?'selected':''}>Enfermeiro</option><option value="tecnico" ${p.role==='tecnico'?'selected':''}>Técnico</option></select></div>
<div class="col-md-4"><label class="form-label">Nº Registro</label><input type="text" class="form-control" name="regNumber" value="${p.regNumber||''}" placeholder="CRM-SP 123456"></div>
<div class="col-md-4"><label class="form-label">Tipo Registro</label><select class="form-select" name="regType"><option value="CRM" ${p.regType==='CRM'?'selected':''}>CRM</option><option value="COREN" ${p.regType==='COREN'?'selected':''}>COREN</option><option value="CRF" ${p.regType==='CRF'?'selected':''}>CRF</option></select></div>
<div class="col-md-4"><label class="form-label">Especialidade</label><input type="text" class="form-control" name="specialty" value="${p.specialty||''}"></div>
<div class="col-md-4"><label class="form-label">Telefone</label><input type="tel" class="form-control" name="phone" value="${Utils.phoneMask(p.phone)||''}"></div>
<div class="col-md-4"><label class="form-label">Email</label><input type="email" class="form-control" name="email" value="${p.email||''}"></div>
<div class="col-md-4"><label class="form-label">Unidade</label><select class="form-select" name="unitId"><option value="">Selecione</option>${us.map(u=>`<option value="${u.id}" ${p.unitId===u.id?'selected':''}>${u.name}</option>`).join('')}</select></div>
<div class="col-12"><div class="form-check"><input type="checkbox" class="form-check-input" name="teleconsultEnabled" id="tcEnabled" ${p.teleconsultEnabled?'checked':''}><label class="form-check-label" for="tcEnabled">Habilitado para teleconsulta</label></div></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Salvar</button></div></form></div></div></div>`;showModal('mProf')}
function saveProf(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.teleconsultEnabled=e.target.querySelector('[name=teleconsultEnabled]').checked;if(id){Profs.update(id,d);toast('Profissional atualizado!')}else{Profs.create(d);toast('Profissional cadastrado!')}hideModal('mProf');renderProfissionais()}

// ============ AGENDAMENTOS ============
function renderAgendamentos(){showApp();const u=Auth.user();let appts;
if(u.role==='medico')appts=Appts.byProf(u.profileId);
else appts=Appts.getAll().sort((a,b)=>`${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
document.getElementById('main-content').innerHTML=`
<div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-calendar-check-fill me-2"></i>Agendamentos</h2><p class="text-muted">${appts.length} registros</p></div><button class="btn btn-primary" onclick="formAppt()"><i class="bi bi-plus-lg me-1"></i>Novo Agendamento</button></div>
<div class="card"><div class="card-body">
<div class="row g-2 mb-3"><div class="col-md-3"><input type="date" class="form-control" id="filterDate" onchange="filterAppts()"></div><div class="col-md-3"><select class="form-select" id="filterStatus" onchange="filterAppts()"><option value="">Todos os Status</option><option value="agendado">Agendado</option><option value="confirmado">Confirmado</option><option value="em_atendimento">Em Atendimento</option><option value="concluido">Concluído</option><option value="cancelado">Cancelado</option></select></div></div>
<div class="table-responsive"><table class="table table-hover"><thead><tr><th>Data</th><th>Hora</th><th>Paciente</th><th>Profissional</th><th>Tipo</th><th>Especialidade</th><th>Status</th><th>Ações</th></tr></thead><tbody id="apptTbody">${apptRows(appts)}</tbody></table></div>
</div></div><div id="modalArea"></div>`;updateSidebar()}
function apptRows(as){if(!as.length)return'<tr><td colspan="8" class="text-center text-muted py-4">Nenhum agendamento.</td></tr>';return as.map(a=>`<tr><td>${Utils.formatDate(a.date)}</td><td><strong>${a.time}</strong></td><td>${pName(a.patientId)}</td><td>${prName(a.professionalId)}</td><td>${a.type}${a.isTelemedicine?' <i class="bi bi-camera-video text-info"></i>':''}</td><td>${a.specialty||'—'}</td><td>${statusBadge(a.status)}</td><td><div class="btn-group btn-group-sm">${a.status==='agendado'?`<button class="btn btn-outline-success" onclick="Appts.update('${a.id}',{status:'em_atendimento'});renderAgendamentos();toast('Atendimento iniciado!')" title="Iniciar"><i class="bi bi-play-fill"></i></button><button class="btn btn-outline-danger" onclick="cancelAppt('${a.id}')" title="Cancelar"><i class="bi bi-x-lg"></i></button>`:''}${a.status==='em_atendimento'?`<button class="btn btn-outline-primary" onclick="Appts.update('${a.id}',{status:'concluido'});renderAgendamentos();toast('Concluído!')" title="Concluir"><i class="bi bi-check-lg"></i></button>`:''}${a.isTelemedicine&&(a.status==='agendado'||a.status==='em_atendimento')?`<button class="btn btn-outline-info" onclick="openTele('${a.id}')" title="Teleconsulta"><i class="bi bi-camera-video"></i></button>`:''}</div></td></tr>`).join('')}
function filterAppts(){const dt=document.getElementById('filterDate').value;const st=document.getElementById('filterStatus').value;const u=Auth.user();let appts=u.role==='medico'?Appts.byProf(u.profileId):Appts.getAll();if(dt)appts=appts.filter(a=>a.date===dt);if(st)appts=appts.filter(a=>a.status===st);appts.sort((a,b)=>`${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));document.getElementById('apptTbody').innerHTML=apptRows(appts)}
function cancelAppt(id){const r=prompt('Motivo do cancelamento:');if(r!==null){Appts.cancel(id,r);toast('Consulta cancelada.','warning');renderAgendamentos()}}
function formAppt(){const pats=Patients.getAll();const docs=Profs.getDoctors();const us=Units.getAll();
document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mAppt" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
<div class="modal-header"><h5>Novo Agendamento</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="saveAppt(event)"><div class="modal-body"><div class="row g-3">
<div class="col-md-6"><label class="form-label">Paciente *</label><select class="form-select" name="patientId" required>${pats.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
<div class="col-md-6"><label class="form-label">Profissional *</label><select class="form-select" name="professionalId" id="apptProf" required onchange="loadSlots()">${docs.map(d=>`<option value="${d.id}">${d.name} - ${d.specialty}</option>`).join('')}</select></div>
<div class="col-md-4"><label class="form-label">Data *</label><input type="date" class="form-control" name="date" id="apptDate" required min="${Utils.today()}" onchange="loadSlots()"></div>
<div class="col-md-4"><label class="form-label">Horário *</label><select class="form-select" name="time" id="apptTime" required><option value="">Selecione data e profissional</option></select></div>
<div class="col-md-4"><label class="form-label">Tipo *</label><select class="form-select" name="type" required><option value="consulta">Consulta</option><option value="retorno">Retorno</option><option value="exame">Exame</option><option value="teleconsulta">Teleconsulta</option></select></div>
<div class="col-md-6"><label class="form-label">Especialidade</label><input type="text" class="form-control" name="specialty" id="apptSpec"></div>
<div class="col-md-6"><label class="form-label">Unidade</label><select class="form-select" name="unitId">${us.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}</select></div>
<div class="col-12"><div class="form-check"><input type="checkbox" class="form-check-input" name="isTelemedicine" id="isTele"><label class="form-check-label" for="isTele">Teleconsulta (atendimento remoto via vídeo)</label></div></div>
<div class="col-12"><label class="form-label">Observações</label><textarea class="form-control" name="notes" rows="2"></textarea></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Agendar</button></div></form></div></div></div>`;showModal('mAppt');
document.querySelector('[name=type]').addEventListener('change',function(){document.getElementById('isTele').checked=this.value==='teleconsulta';const prof=Profs.getById(document.getElementById('apptProf').value);if(prof)document.getElementById('apptSpec').value=prof.specialty||''});
document.getElementById('apptProf').addEventListener('change',function(){const prof=Profs.getById(this.value);if(prof)document.getElementById('apptSpec').value=prof.specialty||''});}
function loadSlots(){const profId=document.getElementById('apptProf').value;const date=document.getElementById('apptDate').value;if(!profId||!date)return;const slots=Appts.availableSlots(profId,date);document.getElementById('apptTime').innerHTML=slots.length?slots.map(s=>`<option value="${s}">${s}</option>`).join(''):'<option value="">Sem horários disponíveis</option>'}
function saveAppt(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.isTelemedicine=e.target.querySelector('[name=isTelemedicine]').checked;const r=Appts.create(d);if(r.ok){hideModal('mAppt');toast('Consulta agendada!');renderAgendamentos()}else{toast(r.msg,'danger')}}

// ============ LEITOS ============
function renderLeitos(){showApp();const bs=Beds.getAll();const st=Beds.stats();
document.getElementById('main-content').innerHTML=`
<div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-building-fill me-2"></i>Gestão de Leitos</h2><p class="text-muted">Ocupação: ${st.rate}%</p></div><button class="btn btn-primary" onclick="formBed()"><i class="bi bi-plus-lg me-1"></i>Novo Leito</button></div>
<div class="row g-3 mb-4">
${statCard('bi-check-circle-fill','Disponíveis',st.available,'var(--green)')}
${statCard('bi-person-fill-lock','Ocupados',st.occupied,'var(--red)')}
${statCard('bi-wrench-adjustable','Manutenção',st.maintenance,'var(--gray)')}
${statCard('bi-hospital','Total',st.total,'var(--blue)')}
</div>
<div class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Leito</th><th>Ala</th><th>Andar</th><th>Tipo</th><th>Status</th><th>Paciente</th><th>Admissão</th><th>Ações</th></tr></thead><tbody>
${bs.map(b=>`<tr><td><strong>${b.number}</strong></td><td>${b.ward}</td><td>${b.floor}º</td><td>${b.type}</td><td>${statusBadge(b.status)}</td><td>${b.patientId?pName(b.patientId):'—'}</td><td>${b.admissionDate?Utils.formatDateTime(b.admissionDate):'—'}</td><td><div class="btn-group btn-group-sm">${b.status==='disponivel'?`<button class="btn btn-outline-success" onclick="admitBed('${b.id}')" title="Internar"><i class="bi bi-person-plus"></i></button>`:''}${b.status==='ocupado'?`<button class="btn btn-outline-warning" onclick="dischargeBed('${b.id}')" title="Alta"><i class="bi bi-person-dash"></i></button>`:''}<button class="btn btn-outline-secondary" onclick="toggleBedMaint('${b.id}')" title="Manutenção"><i class="bi bi-wrench"></i></button></div></td></tr>`).join('')}
</tbody></table></div></div></div><div id="modalArea"></div>`;updateSidebar()}
function formBed(){const us=Units.getAll();document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mBed" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
<div class="modal-header"><h5>Novo Leito</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="saveBed(event)"><div class="modal-body"><div class="row g-3">
<div class="col-md-4"><label class="form-label">Número *</label><input type="text" class="form-control" name="number" required></div>
<div class="col-md-4"><label class="form-label">Ala *</label><input type="text" class="form-control" name="ward" required></div>
<div class="col-md-4"><label class="form-label">Andar</label><input type="number" class="form-control" name="floor" value="1"></div>
<div class="col-md-6"><label class="form-label">Tipo</label><select class="form-select" name="type"><option>enfermaria</option><option>UTI</option><option>semi-intensiva</option><option>isolamento</option><option>pediatria</option></select></div>
<div class="col-md-6"><label class="form-label">Unidade</label><select class="form-select" name="unitId">${us.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}</select></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Salvar</button></div></form></div></div></div>`;showModal('mBed')}
function saveBed(e){e.preventDefault();Beds.create(Object.fromEntries(new FormData(e.target)));hideModal('mBed');toast('Leito criado!');renderLeitos()}
function admitBed(bedId){const pats=Patients.getAll();document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mAdmit" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
<div class="modal-header"><h5>Internar Paciente</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="doAdmit(event,'${bedId}')"><div class="modal-body"><div class="row g-3">
<div class="col-12"><label class="form-label">Paciente *</label><select class="form-select" name="patientId" required>${pats.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
<div class="col-12"><label class="form-label">Previsão de Alta</label><input type="date" class="form-control" name="expectedDischarge" min="${Utils.today()}"></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-success"><i class="bi bi-check-lg me-1"></i>Internar</button></div></form></div></div></div>`;showModal('mAdmit')}
function doAdmit(e,bedId){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const r=Beds.admit(bedId,d.patientId,d.expectedDischarge);if(r.ok){hideModal('mAdmit');toast('Paciente internado!');renderLeitos()}else toast(r.msg,'danger')}
function dischargeBed(bedId){if(confirm('Confirma alta do paciente?')){Beds.discharge(bedId);toast('Alta realizada!');renderLeitos()}}
function toggleBedMaint(bedId){const b=S.beds.getById(bedId);if(!b)return;b.status=b.status==='manutencao'?'disponivel':'manutencao';b.patientId=null;S.beds.save(b);toast(b.status==='manutencao'?'Leito em manutenção':'Leito disponível');renderLeitos()}

// ============ SUPRIMENTOS ============
function renderSuprimentos(){showApp();const ss=Supplies.getAll();const low=Supplies.lowStock();
document.getElementById('main-content').innerHTML=`
<div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-box-seam-fill me-2"></i>Suprimentos</h2><p class="text-muted">${ss.length} itens${low.length?` | <span class="text-danger">${low.length} com estoque baixo</span>`:''}</p></div><button class="btn btn-primary" onclick="formSupply()"><i class="bi bi-plus-lg me-1"></i>Novo Item</button></div>
<div class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Item</th><th>Categoria</th><th>Quantidade</th><th>Mín.</th><th>Unidade</th><th>Custo Unit.</th><th>Validade</th><th>Ações</th></tr></thead><tbody>
${ss.map(s=>{const low=s.quantity<=s.minQuantity;return`<tr class="${low?'table-warning':''}"><td><strong>${s.name}</strong>${low?' <i class="bi bi-exclamation-triangle-fill text-danger"></i>':''}</td><td>${s.category}</td><td>${s.quantity}</td><td>${s.minQuantity}</td><td>${s.unit}</td><td>${Utils.currency(s.costPerUnit)}</td><td>${s.expirationDate?Utils.formatDate(s.expirationDate):'—'}</td><td><div class="btn-group btn-group-sm"><button class="btn btn-outline-success" onclick="adjustStock('${s.id}',1)" title="+1"><i class="bi bi-plus"></i></button><button class="btn btn-outline-danger" onclick="adjustStock('${s.id}',-1)" title="-1"><i class="bi bi-dash"></i></button><button class="btn btn-outline-secondary" onclick="formSupply('${s.id}')"><i class="bi bi-pencil"></i></button></div></td></tr>`}).join('')||'<tr><td colspan="8" class="text-center text-muted">Nenhum suprimento.</td></tr>'}
</tbody></table></div></div></div><div id="modalArea"></div>`;updateSidebar()}
function adjustStock(id,qty){const amount=prompt(`Quantidade a ${qty>0?'adicionar':'remover'}:`,Math.abs(qty));if(amount!==null){Supplies.adjustStock(id,qty>0?parseInt(amount):-parseInt(amount));toast('Estoque ajustado!');renderSuprimentos()}}
function formSupply(id){const s=id?S.supplies.getById(id):{};const e=!!id;const us=Units.getAll();
document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mSup" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
<div class="modal-header"><h5>${e?'Editar':'Novo'} Suprimento</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="saveSupply(event,'${id||''}')"><div class="modal-body"><div class="row g-3">
<div class="col-md-8"><label class="form-label">Nome *</label><input type="text" class="form-control" name="name" value="${s.name||''}" required></div>
<div class="col-md-4"><label class="form-label">Categoria</label><select class="form-select" name="category"><option ${s.category==='medicamento'?'selected':''}>medicamento</option><option ${s.category==='material'?'selected':''}>material</option><option ${s.category==='EPI'?'selected':''}>EPI</option><option ${s.category==='equipamento'?'selected':''}>equipamento</option></select></div>
<div class="col-md-3"><label class="form-label">Quantidade</label><input type="number" class="form-control" name="quantity" value="${s.quantity||0}"></div>
<div class="col-md-3"><label class="form-label">Mínimo</label><input type="number" class="form-control" name="minQuantity" value="${s.minQuantity||10}"></div>
<div class="col-md-3"><label class="form-label">Unidade</label><input type="text" class="form-control" name="unit" value="${s.unit||''}"></div>
<div class="col-md-3"><label class="form-label">Custo Unit.</label><input type="number" class="form-control" name="costPerUnit" value="${s.costPerUnit||0}" step="0.01"></div>
<div class="col-md-4"><label class="form-label">Lote</label><input type="text" class="form-control" name="lotNumber" value="${s.lotNumber||''}"></div>
<div class="col-md-4"><label class="form-label">Validade</label><input type="date" class="form-control" name="expirationDate" value="${s.expirationDate||''}"></div>
<div class="col-md-4"><label class="form-label">Fornecedor</label><input type="text" class="form-control" name="supplier" value="${s.supplier||''}"></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Salvar</button></div></form></div></div></div>`;showModal('mSup')}
function saveSupply(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(id){Supplies.update(id,d);toast('Suprimento atualizado!')}else{Supplies.create(d);toast('Suprimento cadastrado!')}hideModal('mSup');renderSuprimentos()}

// ============ TELEMEDICINA ============
function renderTelemedicina(){showApp();const u=Auth.user();const teleAppts=Appts.getAll().filter(a=>a.isTelemedicine&&a.status!=='cancelado').sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
document.getElementById('main-content').innerHTML=`
<div class="page-header"><h2><i class="bi bi-camera-video-fill me-2"></i>Telemedicina</h2><p class="text-muted">Teleconsultas via Jitsi Meet</p></div>
<div class="alert alert-info"><i class="bi bi-info-circle me-2"></i>As teleconsultas utilizam a plataforma Jitsi Meet para videochamadas seguras e criptografadas. Nenhum software adicional é necessário.</div>
<div class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Data</th><th>Hora</th><th>Paciente</th><th>Profissional</th><th>Especialidade</th><th>Status</th><th>Ações</th></tr></thead><tbody>
${teleAppts.map(a=>`<tr><td>${Utils.formatDate(a.date)}</td><td><strong>${a.time}</strong></td><td>${pName(a.patientId)}</td><td>${prName(a.professionalId)}</td><td>${a.specialty||'—'}</td><td>${statusBadge(a.status)}</td><td>${a.status!=='concluido'?`<button class="btn btn-sm btn-primary" onclick="openTele('${a.id}')"><i class="bi bi-camera-video me-1"></i>Entrar</button>`:''}</td></tr>`).join('')||'<tr><td colspan="7" class="text-center text-muted">Nenhuma teleconsulta agendada.</td></tr>'}
</tbody></table></div></div></div><div id="teleContainer"></div>`;updateSidebar()}
function openTele(apptId){const a=Appts.getById(apptId);if(!a)return;let tc=Tele.byAppt(apptId);if(!tc)tc=Tele.createRoom(apptId);const url=Tele.jitsiUrl(tc.roomName);
document.getElementById('teleContainer').innerHTML=`
<div class="modal fade" id="mTele" tabindex="-1" data-bs-backdrop="static"><div class="modal-dialog modal-xl"><div class="modal-content">
<div class="modal-header bg-primary text-white"><h5><i class="bi bi-camera-video-fill me-2"></i>Teleconsulta — ${pName(a.patientId)}</h5>
<div class="ms-auto me-3">${statusBadge(tc.status)}</div><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
<div class="modal-body p-0"><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden"><iframe src="${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allow="camera;microphone;fullscreen;display-capture" allowfullscreen></iframe></div></div>
<div class="modal-footer justify-content-between">
<div><small class="text-muted">Sala: ${tc.roomName}</small></div>
<div class="btn-group">${tc.status==='aguardando'?`<button class="btn btn-success" onclick="Tele.start('${tc.id}');toast('Teleconsulta iniciada!');document.querySelector('#mTele .modal-header .badge').outerHTML=statusBadge('em_andamento')"><i class="bi bi-play-fill me-1"></i>Iniciar Consulta</button>`:''}<button class="btn btn-outline-primary" onclick="window.open('${url}','_blank')"><i class="bi bi-box-arrow-up-right me-1"></i>Abrir em Nova Aba</button><button class="btn btn-danger" onclick="endTeleConsult('${tc.id}')"><i class="bi bi-telephone-x me-1"></i>Encerrar</button></div>
</div></div></div></div>`;showModal('mTele')}
function endTeleConsult(tcId){const notes=prompt('Observações da teleconsulta:');Tele.end(tcId,notes||'');hideModal('mTele');toast('Teleconsulta encerrada!');renderTelemedicina()}

// ============ FINANCEIRO ============
function renderFinanceiro(){showApp();const now=new Date();const m=now.getMonth()+1;const y=now.getFullYear();const s=Financial.summary(m,y);
document.getElementById('main-content').innerHTML=`
<div class="page-header"><h2><i class="bi bi-currency-dollar me-2"></i>Financeiro</h2><p class="text-muted">Resumo de ${String(m).padStart(2,'0')}/${y}</p></div>
<div class="row g-3 mb-4">
${statCard('bi-arrow-up-circle-fill','Receitas',Utils.currency(s.income),'var(--green)')}
${statCard('bi-arrow-down-circle-fill','Despesas',Utils.currency(s.expense),'var(--red)')}
${statCard('bi-wallet2','Saldo',Utils.currency(s.balance),s.balance>=0?'var(--green)':'var(--red)')}
</div>
<div class="card mb-3"><div class="card-header d-flex justify-content-between"><h5 class="mb-0">Lançamentos</h5><button class="btn btn-sm btn-primary" onclick="formFinancial()"><i class="bi bi-plus-lg me-1"></i>Novo</button></div><div class="card-body">
<div class="table-responsive"><table class="table table-hover"><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Status</th></tr></thead><tbody>
${s.records.sort((a,b)=>b.date.localeCompare(a.date)).map(r=>`<tr><td>${Utils.formatDate(r.date)}</td><td>${r.type==='receita'?'<span class="text-success"><i class="bi bi-arrow-up"></i> Receita</span>':'<span class="text-danger"><i class="bi bi-arrow-down"></i> Despesa</span>'}</td><td>${r.category}</td><td>${r.description}</td><td class="${r.type==='receita'?'text-success':'text-danger'}"><strong>${Utils.currency(r.amount)}</strong></td><td>${statusBadge(r.status)}</td></tr>`).join('')||'<tr><td colspan="6" class="text-center text-muted">Nenhum lançamento.</td></tr>'}
</tbody></table></div></div></div><div id="modalArea"></div>`;updateSidebar()}
function formFinancial(){document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mFin" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
<div class="modal-header"><h5>Novo Lançamento</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="saveFin(event)"><div class="modal-body"><div class="row g-3">
<div class="col-md-6"><label class="form-label">Tipo *</label><select class="form-select" name="type" required><option value="receita">Receita</option><option value="despesa">Despesa</option></select></div>
<div class="col-md-6"><label class="form-label">Categoria *</label><input type="text" class="form-control" name="category" required placeholder="Ex: Consultas, Suprimentos..."></div>
<div class="col-12"><label class="form-label">Descrição *</label><input type="text" class="form-control" name="description" required></div>
<div class="col-md-6"><label class="form-label">Valor *</label><input type="number" class="form-control" name="amount" step="0.01" required></div>
<div class="col-md-6"><label class="form-label">Data</label><input type="date" class="form-control" name="date" value="${Utils.today()}"></div>
<div class="col-md-6"><label class="form-label">Status</label><select class="form-select" name="status"><option value="pendente">Pendente</option><option value="pago">Pago</option></select></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Salvar</button></div></form></div></div></div>`;showModal('mFin')}
function saveFin(e){e.preventDefault();Financial.add(Object.fromEntries(new FormData(e.target)));hideModal('mFin');toast('Lançamento registrado!');renderFinanceiro()}

// ============ RELATÓRIOS ============
function renderRelatorios(){showApp();const bySpec=Reports.apptsBySpecialty();const s=Reports.dashboard();
document.getElementById('main-content').innerHTML=`
<div class="page-header"><h2><i class="bi bi-graph-up me-2"></i>Relatórios</h2></div>
<div class="row g-3">
<div class="col-md-6"><div class="card"><div class="card-header"><h5 class="mb-0">Consultas por Especialidade</h5></div><div class="card-body">
${bySpec.length?`<table class="table table-sm"><tbody>${bySpec.map(s=>`<tr><td>${s.specialty}</td><td><div class="progress"><div class="progress-bar" style="width:${(s.count/Math.max(...bySpec.map(x=>x.count))*100)}%">${s.count}</div></div></td></tr>`).join('')}</tbody></table>`:'<p class="text-muted">Sem dados.</p>'}
</div></div></div>
<div class="col-md-6"><div class="card"><div class="card-header"><h5 class="mb-0">Resumo Geral</h5></div><div class="card-body">
<table class="table table-sm"><tbody>
<tr><td>Total de Pacientes</td><td><strong>${s.patients}</strong></td></tr>
<tr><td>Total de Profissionais</td><td><strong>${s.professionals}</strong></td></tr>
<tr><td>Consultas Hoje</td><td><strong>${s.apptsToday}</strong></td></tr>
<tr><td>Consultas Próx. 7 dias</td><td><strong>${s.apptsUpcoming}</strong></td></tr>
<tr><td>Taxa de Ocupação (Leitos)</td><td><strong>${s.beds.rate}%</strong></td></tr>
<tr><td>Itens com Estoque Baixo</td><td><strong class="${s.lowStock>0?'text-danger':''}">${s.lowStock}</strong></td></tr>
<tr><td>Teleconsultas (total)</td><td><strong>${s.teleTotal}</strong></td></tr>
</tbody></table></div></div></div>
</div>`;updateSidebar()}

// ============ AUDITORIA & LGPD ============
function renderAuditoria(){showApp();const logs=Audit.getLogs().slice(0,100);
document.getElementById('main-content').innerHTML=`
<div class="page-header"><h2><i class="bi bi-shield-lock-fill me-2"></i>Auditoria & LGPD</h2><p class="text-muted">Registro de ações do sistema (últimos 100)</p></div>
<div class="row g-3 mb-4">
<div class="col-md-6"><div class="card"><div class="card-header"><h5 class="mb-0"><i class="bi bi-shield-check me-2"></i>Compliance LGPD</h5></div><div class="card-body">
<ul class="list-unstyled">
<li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Dados sensíveis criptografados em trânsito</li>
<li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Controle de acesso por perfil (RBAC)</li>
<li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Consentimento LGPD no cadastro de pacientes</li>
<li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Registro completo de logs de auditoria</li>
<li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Teleconsultas com criptografia E2E (Jitsi)</li>
<li><i class="bi bi-check-circle-fill text-success me-2"></i>Acesso mínimo necessário por função</li>
</ul>
</div></div></div>
<div class="col-md-6"><div class="card"><div class="card-header"><h5 class="mb-0"><i class="bi bi-people me-2"></i>Consentimento LGPD</h5></div><div class="card-body">
${(()=>{const all=Patients.getAll();const consented=all.filter(p=>p.consentLGPD);return`<div class="mb-3"><strong>${consented.length}</strong> de <strong>${all.length}</strong> pacientes com consentimento</div><div class="progress mb-2" style="height:20px"><div class="progress-bar bg-success" style="width:${all.length?(consented.length/all.length*100).toFixed(0):0}%">${all.length?(consented.length/all.length*100).toFixed(0):0}%</div></div>${all.filter(p=>!p.consentLGPD).length?`<small class="text-danger">${all.filter(p=>!p.consentLGPD).length} paciente(s) sem consentimento</small>`:''}`})()}
</div></div></div></div>
<div class="card"><div class="card-header d-flex justify-content-between"><h5 class="mb-0">Logs de Auditoria</h5><div class="d-flex gap-2"><select class="form-select form-select-sm" style="width:auto" id="filterEntity" onchange="filterLogs()"><option value="">Todas Entidades</option><option>users</option><option>patients</option><option>professionals</option><option>appointments</option><option>records</option><option>prescriptions</option><option>beds</option><option>supplies</option><option>teleconsults</option></select></div></div><div class="card-body p-0">
<div class="table-responsive"><table class="table table-sm table-hover mb-0"><thead><tr><th>Timestamp</th><th>Ação</th><th>Entidade</th><th>Usuário</th><th>Detalhes</th></tr></thead><tbody id="auditTbody">${auditRows(logs)}</tbody></table></div>
</div></div>`;updateSidebar()}
function auditRows(logs){return logs.map(l=>`<tr><td><small>${Utils.formatDateTime(l.timestamp)}</small></td><td><span class="badge bg-secondary">${l.action}</span></td><td>${l.entity}</td><td>${l.userName} <small class="text-muted">(${l.userRole})</small></td><td><small>${l.details}</small></td></tr>`).join('')||'<tr><td colspan="5" class="text-center text-muted">Nenhum log.</td></tr>'}
function filterLogs(){const entity=document.getElementById('filterEntity').value;const logs=Audit.getLogs(entity?{entity}:{}).slice(0,100);document.getElementById('auditTbody').innerHTML=auditRows(logs)}

// ============ USUÁRIOS ============
function renderUsuarios(){showApp();const users=S.users.getAll();
document.getElementById('main-content').innerHTML=`
<div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-person-gear me-2"></i>Usuários do Sistema</h2></div><button class="btn btn-primary" onclick="formUser()"><i class="bi bi-plus-lg me-1"></i>Novo Usuário</button></div>
<div class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th><th>Criado em</th></tr></thead><tbody>
${users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td><span class="badge bg-primary">${roleLabel[u.role]||u.role}</span></td><td>${u.active?'<span class="badge bg-success">Ativo</span>':'<span class="badge bg-danger">Inativo</span>'}</td><td>${Utils.formatDateTime(u.createdAt)}</td></tr>`).join('')}
</tbody></table></div></div></div><div id="modalArea"></div>`;updateSidebar()}
function formUser(){document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mUser" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
<div class="modal-header"><h5>Novo Usuário</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="saveUser(event)"><div class="modal-body"><div class="row g-3">
<div class="col-12"><label class="form-label">Nome *</label><input type="text" class="form-control" name="name" required></div>
<div class="col-12"><label class="form-label">Email *</label><input type="email" class="form-control" name="email" required></div>
<div class="col-md-6"><label class="form-label">Senha *</label><input type="password" class="form-control" name="password" required minlength="6"></div>
<div class="col-md-6"><label class="form-label">Perfil *</label><select class="form-select" name="role" required><option value="admin">Administrador</option><option value="medico">Médico</option><option value="enfermeiro">Enfermeiro</option><option value="tecnico">Técnico</option><option value="paciente">Paciente</option><option value="recepcionista">Recepcionista</option></select></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Criar</button></div></form></div></div></div>`;showModal('mUser')}
async function saveUser(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const r=await Auth.createUser(d);if(r.ok){hideModal('mUser');toast('Usuário criado!');renderUsuarios()}else toast(r.msg,'danger')}

// ============ UNIDADES ============
function renderUnidades(){showApp();const us=Units.getAll();
document.getElementById('main-content').innerHTML=`
<div class="page-header d-flex justify-content-between align-items-start flex-wrap gap-2"><div><h2><i class="bi bi-hospital-fill me-2"></i>Unidades</h2></div><button class="btn btn-primary" onclick="formUnit()"><i class="bi bi-plus-lg me-1"></i>Nova Unidade</button></div>
<div class="row g-3">${us.map(u=>`<div class="col-md-6"><div class="card"><div class="card-body"><h5>${u.name}</h5><span class="badge bg-primary mb-2">${u.type}</span><p class="mb-1"><i class="bi bi-geo-alt me-1"></i>${u.address||'—'}</p><p class="mb-0"><i class="bi bi-telephone me-1"></i>${Utils.phoneMask(u.phone)||'—'}</p></div></div></div>`).join('')}</div><div id="modalArea"></div>`;updateSidebar()}
function formUnit(){document.getElementById('modalArea').innerHTML=`
<div class="modal fade" id="mUnit" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
<div class="modal-header"><h5>Nova Unidade</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
<form onsubmit="saveUnit(event)"><div class="modal-body"><div class="row g-3">
<div class="col-12"><label class="form-label">Nome *</label><input type="text" class="form-control" name="name" required></div>
<div class="col-md-6"><label class="form-label">Tipo</label><select class="form-select" name="type"><option>hospital</option><option>clinica</option><option>laboratorio</option><option>homecare</option></select></div>
<div class="col-md-6"><label class="form-label">Telefone</label><input type="tel" class="form-control" name="phone"></div>
<div class="col-12"><label class="form-label">Endereço</label><input type="text" class="form-control" name="address"></div>
</div></div><div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Salvar</button></div></form></div></div></div>`;showModal('mUnit')}
function saveUnit(e){e.preventDefault();Units.create(Object.fromEntries(new FormData(e.target)));hideModal('mUnit');toast('Unidade criada!');renderUnidades()}

// ============ PATIENT VIEWS ============
function renderMeusAgendamentos(){showApp();const u=Auth.user();const appts=Appts.byPatient(u.profileId);
document.getElementById('main-content').innerHTML=`
<div class="page-header"><h2><i class="bi bi-calendar-check-fill me-2"></i>Minhas Consultas</h2></div>
<div class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Data</th><th>Hora</th><th>Profissional</th><th>Tipo</th><th>Status</th><th></th></tr></thead><tbody>
${appts.map(a=>`<tr><td>${Utils.formatDate(a.date)}</td><td><strong>${a.time}</strong></td><td>${prName(a.professionalId)}</td><td>${a.type}${a.isTelemedicine?' <i class="bi bi-camera-video text-info"></i>':''}</td><td>${statusBadge(a.status)}</td><td>${a.isTelemedicine&&a.status!=='concluido'&&a.status!=='cancelado'?`<button class="btn btn-sm btn-primary" onclick="openTele('${a.id}')"><i class="bi bi-camera-video"></i></button>`:''}${a.status==='agendado'?`<button class="btn btn-sm btn-outline-danger" onclick="cancelAppt('${a.id}');renderMeusAgendamentos()"><i class="bi bi-x-lg"></i></button>`:''}</td></tr>`).join('')||'<tr><td colspan="6" class="text-center text-muted">Nenhuma consulta.</td></tr>'}
</tbody></table></div></div></div><div id="teleContainer"></div>`;updateSidebar()}
function renderMeuProntuario(){showApp();const u=Auth.user();const recs=Records.byPatient(u.profileId);
document.getElementById('main-content').innerHTML=`
<div class="page-header"><h2><i class="bi bi-journal-medical me-2"></i>Meu Prontuário</h2></div>
${recs.length?recs.map(r=>`<div class="card mb-3"><div class="card-body"><div class="d-flex justify-content-between mb-2"><span class="badge bg-primary">${r.type}</span><small>${Utils.formatDateTime(r.date)}</small></div>
${r.chiefComplaint?`<p><strong>Queixa:</strong> ${r.chiefComplaint}</p>`:''}
${r.diagnosis?`<p><strong>Diagnóstico:</strong> ${r.diagnosis} ${r.diagnosisCID?'(CID: '+r.diagnosisCID+')':''}</p>`:''}
${r.treatmentPlan?`<p><strong>Conduta:</strong> ${r.treatmentPlan}</p>`:''}
<small class="text-muted">Por: ${prName(r.professionalId)}</small></div></div>`).join(''):'<div class="card"><div class="card-body text-center text-muted">Nenhum registro.</div></div>'}`;updateSidebar()}
function renderMinhasPrescricoes(){showApp();const u=Auth.user();const ps=Prescriptions.byPatient(u.profileId);
document.getElementById('main-content').innerHTML=`
<div class="page-header"><h2><i class="bi bi-prescription2 me-2"></i>Minhas Receitas</h2></div>
${ps.length?ps.map(p=>`<div class="card mb-3"><div class="card-body"><div class="d-flex justify-content-between mb-2"><div>${statusBadge(p.status)} ${p.isDigital?'<span class="badge bg-info ms-1">Digital</span>':''}</div><small>${Utils.formatDateTime(p.date)}</small></div>
${(p.items||[]).map((it,i)=>`<div class="border-bottom py-1"><strong>${i+1}. ${it.medication}</strong> — ${it.dosage}, ${it.frequency}, ${it.duration}</div>`).join('')}
<small class="text-muted mt-2 d-block">Por: ${prName(p.professionalId)}</small>
<button class="btn btn-sm btn-outline-primary mt-2" onclick="printPrescription('${p.id}')"><i class="bi bi-printer me-1"></i>Imprimir</button>
</div></div>`).join(''):'<div class="card"><div class="card-body text-center text-muted">Nenhuma prescrição.</div></div>'}`;updateSidebar()}
function renderMeusExames(){showApp();const u=Auth.user();const exs=Exams.byPatient(u.profileId);
document.getElementById('main-content').innerHTML=`
<div class="page-header"><h2><i class="bi bi-file-earmark-medical-fill me-2"></i>Meus Exames</h2></div>
<div class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Exame</th><th>Data</th><th>Tipo</th><th>Status</th><th>Resultado</th></tr></thead><tbody>
${exs.map(e=>`<tr><td><strong>${e.name}</strong></td><td>${Utils.formatDate(e.date)}</td><td>${e.type}</td><td>${statusBadge(e.status)}</td><td>${e.results||'Aguardando'}</td></tr>`).join('')||'<tr><td colspan="5" class="text-center text-muted">Nenhum exame.</td></tr>'}
</tbody></table></div></div></div>`;updateSidebar()}

// (showNotifications, toggleSidebar, closeSidebar, init are in app.js)
