import FamilyTree from './components/FamilyTree'
import familyData from './data/familyData.json'
import './App.css'

function App() {
  console.log('App loaded - Family data:', familyData);
  console.log('Total family members:', familyData.familyMembers?.length);

  return (
    <div className="App">
      <FamilyTree familyMembers={familyData.familyMembers} />
    </div>
  )
}

export default App
