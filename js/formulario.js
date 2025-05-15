import { Timestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'

const $form = document.querySelector('#form-evento')
const $grupo = document.querySelector('#grupo')
const $titulo = document.querySelector('#titulo')
const $detalhes = document.querySelector('#detalhes')
const $data = document.querySelector('#data')
$form.addEventListener('submit', async function (e) {
  e.preventDefault()
//Pega os dados preenchidos no formulário
  const grupo = $grupo.value
  const titulo = $titulo.value
  const detalhes = $detalhes.value
  const data = $data.value

  //se o usuario não preencheu todos os campos, não envia o formulário
  if (!grupo || !titulo || !detalhes || !data) {
    alert('Preencha todos os campos!')
    return
  }

  //converte a data para um objeto Timestamp
  const dataTimestamp = Timestamp.fromDate(new Date(data))


  try {
    const docRef = window.firebaseDoc(
      window.firebaseCollection(window.firebaseDB, 'eventos')
    )

    //salva o evento no Firestore (campo ID e gerado automaticamente pelo Firebase)
    await window.firebaseSetDoc(docRef, {
      grupo,
      titulo,
      detalhes,
      data: dataTimestamp,
      ativo: true
    })

    alert('Evento salvo com sucesso!')
    document.getElementById('form-evento').reset()
  } catch (error) {
    console.error('Erro ao salvar evento:', error)
    alert('Erro ao salvar evento.')
  }
})
