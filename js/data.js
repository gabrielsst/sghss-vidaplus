/**
 * SGHSS - Camada de Dados (LocalStorage Backend)
 */
const Utils={uuid:()=>crypto.randomUUID?.()??'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16)}),now:()=>new Date().toISOString(),today:()=>new Date().toISOString().split('T')[0],formatDate:i=>{if(!i)return'—';return new Date(i+'T12:00:00').toLocaleDateString('pt-BR')},formatDateTime:i=>{if(!i)return'—';return new Date(i).toLocaleString('pt-BR')},cpfMask:c=>{if(!c)return'';c=c.replace(/\D/g,'');return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4')},phoneMask:p=>{if(!p)return'';p=p.replace(/\D/g,'');if(p.length===11)return p.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');return p.replace(/(\d{2})(\d{4})(\d{4})/,'($1) $2-$3')},hashPassword:async pw=>{const e=new TextEncoder();const d=e.encode(pw+'sghss_salt');const h=await crypto.subtle.digest('SHA-256',d);return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('')},currency:v=>'R$ '+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})};

class Store{constructor(ns){this.ns=`sghss_${ns}`}
_k(id){return`${this.ns}_${id}`}
_ik(){return`${this.ns}__idx`}
getIndex(){try{return JSON.parse(localStorage.getItem(this._ik()))||[]}catch{return[]}}
setIndex(ids){localStorage.setItem(this._ik(),JSON.stringify(ids))}
getAll(){return this.getIndex().map(id=>this.getById(id)).filter(Boolean)}
getById(id){try{const r=localStorage.getItem(this._k(id));return r?JSON.parse(r):null}catch{return null}}
save(item){if(!item.id)item.id=Utils.uuid();item.updatedAt=Utils.now();if(!item.createdAt)item.createdAt=Utils.now();localStorage.setItem(this._k(item.id),JSON.stringify(item));const idx=this.getIndex();if(!idx.includes(item.id)){idx.push(item.id);this.setIndex(idx)}return item}
delete(id){localStorage.removeItem(this._k(id));this.setIndex(this.getIndex().filter(i=>i!==id))}
query(fn){return this.getAll().filter(fn)}
count(){return this.getIndex().length}
clear(){this.getIndex().forEach(id=>localStorage.removeItem(this._k(id)));this.setIndex([])}}

const S={users:new Store('users'),patients:new Store('patients'),professionals:new Store('professionals'),appointments:new Store('appointments'),records:new Store('records'),prescriptions:new Store('prescriptions'),beds:new Store('beds'),supplies:new Store('supplies'),units:new Store('units'),teleconsults:new Store('teleconsults'),notifications:new Store('notifications'),auditLogs:new Store('audit'),financial:new Store('financial'),exams:new Store('exams')};

// Audit Service
const Audit={log(action,entity,entityId,details=''){const u=Auth.user();S.auditLogs.save({action,entity,entityId,details,userId:u?.id||'system',userName:u?.name||'Sistema',userRole:u?.role||'system',timestamp:Utils.now()})},getLogs(f={}){let l=S.auditLogs.getAll();if(f.entity)l=l.filter(x=>x.entity===f.entity);if(f.action)l=l.filter(x=>x.action===f.action);if(f.dateFrom)l=l.filter(x=>x.timestamp>=f.dateFrom);if(f.dateTo)l=l.filter(x=>x.timestamp<=f.dateTo);return l.sort((a,b)=>b.timestamp.localeCompare(a.timestamp))}};

// Auth Service
const Auth={SK:'sghss_session',async login(email,pw){const hash=await Utils.hashPassword(pw);const u=S.users.getAll().find(u=>u.email===email&&u.passwordHash===hash&&u.active);if(!u)return{ok:false,msg:'Credenciais inválidas ou usuário inativo.'};const sess={id:u.id,name:u.name,email:u.email,role:u.role,profileId:u.profileId,loginAt:Utils.now()};localStorage.setItem(this.SK,JSON.stringify(sess));Audit.log('LOGIN','users',u.id,u.email);return{ok:true,user:sess}},logout(){const u=this.user();if(u)Audit.log('LOGOUT','users',u.id,u.email);localStorage.removeItem(this.SK)},user(){try{return JSON.parse(localStorage.getItem(this.SK))}catch{return null}},loggedIn(){return!!this.user()},hasRole(...r){const u=this.user();return u&&r.includes(u.role)},async createUser(d){if(S.users.getAll().find(u=>u.email===d.email))return{ok:false,msg:'E-mail já cadastrado.'};const hash=await Utils.hashPassword(d.password);const u=S.users.save({name:d.name,email:d.email,passwordHash:hash,role:d.role,profileId:d.profileId||null,active:true});Audit.log('CREATE','users',u.id,`${d.email} (${d.role})`);return{ok:true,user:u}}};

// Patient Service
const Patients={create(d){const p=S.patients.save({name:d.name,cpf:d.cpf?.replace(/\D/g,''),birthDate:d.birthDate,gender:d.gender,phone:d.phone?.replace(/\D/g,''),email:d.email,address:d.address,city:d.city,state:d.state,zipCode:d.zipCode,bloodType:d.bloodType,allergies:d.allergies||'',emergencyContact:d.emergencyContact||'',emergencyPhone:d.emergencyPhone||'',healthInsurance:d.healthInsurance||'',consentLGPD:d.consentLGPD||false,consentDate:d.consentLGPD?Utils.now():null,active:true});Audit.log('CREATE','patients',p.id,p.name);return p},
update(id,d){const e=S.patients.getById(id);if(!e)return null;const u=S.patients.save({...e,...d,id});Audit.log('UPDATE','patients',id,u.name);return u},
getAll(){return S.patients.getAll().filter(p=>p.active!==false)},
getById(id){return S.patients.getById(id)},
search(t){t=t.toLowerCase();return this.getAll().filter(p=>p.name?.toLowerCase().includes(t)||p.cpf?.includes(t.replace(/\D/g,''))||p.email?.toLowerCase().includes(t))},
remove(id){const p=S.patients.getById(id);if(p){S.patients.save({...p,active:false});Audit.log('DELETE','patients',id,p.name)}},
history(pid){return{records:S.records.query(r=>r.patientId===pid).sort((a,b)=>b.date.localeCompare(a.date)),appointments:S.appointments.query(a=>a.patientId===pid).sort((a,b)=>`${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),prescriptions:S.prescriptions.query(p=>p.patientId===pid).sort((a,b)=>b.date.localeCompare(a.date)),exams:S.exams.query(e=>e.patientId===pid).sort((a,b)=>b.date.localeCompare(a.date))}}};

// Professional Service
const Profs={create(d){const p=S.professionals.save({name:d.name,cpf:d.cpf?.replace(/\D/g,''),regNumber:d.regNumber,regType:d.regType,specialty:d.specialty,role:d.role,phone:d.phone?.replace(/\D/g,''),email:d.email,unitId:d.unitId,active:true,teleconsultEnabled:d.teleconsultEnabled||false});Audit.log('CREATE','professionals',p.id,p.name);return p},
update(id,d){const e=S.professionals.getById(id);if(!e)return null;const u=S.professionals.save({...e,...d,id});Audit.log('UPDATE','professionals',id,u.name);return u},
getAll(){return S.professionals.getAll().filter(p=>p.active!==false)},
getById(id){return S.professionals.getById(id)},
getDoctors(){return this.getAll().filter(p=>p.role==='medico')},
search(t){t=t.toLowerCase();return this.getAll().filter(p=>p.name?.toLowerCase().includes(t)||p.regNumber?.toLowerCase().includes(t)||p.specialty?.toLowerCase().includes(t))},
remove(id){const p=S.professionals.getById(id);if(p){S.professionals.save({...p,active:false});Audit.log('DELETE','professionals',id,p.name)}}};

// Notification Service
const Notif={create(d){return S.notifications.save({userId:d.userId,type:d.type,title:d.title,message:d.message,relatedId:d.relatedId||null,read:false})},
byUser(uid){return S.notifications.query(n=>n.userId===uid).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))},
unreadCount(uid){return S.notifications.query(n=>n.userId===uid&&!n.read).length},
markRead(id){const n=S.notifications.getById(id);if(n){n.read=true;S.notifications.save(n)}},
markAllRead(uid){S.notifications.query(n=>n.userId===uid&&!n.read).forEach(n=>{n.read=true;S.notifications.save(n)})}};

// Appointment Service
const Appts={create(d){const conflict=S.appointments.query(a=>a.professionalId===d.professionalId&&a.date===d.date&&a.time===d.time&&a.status!=='cancelado');if(conflict.length)return{ok:false,msg:'Horário já ocupado.'};const a=S.appointments.save({patientId:d.patientId,professionalId:d.professionalId,unitId:d.unitId,date:d.date,time:d.time,type:d.type,specialty:d.specialty,status:'agendado',notes:d.notes||'',isTelemedicine:d.isTelemedicine||false,teleRoomId:d.isTelemedicine?`sghss_${Utils.uuid().slice(0,8)}`:null});Notif.create({userId:d.patientId,type:'agendamento',title:'Consulta Agendada',message:`Consulta em ${Utils.formatDate(d.date)} às ${d.time}.`,relatedId:a.id});Audit.log('CREATE','appointments',a.id,`${d.date} ${d.time}`);return{ok:true,appointment:a}},
update(id,d){const e=S.appointments.getById(id);if(!e)return null;const u=S.appointments.save({...e,...d,id});Audit.log('UPDATE','appointments',id,`status=${u.status}`);return u},
cancel(id,reason=''){const a=S.appointments.getById(id);if(!a)return;a.status='cancelado';a.cancelReason=reason;a.cancelledAt=Utils.now();S.appointments.save(a);Notif.create({userId:a.patientId,type:'cancelamento',title:'Consulta Cancelada',message:`Consulta de ${Utils.formatDate(a.date)} às ${a.time} cancelada.`,relatedId:a.id});Audit.log('CANCEL','appointments',id,reason);return a},
getAll(){return S.appointments.getAll()},
getById(id){return S.appointments.getById(id)},
byPatient(pid){return S.appointments.query(a=>a.patientId===pid).sort((a,b)=>`${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))},
byProf(pid,date=null){let r=S.appointments.query(a=>a.professionalId===pid);if(date)r=r.filter(a=>a.date===date);return r.sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))},
today(){return S.appointments.query(a=>a.date===Utils.today()).sort((a,b)=>a.time.localeCompare(b.time))},
upcoming(days=7){const lim=new Date(Date.now()+days*864e5).toISOString().split('T')[0];return S.appointments.query(a=>a.date>=Utils.today()&&a.date<=lim&&a.status!=='cancelado').sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))},
availableSlots(profId,date){const booked=S.appointments.query(a=>a.professionalId===profId&&a.date===date&&a.status!=='cancelado').map(a=>a.time);const slots=[];for(let h=8;h<18;h++)for(let m=0;m<60;m+=30){const t=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;if(!booked.includes(t))slots.push(t)}return slots}};

// Medical Records Service
const Records={create(d){const r=S.records.save({patientId:d.patientId,professionalId:d.professionalId,appointmentId:d.appointmentId||null,date:d.date||Utils.now(),type:d.type,chiefComplaint:d.chiefComplaint||'',history:d.history||'',physicalExam:d.physicalExam||'',diagnosis:d.diagnosis||'',diagnosisCID:d.diagnosisCID||'',treatmentPlan:d.treatmentPlan||'',notes:d.notes||'',vitalSigns:d.vitalSigns||{}});Audit.log('CREATE','records',r.id,`paciente ${d.patientId}`);return r},
byPatient(pid){return S.records.query(r=>r.patientId===pid).sort((a,b)=>b.date.localeCompare(a.date))},
getById(id){return S.records.getById(id)}};

// Prescription Service
const Prescriptions={create(d){const p=S.prescriptions.save({patientId:d.patientId,professionalId:d.professionalId,appointmentId:d.appointmentId||null,date:d.date||Utils.now(),items:d.items||[],status:'ativa',isDigital:d.isDigital||false,validUntil:d.validUntil||''});Audit.log('CREATE','prescriptions',p.id,`paciente ${d.patientId}`);return p},
byPatient(pid){return S.prescriptions.query(p=>p.patientId===pid).sort((a,b)=>b.date.localeCompare(a.date))},
getById(id){return S.prescriptions.getById(id)}};

// Exam Service
const Exams={create(d){const e=S.exams.save({patientId:d.patientId,professionalId:d.professionalId,type:d.type,name:d.name,date:d.date||Utils.today(),status:'solicitado',results:d.results||'',resultDate:d.resultDate||'',notes:d.notes||'',unitId:d.unitId||'',priority:d.priority||'normal'});Audit.log('CREATE','exams',e.id,e.name);return e},
update(id,d){const e=S.exams.getById(id);if(!e)return null;const u=S.exams.save({...e,...d,id});Audit.log('UPDATE','exams',id,u.name);return u},
byPatient(pid){return S.exams.query(e=>e.patientId===pid).sort((a,b)=>b.date.localeCompare(a.date))},
getAll(){return S.exams.getAll()}};

// Bed Service
const Beds={create(d){const b=S.beds.save({number:d.number,ward:d.ward,floor:d.floor,unitId:d.unitId,type:d.type,status:'disponivel',patientId:null,admissionDate:null,expectedDischarge:null});Audit.log('CREATE','beds',b.id,b.number);return b},
admit(bedId,patientId,expDis=''){const b=S.beds.getById(bedId);if(!b||b.status!=='disponivel')return{ok:false,msg:'Leito indisponível.'};b.status='ocupado';b.patientId=patientId;b.admissionDate=Utils.now();b.expectedDischarge=expDis;S.beds.save(b);Audit.log('ADMIT','beds',bedId,`paciente ${patientId}`);return{ok:true,bed:b}},
discharge(bedId){const b=S.beds.getById(bedId);if(!b)return null;const pid=b.patientId;b.status='disponivel';b.patientId=null;b.admissionDate=null;b.expectedDischarge=null;S.beds.save(b);Audit.log('DISCHARGE','beds',bedId,`paciente ${pid}`);return b},
getAll(){return S.beds.getAll()},
available(){return S.beds.query(b=>b.status==='disponivel')},
occupied(){return S.beds.query(b=>b.status==='ocupado')},
stats(){const all=this.getAll();const occ=all.filter(b=>b.status==='ocupado').length;return{total:all.length,available:all.filter(b=>b.status==='disponivel').length,occupied:occ,maintenance:all.filter(b=>b.status==='manutencao').length,rate:all.length?((occ/all.length)*100).toFixed(1):0}}};

// Supply Service
const Supplies={create(d){const s=S.supplies.save({name:d.name,category:d.category,quantity:parseInt(d.quantity)||0,minQuantity:parseInt(d.minQuantity)||10,unit:d.unit,unitId:d.unitId||'',lotNumber:d.lotNumber||'',expirationDate:d.expirationDate||'',supplier:d.supplier||'',costPerUnit:parseFloat(d.costPerUnit)||0,active:true});Audit.log('CREATE','supplies',s.id,s.name);return s},
update(id,d){const e=S.supplies.getById(id);if(!e)return null;const u=S.supplies.save({...e,...d,id});Audit.log('UPDATE','supplies',id,u.name);return u},
adjustStock(id,qty,reason=''){const s=S.supplies.getById(id);if(!s)return null;s.quantity=Math.max(0,s.quantity+qty);S.supplies.save(s);Audit.log('STOCK','supplies',id,`${qty>0?'+':''}${qty} ${reason}`);return s},
getAll(){return S.supplies.getAll().filter(s=>s.active!==false)},
lowStock(){return this.getAll().filter(s=>s.quantity<=s.minQuantity)},
expiringSoon(days=30){const lim=new Date(Date.now()+days*864e5).toISOString().split('T')[0];return this.getAll().filter(s=>s.expirationDate&&s.expirationDate<=lim&&s.expirationDate>=Utils.today())}};

// Unit Service
const Units={create(d){return S.units.save({name:d.name,type:d.type,address:d.address,phone:d.phone,manager:d.manager||'',active:true})},getAll(){return S.units.getAll().filter(u=>u.active!==false)},getById(id){return S.units.getById(id)}};

// Financial Service
const Financial={add(d){return S.financial.save({type:d.type,category:d.category,description:d.description,amount:parseFloat(d.amount)||0,date:d.date||Utils.today(),unitId:d.unitId||'',status:d.status||'pendente'})},
getAll(){return S.financial.getAll()},
summary(month,year){const recs=this.getAll().filter(r=>{const d=new Date(r.date);return d.getMonth()+1===month&&d.getFullYear()===year});const inc=recs.filter(r=>r.type==='receita').reduce((s,r)=>s+r.amount,0);const exp=recs.filter(r=>r.type==='despesa').reduce((s,r)=>s+r.amount,0);return{income:inc,expense:exp,balance:inc-exp,records:recs}}};

// Telemedicine Service
const Tele={createRoom(apptId){const a=S.appointments.getById(apptId);if(!a)return null;const room=a.teleRoomId||`sghss_${Utils.uuid().slice(0,8)}`;if(!a.teleRoomId){a.teleRoomId=room;S.appointments.save(a)}const tc=S.teleconsults.save({appointmentId:apptId,roomName:room,patientId:a.patientId,professionalId:a.professionalId,status:'aguardando',startedAt:null,endedAt:null,notes:''});Audit.log('CREATE','teleconsults',tc.id,room);return tc},
jitsiUrl(room){return`https://meet.jit.si/${room}`},
start(tcId){const tc=S.teleconsults.getById(tcId);if(!tc)return null;tc.status='em_andamento';tc.startedAt=Utils.now();S.teleconsults.save(tc);const a=S.appointments.getById(tc.appointmentId);if(a){a.status='em_atendimento';S.appointments.save(a)}return tc},
end(tcId,notes=''){const tc=S.teleconsults.getById(tcId);if(!tc)return null;tc.status='concluida';tc.endedAt=Utils.now();tc.notes=notes;S.teleconsults.save(tc);const a=S.appointments.getById(tc.appointmentId);if(a){a.status='concluido';S.appointments.save(a)}return tc},
byAppt(apptId){return S.teleconsults.query(tc=>tc.appointmentId===apptId)[0]||null},
active(){return S.teleconsults.query(tc=>tc.status==='em_andamento'||tc.status==='aguardando')}};

// Reports
const Reports={dashboard(){const today=Appts.today();const bs=Beds.stats();const ls=Supplies.lowStock();const now=new Date();const fin=Financial.summary(now.getMonth()+1,now.getFullYear());return{patients:Patients.getAll().length,professionals:Profs.getAll().length,apptsToday:today.length,apptsPending:today.filter(a=>a.status==='agendado').length,apptsCompleted:today.filter(a=>a.status==='concluido').length,apptsUpcoming:Appts.upcoming().length,beds:bs,lowStock:ls.length,expiring:Supplies.expiringSoon().length,financial:fin,teleActive:Tele.active().length,teleTotal:S.teleconsults.count()}},
apptsBySpecialty(){const map={};Appts.getAll().forEach(a=>{const k=a.specialty||'N/A';map[k]=(map[k]||0)+1});return Object.entries(map).map(([k,v])=>({specialty:k,count:v})).sort((a,b)=>b.count-a.count)}};

// SEED
async function seedData(){if(S.users.count()>0)return;
const units=[Units.create({name:'Hospital Central VidaPlus',type:'hospital',address:'Av. Brasil, 1500 - Centro',phone:'1133334444'}),Units.create({name:'Clínica Saúde do Bairro - Zona Sul',type:'clinica',address:'Rua das Flores, 200',phone:'1122225555'}),Units.create({name:'Laboratório VidaPlus',type:'laboratorio',address:'Rua Augusta, 800',phone:'1144446666'}),Units.create({name:'Home Care VidaPlus',type:'homecare',address:'Rua da Paz, 50',phone:'1155557777'})];
const wards=['Ala A','Ala B','UTI','Pediatria'];const bTypes=['enfermaria','UTI','semi-intensiva','pediatria'];
for(let i=1;i<=20;i++)Beds.create({number:`L${String(i).padStart(3,'0')}`,ward:wards[i%4],floor:Math.ceil(i/5),unitId:units[0].id,type:bTypes[i%4]});
[{name:'Paracetamol 500mg',category:'medicamento',quantity:500,minQuantity:100,unit:'comprimido',costPerUnit:.15},{name:'Dipirona 1g',category:'medicamento',quantity:300,minQuantity:80,unit:'comprimido',costPerUnit:.20},{name:'Soro Fisiológico 500ml',category:'medicamento',quantity:200,minQuantity:50,unit:'frasco',costPerUnit:3.50},{name:'Luvas Descartáveis P',category:'EPI',quantity:50,minQuantity:100,unit:'caixa',costPerUnit:18},{name:'Máscara Cirúrgica',category:'EPI',quantity:200,minQuantity:100,unit:'caixa',costPerUnit:12},{name:'Seringa 10ml',category:'material',quantity:800,minQuantity:200,unit:'unidade',costPerUnit:.40},{name:'Gaze Estéril',category:'material',quantity:15,minQuantity:50,unit:'pacote',costPerUnit:5},{name:'Amoxicilina 500mg',category:'medicamento',quantity:120,minQuantity:60,unit:'cápsula',costPerUnit:.80}].forEach(s=>Supplies.create({...s,unitId:units[0].id}));
const pats=[Patients.create({name:'Maria Silva Santos',cpf:'12345678901',birthDate:'1985-03-15',gender:'F',phone:'11999990001',email:'maria@email.com',address:'Rua A, 100',city:'São Paulo',state:'SP',bloodType:'O+',allergies:'Penicilina',healthInsurance:'Unimed',consentLGPD:true}),Patients.create({name:'João Carlos Oliveira',cpf:'98765432100',birthDate:'1970-08-22',gender:'M',phone:'11999990002',email:'joao@email.com',address:'Rua B, 200',city:'São Paulo',state:'SP',bloodType:'A+',healthInsurance:'SulAmérica',consentLGPD:true}),Patients.create({name:'Ana Beatriz Lima',cpf:'45678912300',birthDate:'1992-11-10',gender:'F',phone:'11999990003',email:'ana@email.com',address:'Av. C, 300',city:'São Paulo',state:'SP',bloodType:'B-',consentLGPD:true}),Patients.create({name:'Pedro Henrique Costa',cpf:'32165498700',birthDate:'1960-01-05',gender:'M',phone:'11999990004',email:'pedro@email.com',address:'Rua D, 400',city:'São Paulo',state:'SP',bloodType:'AB+',allergies:'Sulfa, Dipirona',consentLGPD:true}),Patients.create({name:'Fernanda Rodrigues',cpf:'65432198700',birthDate:'2000-06-20',gender:'F',phone:'11999990005',email:'fernanda@email.com',address:'Rua E, 500',city:'São Paulo',state:'SP',bloodType:'O-',consentLGPD:true})];
const profs=[Profs.create({name:'Dr. Ricardo Mendes',cpf:'11122233344',regNumber:'CRM-SP 123456',regType:'CRM',specialty:'Cardiologia',role:'medico',phone:'11988880001',email:'ricardo@vidaplus.com',unitId:units[0].id,teleconsultEnabled:true}),Profs.create({name:'Dra. Camila Ferreira',cpf:'55566677788',regNumber:'CRM-SP 654321',regType:'CRM',specialty:'Clínica Geral',role:'medico',phone:'11988880002',email:'camila@vidaplus.com',unitId:units[1].id,teleconsultEnabled:true}),Profs.create({name:'Dr. André Santos',cpf:'99988877766',regNumber:'CRM-SP 111222',regType:'CRM',specialty:'Ortopedia',role:'medico',phone:'11988880003',email:'andre@vidaplus.com',unitId:units[0].id}),Profs.create({name:'Enf. Luciana Alves',cpf:'22233344455',regNumber:'COREN-SP 789012',regType:'COREN',specialty:'Enfermagem',role:'enfermeiro',phone:'11988880004',email:'luciana@vidaplus.com',unitId:units[0].id}),Profs.create({name:'Téc. Roberto Lima',cpf:'66677788899',regNumber:'COREN-SP 345678',regType:'COREN',specialty:'Técnico Enfermagem',role:'tecnico',phone:'11988880005',email:'roberto@vidaplus.com',unitId:units[0].id}),Profs.create({name:'Dra. Patrícia Souza',cpf:'33344455566',regNumber:'CRM-SP 333444',regType:'CRM',specialty:'Pediatria',role:'medico',phone:'11988880006',email:'patricia@vidaplus.com',unitId:units[1].id,teleconsultEnabled:true})];
await Auth.createUser({name:'Administrador VidaPlus',email:'admin@vidaplus.com',password:'admin123',role:'admin'});
await Auth.createUser({name:'Dr. Ricardo Mendes',email:'ricardo@vidaplus.com',password:'med123',role:'medico',profileId:profs[0].id});
await Auth.createUser({name:'Dra. Camila Ferreira',email:'camila@vidaplus.com',password:'med123',role:'medico',profileId:profs[1].id});
await Auth.createUser({name:'Enf. Luciana Alves',email:'luciana@vidaplus.com',password:'enf123',role:'enfermeiro',profileId:profs[3].id});
await Auth.createUser({name:'Maria Silva Santos',email:'maria@email.com',password:'pac123',role:'paciente',profileId:pats[0].id});
await Auth.createUser({name:'Recepção Central',email:'recepcao@vidaplus.com',password:'rec123',role:'recepcionista'});
const t=Utils.today();const t1=new Date(Date.now()+864e5).toISOString().split('T')[0];const t2=new Date(Date.now()+2*864e5).toISOString().split('T')[0];
Appts.create({patientId:pats[0].id,professionalId:profs[0].id,unitId:units[0].id,date:t,time:'09:00',type:'consulta',specialty:'Cardiologia'});
Appts.create({patientId:pats[1].id,professionalId:profs[1].id,unitId:units[1].id,date:t,time:'10:00',type:'consulta',specialty:'Clínica Geral'});
Appts.create({patientId:pats[2].id,professionalId:profs[0].id,unitId:units[0].id,date:t,time:'14:00',type:'retorno',specialty:'Cardiologia'});
Appts.create({patientId:pats[3].id,professionalId:profs[2].id,unitId:units[0].id,date:t1,time:'08:30',type:'consulta',specialty:'Ortopedia'});
Appts.create({patientId:pats[4].id,professionalId:profs[5].id,unitId:units[1].id,date:t1,time:'11:00',type:'consulta',specialty:'Pediatria'});
Appts.create({patientId:pats[0].id,professionalId:profs[1].id,unitId:units[1].id,date:t2,time:'15:00',type:'teleconsulta',specialty:'Clínica Geral',isTelemedicine:true});
Records.create({patientId:pats[0].id,professionalId:profs[0].id,type:'consulta',chiefComplaint:'Dor torácica esporádica',diagnosis:'Angina estável',diagnosisCID:'I20.8',treatmentPlan:'Betabloqueador, acompanhamento mensal',vitalSigns:{pa:'130/85',fc:78,temp:36.5,sat:97}});
Records.create({patientId:pats[1].id,professionalId:profs[1].id,type:'consulta',chiefComplaint:'Check-up anual',diagnosis:'Hipertensão arterial leve',diagnosisCID:'I10',treatmentPlan:'Dieta hipossódica, atividade física',vitalSigns:{pa:'145/90',fc:72,temp:36.2,sat:98}});
Prescriptions.create({patientId:pats[0].id,professionalId:profs[0].id,items:[{medication:'Atenolol 50mg',dosage:'1 comprimido',frequency:'1x ao dia',duration:'30 dias',notes:'Manhã, em jejum'},{medication:'AAS 100mg',dosage:'1 comprimido',frequency:'1x ao dia',duration:'Uso contínuo',notes:'Após almoço'}],isDigital:true});
Exams.create({patientId:pats[0].id,professionalId:profs[0].id,type:'laboratorial',name:'Hemograma Completo',status:'concluido',results:'Hemoglobina: 14.2 g/dL, Leucócitos: 7.500/mm³, Plaquetas: 250.000/mm³'});
Exams.create({patientId:pats[0].id,professionalId:profs[0].id,type:'imagem',name:'Eletrocardiograma',status:'concluido',results:'Ritmo sinusal, sem alterações'});
Exams.create({patientId:pats[1].id,professionalId:profs[1].id,type:'laboratorial',name:'Glicemia de Jejum',status:'solicitado'});
const beds=Beds.getAll();Beds.admit(beds[0].id,pats[3].id,t2);Beds.admit(beds[4].id,pats[1].id,t1);
Financial.add({type:'receita',category:'Consultas',description:'Consultas do dia',amount:4500,date:t,status:'pago'});
Financial.add({type:'receita',category:'Exames',description:'Exames laboratoriais',amount:2800,date:t,status:'pago'});
Financial.add({type:'despesa',category:'Suprimentos',description:'Reposição de medicamentos',amount:1200,date:t,status:'pago'});
Financial.add({type:'despesa',category:'Folha',description:'Salários equipe médica',amount:85000,date:t,status:'pendente'});
Financial.add({type:'receita',category:'Internações',description:'Diárias de internação',amount:12000,date:t,status:'pendente'});
console.log('✅ Seed data loaded')}
