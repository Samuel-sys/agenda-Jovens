import { Timestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'

const $form = document.querySelector('#form-evento')
const $grupo = document.querySelector('#grupo')
const $titulo = document.querySelector('#titulo')
const $detalhes = document.querySelector('#detalhes')
const $data = document.querySelector('#data')
const $ano = document.querySelector('#ano')

const $tipo_evento = document.querySelector('#tipo_evento')

window.onload = () => {
  $ano.value = new Date().toLocaleDateString('pt-BR', { year: 'numeric' })
}

$tipo_evento.addEventListener('change', () => {
  console.log($tipo_evento.checked)

  if ($tipo_evento.checked) {
    document.querySelector('#tipo_recorrente').style.display = 'block'
    document.querySelector('#tipo_data').style.display = 'none'
    campoData.required = false // torna opcional
  } else {
    document.querySelector('#tipo_recorrente').style.display = 'none'
    document.querySelector('#tipo_data').style.display = 'block'
    campoData.required = true // torna obrigatório
  }
})

$form.addEventListener('submit', async function (e) {
  e.preventDefault()

  const grupo = $grupo.value
  const titulo = $titulo.value
  const detalhes = $detalhes.value

  if (!grupo || !titulo || !detalhes) {
    alert('Preencha todos os campos!')
    return
  }

  try {
    if ($tipo_evento.checked) {
      // Evento recorrente
      const ano = Number($ano.value)
      const semana = document.querySelector('#tipo_recorrente select').value
      const diaSemana = document.querySelector(
        'input[name="dia_semana"]:checked'
      ).value

      const datas = getDatasRecorrentes(ano, semana, diaSemana)

      for (const data of datas) {
        const dataTimestamp = Timestamp.fromDate(data)
        const docRef = window.firebaseDoc(
          window.firebaseCollection(window.firebaseDB, 'eventos')
        )

        await window.firebaseSetDoc(docRef, {
          grupo,
          titulo,
          detalhes,
          data: dataTimestamp,
          ativo: true
        })
      }

      alert(`Foram salvos ${datas.length} eventos recorrentes com sucesso!`)
    } else {
      // Evento único
      const data = $data.value
      const dataTimestamp = Timestamp.fromDate(new Date(data))

      const docRef = window.firebaseDoc(
        window.firebaseCollection(window.firebaseDB, 'eventos')
      )

      await window.firebaseSetDoc(docRef, {
        grupo,
        titulo,
        detalhes,
        data: dataTimestamp,
        ativo: true
      })

      alert('Evento salvo com sucesso!')
    }

    document.getElementById('form-evento').reset()
  } catch (error) {
    console.error('Erro ao salvar evento:', error)
    alert('Erro ao salvar evento.')
  }
})

// $form.addEventListener('submit', async function (e) {
//   e.preventDefault()
// //Pega os dados preenchidos no formulário
//   const grupo = $grupo.value
//   const titulo = $titulo.value
//   const detalhes = $detalhes.value
//   const data = $data.value

//   //se o usuario não preencheu todos os campos, não envia o formulário
//   if (!grupo || !titulo || !detalhes || !data) {
//     alert('Preencha todos os campos!')
//     return
//   }

//   //converte a data para um objeto Timestamp
//   const dataTimestamp = Timestamp.fromDate(new Date(data))

//   try {
//     const docRef = window.firebaseDoc(
//       window.firebaseCollection(window.firebaseDB, 'eventos')
//     )

//     //salva o evento no Firestore (campo ID e gerado automaticamente pelo Firebase)
//     await window.firebaseSetDoc(docRef, {
//       grupo,
//       titulo,
//       detalhes,
//       data: dataTimestamp,
//       ativo: true
//     })

//     alert('Evento salvo com sucesso!')
//     document.getElementById('form-evento').reset()
//   } catch (error) {
//     console.error('Erro ao salvar evento:', error)
//     alert('Erro ao salvar evento.')
//   }
// })

const diasSemanaMap = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6
}

function getDatasRecorrentes (ano, numeroSemana, diaSemana) {
  const datas = []
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0) // zera horas para comparação

  for (let mes = 0; mes < 12; mes++) {
    let contadorSemana = 0

    for (let dia = 1; dia <= 31; dia++) {
      const data = new Date(ano, mes, dia)

      if (data.getMonth() !== mes) break // mês virou, para

      if (data.getDay() === diasSemanaMap[diaSemana]) {
        contadorSemana++

        if (contadorSemana === Number(numeroSemana)) {
          if (data >= hoje) {
            datas.push(data) // só adiciona se for hoje ou futuro
          }
          break
        }
      }
    }
  }

  return datas
}
