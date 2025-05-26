//Captura as DOMs do site
const $calendarioEl = document.querySelector('.calendario')
const $eventListEl = document.querySelector('#event-list')
const $eventDetailEl = document.querySelector('#event-detail')
const $eventDateEl = document.querySelector('#event-date')
// const $cabecalho = document.querySelector('#cabecalho') não estamos utilizando por hora
const $mes = document.querySelector('#mes')
const $ano = document.querySelector('#ano')

//Registra a data de consulta da agenda
let today = new Date()
let year = today.getFullYear()
let month = today.getMonth() // 0 = janeiro

let selectedDay = null

// Simulação de eventos (exemplo)
let eventos_agenda 

window.onload = () => generateCalendario()

//Evento para selecionar o Mês da agenda
$mes.onclick = () => {
  //assim ele vai criar uma lista com os meses para evitar erro de gramatica
  const meses = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i)
      .toLocaleDateString('pt-BR', { month: 'long' })
      .toUpperCase()
  )

  setModoCalendario('meses') //muda o estilo do calendario

  // Limpa o calendário antes de gerar
  $calendarioEl.innerHTML = ''

  // Cria os botões de meses e adiciona um evento de clique para selecionar um mês
  meses.forEach((element, x) => {
    const mes = document.createElement('div')
    mes.classList.add('mes')
    mes.innerHTML = element
    if (
      today.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase() ==
      element
    )
      mes.classList.add('selected')
    $calendarioEl.appendChild(mes)

    // Adiciona um evento de clique para selecionar o mês
    mes.onclick = () => {
      today.setMonth(x)
      year = today.getFullYear()
      month = today.getMonth()
      $calendarioEl.style = ''
      generateCalendario()
    }
  })
}

//Evento para selecionar o ano da agenda
$ano.addEventListener('input', () => {
  today.setFullYear($ano.value)
  year = today.getFullYear()
  month = today.getMonth()
  $calendarioEl.style = ''
  generateCalendario()
})

//Evento de comunicação do firebase com o site
import { buscarEventosDoMesAtual } from './sdk_firebase.js'

async function generateCalendario () {
  eventos_agenda = await buscarEventosDoMesAtual(year, month)

  // Atualiza o valor do campo de data
  $eventDateEl.value = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric'}).toUpperCase
  $mes.value = today
    .toLocaleDateString('pt-BR', { month: 'long' })
    .toUpperCase()
  $ano.value = today
    .toLocaleDateString('pt-BR', { year: 'numeric' })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate() // último dia do mês

  // Limpa o calendário antes de gerar
  $calendarioEl.innerHTML = ''

  // Espaços em branco para alinhar os dias
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div')
    empty.classList.add('day')
    empty.style = 'background:rgb(186, 185, 185)' // cor cinza para os dias antes do primeiro
    $calendarioEl.appendChild(empty)
  }

  // Preenche os dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement('div')
    div.className = 'day'
    div.textContent = day

    //Verifica se tem algum evento no dia
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`
    const dayEvents = eventos_agenda[dateStr]
    if (dayEvents) {
      const grupos = [...new Set(dayEvents.map(e => e.grupo))] //Verifica se tem mais de um grupo
      if (grupos.length === 2)
        div.classList.add('ambos') // se tiver evento dos 2 grupos
      else if (grupos.includes('UMADEB'))
        div.classList.add('umadeb') // se tiver evento umadeb
      else if (grupos.includes('UMADEB E CREIO'))
        div.classList.add('ambos') // se tiver evento dos 2 grupos
      else if (grupos.includes('CREIO')) div.classList.add('creio') // se tiver evento creio
    }

    div.onclick = () => selectDay(dateStr, day)

    $calendarioEl.appendChild(div)
  }
}

// Função para selecionar um dia e atualizar o calendário e a lista de eventos
function selectDay (dateStr, day) {
  const dias = document.querySelectorAll('.day')
  dias.forEach(d => d.classList.remove('selected'))
  const selected = Array.from(dias).find(d => d.textContent == day)
  if (selected) selected.classList.add('selected')

  selectedDay = dateStr
  updateEventList(dateStr)
}

function updateEventList (dateStr) {
  const dayEvents = eventos_agenda[dateStr] || []
  $eventDateEl.textContent = `Eventos dia ${dateStr.slice(8)}/${dateStr.slice(
    5,
    7
  )}`
  $eventListEl.innerHTML = ''

  if (dayEvents.length === 0) {
    $eventListEl.innerHTML = '<p class="text-white">Sem eventos nesse dia.</p>'
    $eventDetailEl.innerHTML = 'Selecione um evento para mais detalhes...'
    return
  }

  dayEvents.forEach((e, i) => criarCardEvento(e))

  $eventDetailEl.innerHTML = 'Selecione um evento para mais detalhes...'
}

function criarCardEvento (e) {
  const card = document.createElement('div')
  card.className = 'event-card'
  card.textContent = `${e.grupo} – ${e.titulo}`

  //escreve o evnto no campo de detalhes do evento
  card.onclick = () => {
    $eventDetailEl.innerHTML = `<strong>${e.grupo}</strong><br><br>${e.titulo}<br><small>${e.detalhe}</small>`
  }
  $eventListEl.appendChild(card)
}

function setModoCalendario (modo) {
  //adapta o calendario de acordo com o modo escolhido
  if (modo === 'meses') {
    $calendarioEl.style.gridTemplateColumns = 'repeat(4, 1fr)'
  } else {
    $calendarioEl.style.gridTemplateColumns = 'repeat(7, 1fr)'
  }
}

const $captura = document.getElementById('btn-baixar-calendario')
$captura.addEventListener('click', () => {
  const $agenda = document.querySelector('.agenda')
  const $cabecalho = document.querySelector('#cabecalho')

  // $cabecalho.innerHTML = `<h1>${$mes.value} DE ${$ano.value} </h1>`
  const h1 = document.createElement('h1')
  h1.textContent = `${$mes.value} DE ${$ano.value}`
  h1.style.width = '100%' 
  h1.style.textAlign = 'center' 
  $agenda.prepend(h1) // preciso dele no topo e não embaixo ****

  const dias = document.querySelectorAll('.day')
  dias.forEach(d => d.classList.remove('selected'))

  if (!$agenda) {
    alert('Calendário não encontrado.')
    return
  }

  document.querySelector('#esconder').style.display = 'none'
  $cabecalho.style.display = 'none' // oculta o botão após o clique
  $captura.style.display = 'none' // oculta o botão após o clique

  html2canvas($agenda).then(canvas => {
    const link = document.createElement('a')
    link.download = 'calendario.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  })

  document.querySelector('#esconder').style.display = 'block'
  $cabecalho.style.display = 'flex'
  $captura.style.display = 'block'
  $agenda.removeChild(h1)
})
