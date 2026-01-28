import { Pokedex } from './components/Pokedex'
import { LanguageProvider } from './i18n/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <Pokedex />
    </LanguageProvider>
  )
}

export default App
