import FamilyTree from './components/FamilyTree'
import familyData from './data/familyData.json'
import './App.css'

function App() {
  return (
    <div className="App">
      <FamilyTree familyMembers={familyData.familyMembers} />
    </div>
  )
}

export default App
