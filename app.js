const KEY='dc_store_v2';
const defaultState={
  user:null, cart:[], orders:[], favorites:[],
  products:[
    {id:1,name:'Pulse Air Pro',cat:'electronics',price:7990,desc:'Компактный гаджет для повседневного использования.',badge:'NEW'},
    {id:2,name:'Core Wireless',cat:'electronics',price:4990,desc:'Минималистичный аксессуар с удобным форм-фактором.',badge:'TOP'},
    {id:3,name:'Drip Essential Tee',cat:'clothing',price:2990,desc:'Базовая футболка в стиле streetwear.',badge:'NEW'},
    {id:4,name:'Oversize Hoodie',cat:'clothing',price:6490,desc:'Плотное худи свободного кроя.',badge:'SALE'},
    {id:5,name:'Device One',cat:'vape',price:0,desc:'Возрастная категория. Доступность зависит от законодательства.',badge:'18+'},
    {id:6,name:'Liquid Line',cat:'liquids',price:0,desc:'Возрастная категория. Доступность зависит от законодательства.',badge:'18+'}
  ],
  news:[
    {title:'Новая коллекция',text:'Добавили новые позиции в каталог.'},
    {title:'Акция недели',text:'Следите за разделом акций — предложения обновляются.'}
  ]
};
let state=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(defaultState);
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const rub=n=>n?new Intl.NumberFormat('ru-RU').format(n)+' ₽':'По запросу';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const toast=m=>{const t=document.querySelector('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)};
const modal=(html)=>{document.querySelector('#modal').innerHTML=html;document.querySelector('#modalBackdrop').classList.remove('hidden')};
const closeModal=()=>document.querySelector('#modalBackdrop').classList.add('hidden');
document.querySelector('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});

function renderProducts(cat='all',query=''){
  const grid=document.querySelector('#productGrid');
  const items=state.products.filter(p=>(cat==='all'||p.cat===cat)&&(!query||p.name.toLowerCase().includes(query.toLowerCase())));
  grid.innerHTML=items.length?items.map(p=>`<article class="product">
    <div class="product-img"><span class="badge">${esc(p.badge||'NEW')}</span><div class="fake-img"></div></div>
    <div class="product-body"><div class="product-cat">${catName(p.cat)}</div><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
    <div class="price-row"><span class="price">${rub(p.price)}</span><button class="add" data-add="${p.id}">${p.price?'В корзину':'Подробнее'}</button></div></div>
  </article>`).join(''):'<div class="notice">Ничего не найдено.</div>';
  grid.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addToCart(+b.dataset.add));
}
function catName(c){return {electronics:'Электроника',clothing:'Одежда',vape:'Вейпы',liquids:'Жидкости'}[c]||c}
function updateCart(){
  document.querySelector('#cartCount').textContent=state.cart.reduce((s,i)=>s+i.qty,0);
  const box=document.querySelector('#cartItems');
  if(!state.cart.length){box.innerHTML='<div class="notice" style="margin-top:20px">Корзина пока пустая.</div>';document.querySelector('#cartTotal').textContent='0 ₽';return}
  let total=0;
  box.innerHTML=state.cart.map(i=>{const p=state.products.find(x=>x.id===i.id);if(!p)return'';total+=p.price*i.qty;return `<div class="cart-item"><div class="thumb"></div><div><b>${esc(p.name)}</b><br><small>${i.qty} × ${rub(p.price)}</small><br><button data-remove="${p.id}">Удалить</button></div><strong>${rub(p.price*i.qty)}</strong></div>`}).join('');
  document.querySelector('#cartTotal').textContent=rub(total);
  box.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.cart=state.cart.filter(i=>i.id!==+b.dataset.remove);save();updateCart()});
}
function addToCart(id){
  const p=state.products.find(x=>x.id===id); if(!p)return;
  if(!p.price){modal(`<div class="close-line"><h2>${esc(p.name)}</h2><button onclick="closeModal()">×</button></div><div class="notice">Эта категория может быть возрастно ограниченной. Для таких товаров сайт должен применять обязательную проверку возраста и требования законодательства. Продолжение покупки в этой демо-версии отключено.</div>`);return}
  const x=state.cart.find(i=>i.id===id);x?x.qty++:state.cart.push({id,qty:1});save();updateCart();toast('Добавлено в корзину');
}
function openProfile(){
  if(!state.user){modal(`<div class="close-line"><h2>Личный кабинет</h2><button onclick="closeModal()">×</button></div>
    <div class="tabs"><button class="active">Вход</button><button id="regTab">Регистрация</button></div>
    <form class="form" id="loginForm"><label>Email<input required type="email" name="email" placeholder="you@example.com"></label><label>Пароль<input required type="password" name="password" placeholder="••••••••"></label><button class="primary">Войти</button></form>
    <p class="notice">Это локальная демонстрация интерфейса. Для реальной авторизации нужен сервер/база данных.</p>`);
    document.querySelector('#regTab').onclick=registerForm;
  } else profileView();
}
function registerForm(){
  document.querySelector('#modal').innerHTML=`<div class="close-line"><h2>Регистрация</h2><button onclick="closeModal()">×</button></div><form class="form" id="regForm"><label>Имя<input required name="name"></label><label>Email<input required type="email" name="email"></label><label>Телефон<input name="phone"></label><label>Пароль<input required minlength="6" type="password" name="password"></label><button class="primary">Создать аккаунт</button></form>`;
  document.querySelector('#regForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.user={name:f.get('name'),email:f.get('email'),phone:f.get('phone')};save();closeModal();toast('Аккаунт создан')};
}
function profileView(){
  const orders=state.orders;
  modal(`<div class="close-line"><h2>Привет, ${esc(state.user.name)}</h2><button onclick="closeModal()">×</button></div>
  <div class="tabs"><button class="active">Профиль</button><button id="ordersTab">Заказы (${orders.length})</button></div>
  <div class="notice"><b>${esc(state.user.email)}</b><br>${esc(state.user.phone||'Телефон не указан')}</div>
  <div style="height:12px"></div><button class="secondary" id="logout">Выйти</button>`);
  document.querySelector('#logout').onclick=()=>{state.user=null;save();closeModal();toast('Вы вышли')};
  document.querySelector('#ordersTab').onclick=()=>ordersView();
}
function ordersView(){
  modal(`<div class="close-line"><h2>Мои заказы</h2><button onclick="closeModal()">×</button></div>${state.orders.length?state.orders.map(o=>`<div class="order-card"><b>Заказ #${o.id}</b><br><small>${new Date(o.date).toLocaleString('ru-RU')}</small><p>${esc(o.status)}</p><div class="progress">${[1,2,3,4,5].map((_,i)=>`<span class="step ${i<o.step?'done':''}"></span>`).join('')}</div><button class="secondary" onclick="trackOrder('${o.id}')">Открыть отслеживание</button></div>`).join(''):'<div class="notice">Заказов пока нет.</div>')}`);
}
function trackOrder(id){
 const o=state.orders.find(x=>x.id==id); if(!o)return;
 modal(`<div class="close-line"><h2>Заказ #${o.id}</h2><button onclick="closeModal()">×</button></div><div class="order-card"><b>${esc(o.status)}</b><div class="progress">${['Создан','Подтверждён','Собирается','В пути','Прибыл'].map((x,i)=>`<div><span class="step ${i<o.step?'done':''}" style="display:block"></span><small>${x}</small></div>`).join('')}</div><p>Ожидаемая дата: <b>${esc(o.eta||'уточняется')}</b></p></div>`);
}
function checkout(){
 if(!state.cart.length)return toast('Корзина пустая');
 if(!state.user){openProfile();return}
 const items=state.cart.map(i=>({id:i.id,qty:i.qty,name:state.products.find(p=>p.id===i.id)?.name}));
 const id=Math.floor(100000+Math.random()*899999);
 state.orders.unshift({id,date:Date.now(),items,status:'Заказ создан',step:1,eta:'уточняется'});
 state.cart=[];save();updateCart();document.querySelector('#cartDrawer').classList.remove('open');
 modal(`<div class="close-line"><h2>Заказ #${id} создан</h2><button onclick="closeModal()">×</button></div><div class="notice">Заказ сохранён. В рабочей версии сюда подключаются реальная база данных, уведомления и логистика.</div><div style="height:12px"></div><button class="primary" onclick="trackOrder('${id}')">Отслеживать заказ</button>`);toast('Заказ создан');
}
function admin(){
 modal(`<div class="close-line"><h2>Админ-панель</h2><button onclick="closeModal()">×</button></div><form class="form" id="adminForm"><label>Пароль<input required type="password" name="pass"></label><button class="primary">Войти</button></form><p class="notice">В этой демо-версии панель работает локально. Перед реальным запуском пароль должен проверяться на сервере, а не в JavaScript.</p>`);
 document.querySelector('#adminForm').onsubmit=e=>{e.preventDefault();if(new FormData(e.target).get('pass')==='admin123'){adminPanel()}else toast('Неверный пароль')};
}
function adminPanel(){
 modal(`<div class="close-line"><h2>Админ</h2><button onclick="closeModal()">×</button></div>
 <div class="tabs"><button class="active">Товары</button><button id="aOrders">Заказы</button></div>
 <div class="form"><label>Название<input id="aName"></label><label>Цена<input id="aPrice" type="number"></label><label>Категория<select id="aCat"><option value="electronics">Электроника</option><option value="clothing">Одежда</option><option value="vape">Вейпы</option><option value="liquids">Жидкости</option></select></label><label>Описание<textarea id="aDesc"></textarea></label><button class="primary" id="aAdd">Добавить товар</button></div>
 <div style="height:16px"></div><div class="notice">Товаров: ${state.products.length}. Для реальной работы фотографии и данные нужно хранить в облачной БД/Storage.</div>`);
 document.querySelector('#aAdd').onclick=()=>{const name=document.querySelector('#aName').value.trim();if(!name)return toast('Введите название');state.products.push({id:Date.now(),name,price:+document.querySelector('#aPrice').value||0,cat:document.querySelector('#aCat').value,desc:document.querySelector('#aDesc').value||'',badge:'NEW'});save();renderProducts();toast('Товар добавлен')};
 document.querySelector('#aOrders').onclick=adminOrders;
}
function adminOrders(){
 modal(`<div class="close-line"><h2>Заказы</h2><button onclick="closeModal()">×</button></div>${state.orders.length?state.orders.map(o=>`<div class="order-card"><b>#${o.id}</b><p>${esc(o.status)}</p><select data-status="${o.id}"><option>Заказ создан</option><option>Подтверждён</option><option>Собирается</option><option>В пути</option><option>Прибыл</option></select></div>`).join(''):'<div class="notice">Заказов нет.</div>'}`);
 document.querySelectorAll('[data-status]').forEach(s=>s.onchange=()=>{const o=state.orders.find(x=>x.id==s.dataset.status);o.status=s.value;o.step=['Заказ создан','Подтверждён','Собирается','В пути','Прибыл'].indexOf(s.value)+1;save();toast('Статус обновлён')});
}
function showNews(){modal(`<div class="close-line"><h2>Новости и акции</h2><button onclick="closeModal()">×</button></div>${state.news.map(n=>`<div class="order-card"><b>${esc(n.title)}</b><p>${esc(n.text)}</p></div>`).join('')}`)}
function support(){modal(`<div class="close-line"><h2>Поддержка</h2><button onclick="closeModal()">×</button></div><p>Есть вопрос по товару или заказу?</p><a class="primary" style="display:inline-block" href="https://t.me/s88xy" target="_blank" rel="noopener">Открыть Telegram @s88xy</a>`)}
function route(view){if(view==='catalog'){document.querySelector('#catalogSection').scrollIntoView({behavior:'smooth'});return}if(view==='profile'){openProfile();return}if(view==='news'){showNews();return}if(view==='support'){support();return}window.scrollTo({top:0,behavior:'smooth'})}
document.addEventListener('click',e=>{const v=e.target.closest('[data-view]')?.dataset.view;if(v)route(v);const c=e.target.closest('[data-category]')?.dataset.category;if(c){document.querySelector('#catalogSection').scrollIntoView({behavior:'smooth'});document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x.dataset.category===c));renderProducts(c)}});
document.querySelector('#cartBtn').onclick=()=>{document.querySelector('#cartDrawer').classList.add('open');updateCart()};
document.querySelector('#closeCart').onclick=()=>document.querySelector('#cartDrawer').classList.remove('open');
document.querySelector('#checkoutBtn').onclick=checkout;
document.querySelector('#profileBtn').onclick=openProfile;
document.querySelector('#adminOpen').onclick=admin;
document.querySelector('#searchBtn').onclick=()=>document.querySelector('#searchRow').classList.toggle('hidden');
document.querySelector('#searchInput').oninput=e=>renderProducts(document.querySelector('.filter.active')?.dataset.category||'all',e.target.value);
document.querySelector('#clearSearch').onclick=()=>{document.querySelector('#searchInput').value='';renderProducts()};
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(b.dataset.category)});
renderProducts();updateCart();
