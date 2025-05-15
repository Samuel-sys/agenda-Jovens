import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  query, // <-- ESSENCIAL
  where, // <-- ESSENCIAL
  Timestamp // <-- ESSENCIAL
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'

const firebaseConfig = {
  apiKey: 'AIzaSyCD0l83cdjhthcBsDtMOlyHRBIpqwenJnY',
  authDomain: 'agendaumacreio.firebaseapp.com',
  projectId: 'agendaumacreio',
  storageBucket: 'agendaumacreio.firebasestorage.app',
  messagingSenderId: '736818466697',
  appId: '1:736818466697:web:a566456543d41e84afdb58'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Expondo para uso no restante do código
window.firebaseDB = db
window.firebaseCollection = collection
window.firebaseSetDoc = setDoc
window.firebaseGetDocs = getDocs
window.firebaseDoc = doc

// Função para buscar eventos do mês atual
export async function buscarEventosDoMesAtual (year, month) {
  const primeiroDia = new Date(year, month, 1)
  const ultimoDia = new Date(year, month + 1, 1) // Exclusivo no Firestore

  const q = query(
    collection(db, 'eventos'),
    where('data', '>=', Timestamp.fromDate(primeiroDia)),
    where('data', '<', Timestamp.fromDate(ultimoDia)),
    where('ativo', '==', true)
  )

  const querySnapshot = await getDocs(q)
  const eventos = {}

  querySnapshot.forEach(doc => {
    const data = doc.data().data.toDate()
    const dataStr = data.toISOString().slice(0, 10)

    // Monta o objeto de evento
    const evento = {
      grupo: doc.data().grupo.toUpperCase(),
      titulo: doc.data().titulo,
      detalhe: doc.data().detalhes,
      id: doc.id
    }

    // Adiciona ao objeto final, agrupando por data
    if (!eventos[dataStr]) {
      eventos[dataStr] = []
    }
    eventos[dataStr].push(evento)
  })

  console.log(eventos)
  return eventos
}